import { env } from '../../config/index.js';
import { normalizePhoneForWhatsApp } from './whatsapp.service.js';

export interface EvolutionConnectionState {
  state: 'open' | 'connecting' | 'close' | 'refused';
  instanceName: string;
  storePhone: string;
}

export interface EvolutionQRCodeResult {
  base64?: string;
  code?: string;
  pairingCode?: string;
  count?: number;
}

export interface EvolutionSendResult {
  success: boolean;
  messageId?: string;
  status: 'sent' | 'failed';
  error?: string;
}

export class EvolutionService {
  private static get baseUrl(): string {
    return env.EVOLUTION_API_URL.replace(/\/+$/, '');
  }

  private static get apiKey(): string {
    return env.EVOLUTION_API_KEY;
  }

  private static get instance(): string {
    return env.EVOLUTION_INSTANCE_NAME;
  }

  /**
   * Consulta o estado de conexão da instância da Evolution API (open, close, connecting)
   */
  public static async getConnectionState(): Promise<EvolutionConnectionState> {
    try {
      const url = `${this.baseUrl}/instance/connectionState/${this.instance}`;
      const res = await fetch(url, {
        headers: {
          apikey: this.apiKey,
        },
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) {
        return {
          state: 'close',
          instanceName: this.instance,
          storePhone: env.EVOLUTION_STORE_PHONE,
        };
      }

      const data = await res.json() as any;
      const state = data?.instance?.state || 'close';

      return {
        state,
        instanceName: this.instance,
        storePhone: env.EVOLUTION_STORE_PHONE,
      };
    } catch {
      return {
        state: 'close',
        instanceName: this.instance,
        storePhone: env.EVOLUTION_STORE_PHONE,
      };
    }
  }

  /**
   * Obtém o QR Code em base64 e o Pairing Code para conexão no WhatsApp
   */
  public static async getConnectQRCode(): Promise<EvolutionQRCodeResult> {
    try {
      const url = `${this.baseUrl}/instance/connect/${this.instance}`;
      const res = await fetch(url, {
        headers: {
          apikey: this.apiKey,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw new Error(`Falha ao obter QR Code da Evolution: HTTP ${res.status}`);
      }

      const data = await res.json() as any;
      return {
        base64: data.base64,
        code: data.code,
        pairingCode: data.pairingCode,
        count: data.count,
      };
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao conectar à Evolution API');
    }
  }

  /**
   * Dispara mensagem de texto oficial via Evolution API para qualquer número
   */
  public static async sendTextMessage(to: string, message: string): Promise<EvolutionSendResult> {
    const cleanPhone = normalizePhoneForWhatsApp(to);
    if (!cleanPhone) {
      return {
        success: false,
        status: 'failed',
        error: 'Número de telefone inválido',
      };
    }

    // Checagem rápida de estado: se a instância não estiver aberta, evita esperar timeout 504 da Evolution
    const conn = await this.getConnectionState();
    if (conn.state !== 'open') {
      return {
        success: false,
        status: 'failed',
        error: `Instância WhatsApp '${this.instance}' está desconectada (state: ${conn.state})`,
      };
    }

    try {
      const url = `${this.baseUrl}/message/sendText/${this.instance}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: message,
          delay: 1200,
        }),
        signal: AbortSignal.timeout(4000),
      });

      const data = await res.json().catch(() => ({})) as any;

      if (!res.ok) {
        return {
          success: false,
          status: 'failed',
          error: data?.response?.message || data?.message || `Erro HTTP ${res.status}`,
        };
      }

      const messageId = data?.key?.id || data?.id || `evo-${Date.now()}`;
      return {
        success: true,
        messageId,
        status: 'sent',
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'failed',
        error: err.message || 'Falha na conexão com a Evolution API',
      };
    }
  }

  /**
   * Configura o Webhook da Evolution para apontar para a nossa aplicação
   */
  public static async configureWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/webhook/set/${this.instance}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhook: {
            enabled: true,
            url: webhookUrl,
            byEvents: false,
            base64: false,
            events: [
              'MESSAGES_UPSERT',
              'CONNECTION_UPDATE',
              'SEND_MESSAGE',
            ],
          },
        }),
      });

      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Persiste a mensagem recebida de cliente no banco Supabase em tempo real
   */
  public static async persistIncomingMessage(params: {
    phone: string;
    senderName: string;
    messageText: string;
    externalId?: string;
  }): Promise<{ chatId: string; messageId: string } | null> {
    const supabaseUrl = 'https://bytmvqvydxealupmvlme.supabase.co';
    const supabaseKey = 'sb_publishable_xnG6KZJgB4jiRhMgyxSUFA_NbSPfsjX';
    const cleanPhone = normalizePhoneForWhatsApp(params.phone);

    try {
      // 1. Busca conversa existente pelo telefone
      const findRes = await fetch(`${supabaseUrl}/rest/v1/whatsapp_chats?phone_number=eq.${cleanPhone}&select=id,unread_count`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      const existingChats = await findRes.json().catch(() => []) as any[];
      let chatId = '';

      if (existingChats && existingChats.length > 0) {
        chatId = existingChats[0].id;
        const currentUnread = existingChats[0].unread_count || 0;

        // Atualiza chat existente
        await fetch(`${supabaseUrl}/rest/v1/whatsapp_chats?id=eq.${chatId}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            last_message_text: params.messageText,
            last_message_at: new Date().toISOString(),
            unread_count: currentUnread + 1,
            status: 'waiting_attendant',
            updated_at: new Date().toISOString(),
          }),
        });
      } else {
        // Cria nova conversa no Inbox
        const createRes = await fetch(`${supabaseUrl}/rest/v1/whatsapp_chats`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            contact_name: params.senderName,
            phone_number: cleanPhone,
            department: 'vendas',
            status: 'waiting_attendant',
            assigned_user_name: 'Lucas Vendedor',
            last_message_text: params.messageText,
            last_message_at: new Date().toISOString(),
            unread_count: 1,
            tags: ['Novo Lead WhatsApp'],
          }),
        });

        const createdData = await createRes.json() as any[];
        if (createdData && createdData.length > 0) {
          chatId = createdData[0].id;
        }
      }

      if (!chatId) return null;

      // 2. Insere a mensagem no histórico do chat
      const msgRes = await fetch(`${supabaseUrl}/rest/v1/whatsapp_messages`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          chat_id: chatId,
          direction: 'inbound',
          sender_type: 'customer',
          sender_name: params.senderName,
          message_text: params.messageText,
          external_id: params.externalId,
          status: 'delivered',
        }),
      });

      const msgData = await msgRes.json() as any[];
      const messageId = msgData?.[0]?.id || `msg-${Date.now()}`;

      return { chatId, messageId };
    } catch (err) {
      console.error('Falha ao persistir mensagem da Evolution no Supabase:', err);
      return null;
    }
  }
}
