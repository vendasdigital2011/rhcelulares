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
}
