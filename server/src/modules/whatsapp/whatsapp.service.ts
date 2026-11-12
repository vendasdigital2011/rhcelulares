import { env } from '../../config/index.js';
import { pool } from '../../db/client.js';
import { EvolutionService } from './evolution.service.js';

export interface SendMessageParams {
  to: string;
  message: string;
  chatId?: string;
  senderName?: string;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  status: 'sent' | 'simulated' | 'failed';
  error?: string;
}

export interface MetaConnectionStatus {
  configured: boolean;
  phoneNumberIdMasked?: string;
  wabaIdMasked?: string;
  graphApiVersion: string;
  webhookConfigured: boolean;
  mode: 'official_cloud_api' | 'simulated_dev';
}

/**
 * Normaliza número de telefone brasileiro para formato E.164 da Meta (ex: 5577999998888)
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55')) {
    return digits;
  }
  return `55${digits}`;
}

/**
 * Envia mensagem de texto via Meta WhatsApp Cloud API Oficial
 */
export async function sendWhatsAppCloudMessage(params: SendMessageParams): Promise<SendMessageResult> {
  const normalizedPhone = normalizePhoneForWhatsApp(params.to);

  if (!normalizedPhone) {
    return {
      success: false,
      status: 'failed',
      error: 'Número de telefone do destinatário inválido',
    };
  }

  // Prioridade 1: Evolution API (Se configurada)
  if (env.EVOLUTION_API_URL && env.EVOLUTION_API_KEY) {
    const evoResult = await EvolutionService.sendTextMessage(normalizedPhone, params.message.trim());
    if (evoResult.success) {
      console.log(`✅ [Evolution API] Mensagem enviada para ${normalizedPhone} (ID: ${evoResult.messageId})`);
      return {
        success: true,
        messageId: evoResult.messageId,
        status: 'sent',
      };
    } else {
      console.warn(`⚠️ [Evolution API] Tentativa de envio falhou (${evoResult.error}), checando fallbacks...`);
    }
  }

  // Prioridade 2: Meta Cloud API Oficial
  const token = env.META_ACCESS_TOKEN;
  const phoneNumberId = env.META_PHONE_NUMBER_ID;

  if (token && phoneNumberId) {
    try {
      const url = `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: params.message.trim(),
          },
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        console.error('❌ Erro na Graph API da Meta:', data);
        return {
          success: false,
          status: 'failed',
          error: data.error?.message || 'Falha na API da Meta',
        };
      }

      const wamid = data.messages?.[0]?.id || `wamid-${Date.now()}`;
      console.log(`✅ Mensagem enviada via Meta Cloud API para ${normalizedPhone} (ID: ${wamid})`);

      return {
        success: true,
        messageId: wamid,
        status: 'sent',
      };
    } catch (err: any) {
      console.error('❌ Exceção ao chamar Meta Cloud API:', err.message);
      return {
        success: false,
        status: 'failed',
        error: err.message,
      };
    }
  }

  // Fallback em modo simulado/desenvolvimento (quando credenciais da Meta ainda não foram informadas no .env)
  console.log(`📱 [WhatsApp Simulado/Dev] Mensagem para ${normalizedPhone}: "${params.message}"`);
  return {
    success: true,
    messageId: `simulated-wamid-${Date.now()}`,
    status: 'simulated',
  };
}

/**
 * Processa a carga bruta do webhook recebido da Meta
 */
export async function parseMetaWebhookPayload(rawPayload: any): Promise<Array<{
  senderPhone: string;
  senderName: string;
  messageText: string;
  wamid: string;
  timestamp: string;
}>> {
  const results: Array<{
    senderPhone: string;
    senderName: string;
    messageText: string;
    wamid: string;
    timestamp: string;
  }> = [];

  try {
    const entry = rawPayload?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.messages && Array.isArray(value.messages)) {
      const contacts = value.contacts || [];
      const contactMap = new Map<string, string>();
      for (const c of contacts) {
        if (c.wa_id && c.profile?.name) {
          contactMap.set(c.wa_id, c.profile.name);
        }
      }

      for (const msg of value.messages) {
        if (msg.type === 'text' && msg.text?.body) {
          const from = msg.from;
          const name = contactMap.get(from) || `WhatsApp (${from})`;
          const text = msg.text.body;
          const wamid = msg.id;
          const time = msg.timestamp ? new Date(Number(msg.timestamp) * 1000).toISOString() : new Date().toISOString();

          results.push({
            senderPhone: from,
            senderName: name,
            messageText: text,
            wamid,
            timestamp: time,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Falha ao parsear payload Meta:', err);
  }

  return results;
}

/**
 * Retorna o status de configuração e conectividade da Meta Cloud API
 */
export function getMetaConnectionStatus(): MetaConnectionStatus {
  const hasToken = Boolean(env.META_ACCESS_TOKEN);
  const hasPhoneId = Boolean(env.META_PHONE_NUMBER_ID);
  const configured = hasToken && hasPhoneId;

  return {
    configured,
    phoneNumberIdMasked: env.META_PHONE_NUMBER_ID
      ? `${env.META_PHONE_NUMBER_ID.slice(0, 4)}••••${env.META_PHONE_NUMBER_ID.slice(-4)}`
      : undefined,
    wabaIdMasked: env.META_WABA_ID
      ? `${env.META_WABA_ID.slice(0, 4)}••••${env.META_WABA_ID.slice(-4)}`
      : undefined,
    graphApiVersion: env.META_GRAPH_API_VERSION,
    webhookConfigured: Boolean(env.META_WEBHOOK_VERIFY_TOKEN),
    mode: configured ? 'official_cloud_api' : 'simulated_dev',
  };
}

