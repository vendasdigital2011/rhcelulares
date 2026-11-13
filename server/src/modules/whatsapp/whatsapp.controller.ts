import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  sendWhatsAppCloudMessage,
  getMetaConnectionStatus,
  normalizePhoneForWhatsApp
} from './whatsapp.service.js';
import { WhatsAppAIService } from './whatsapp-ai.service.js';
import { WhatsAppLifecycleRulesService } from './whatsapp-rules.service.js';
import { WhatsAppReferralService } from './whatsapp-referral.service.js';
import { EvolutionService } from './evolution.service.js';

const sendMessageSchema = z.object({
  to: z.string().min(8, 'Número de telefone obrigatório'),
  message: z.string().min(1, 'A mensagem não pode ser vazia'),
  chatId: z.string().optional(),
  senderName: z.string().default('Hiago Vendas'),
});

const copilotRequestSchema = z.object({
  customerName: z.string().default('Cliente'),
  lastMessageText: z.string().optional(),
  recentMessages: z.array(z.object({
    direction: z.string().optional(),
    sender: z.string().optional(),
    text: z.string(),
    senderName: z.string().optional(),
  })).optional(),
  availableStock: z.array(z.object({
    model: z.string(),
    price: z.number(),
    color: z.string().optional(),
    batteryHealth: z.number().optional(),
  })).optional(),
  currentOS: z.object({
    osNumber: z.string(),
    deviceModel: z.string(),
    status: z.string(),
    value: z.number(),
  }).optional(),
});

export const whatsappRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * Consulta status de conectividade da Meta Cloud API
   * GET /api/whatsapp/status
   */
  fastify.get('/status', async () => {
    const status = getMetaConnectionStatus();
    return {
      success: true,
      data: status,
    };
  });

  /**
   * Dispara mensagem de texto via WhatsApp Cloud API Oficial
   * POST /api/whatsapp/send
   */
  fastify.post('/send', async (request, reply) => {
    const parseResult = sendMessageSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Dados de envio inválidos',
        details: parseResult.error.format(),
      });
    }

    const { to, message, chatId, senderName } = parseResult.data;
    const result = await sendWhatsAppCloudMessage({
      to,
      message,
      chatId,
      senderName,
    });

    if (!result.success) {
      return reply.status(502).send({
        success: false,
        error: result.error || 'Falha ao enviar mensagem pela Meta',
        status: result.status,
      });
    }

    return reply.status(200).send({
      success: true,
      messageId: result.messageId,
      status: result.status,
      to: normalizePhoneForWhatsApp(to),
    });
  });

  /**
   * Copiloto Comercial: Sugestões inteligentes de resposta baseadas no contexto e estoque real
   * POST /api/whatsapp/ai/suggest
   */
  fastify.post('/ai/suggest', async (request, reply) => {
    const parseResult = copilotRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Payload inválido para sugestão da IA',
      });
    }

    const data = parseResult.data;
    let lastMessageText = data.lastMessageText || '';
    if (!lastMessageText && data.recentMessages && data.recentMessages.length > 0) {
      lastMessageText = data.recentMessages[data.recentMessages.length - 1].text || '';
    }

    const result = await WhatsAppAIService.generateSuggestions({
      ...data,
      lastMessageText,
    });
    return reply.status(200).send({
      success: true,
      data: result,
    });
  });

  /**
   * Lista automações operacionais pendentes para aprovação humana (RF06)
   * GET /api/whatsapp/automations
   */
  fastify.get('/automations', async () => {
    const automations = WhatsAppAIService.getAutomations();
    return {
      success: true,
      data: automations,
    };
  });

  /**
   * Aprova e executa uma automação (disparo de WhatsApp)
   * POST /api/whatsapp/automations/:id/approve
   */
  fastify.post('/automations/:id/approve', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { operator?: string } | undefined;
    const operator = body?.operator || 'Hiago Vendas';

    const result = await WhatsAppAIService.approveAutomation(id, operator);
    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: result.error,
      });
    }

    return reply.status(200).send({
      success: true,
      data: result.automation,
    });
  });

  /**
   * Descarta uma automação
   */
  fastify.post('/automations/:id/dismiss', async (request, reply) => {
    const { id } = request.params as { id: string };
    const success = WhatsAppAIService.dismissAutomation(id);
    return reply.status(200).send({
      success,
    });
  });

  /**
   * Réguas de Ciclo de Vida Automáticas (D+0, D+15, D+180, D+360 - Épico 09)
   * GET /api/whatsapp/rules
   */
  fastify.get('/rules', async () => {
    const rules = WhatsAppLifecycleRulesService.getRules();
    return {
      success: true,
      data: rules,
    };
  });

  /**
   * Alterna status da régua (Ativa / Pausada)
   * POST /api/whatsapp/rules/:ruleId/toggle
   */
  fastify.post('/rules/:ruleId/toggle', async (request, reply) => {
    const { ruleId } = request.params as { ruleId: string };
    const updated = WhatsAppLifecycleRulesService.toggleRule(ruleId);
    if (!updated) {
      return reply.status(404).send({ success: false, error: 'Régua não encontrada' });
    }
    return reply.status(200).send({ success: true, data: updated });
  });

  /**
   * Atualiza o template da mensagem da régua
   * POST /api/whatsapp/rules/:ruleId/template
   */
  fastify.post('/rules/:ruleId/template', async (request, reply) => {
    const { ruleId } = request.params as { ruleId: string };
    const body = request.body as { templateMessage: string };
    if (!body || !body.templateMessage) {
      return reply.status(400).send({ success: false, error: 'templateMessage é obrigatório' });
    }
    const updated = WhatsAppLifecycleRulesService.updateTemplate(ruleId, body.templateMessage);
    if (!updated) {
      return reply.status(404).send({ success: false, error: 'Régua não encontrada' });
    }
    return reply.status(200).send({ success: true, data: updated });
  });

  /**
   * Dispara a régua em lote para os clientes elegíveis via Meta Cloud API Oficial
   * POST /api/whatsapp/rules/:ruleId/trigger-batch
   */
  fastify.post('/rules/:ruleId/trigger-batch', async (request, reply) => {
    const { ruleId } = request.params as { ruleId: string };
    const body = request.body as { operator?: string } | undefined;
    const operator = body?.operator || 'Hiago Vendas';

    try {
      const result = await WhatsAppLifecycleRulesService.triggerBatch(ruleId, operator);
      return reply.status(200).send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message || 'Erro ao disparar lote' });
    }
  });

  /**
   * Programa de Indicação Viral & Embaixadores (Épico 10)
   * GET /api/whatsapp/referrals
   */
  fastify.get('/referrals', async () => {
    const ambassadors = WhatsAppReferralService.getAmbassadors();
    return {
      success: true,
      data: ambassadors,
    };
  });

  /**
   * Gera código e link exclusivo de indicação
   * POST /api/whatsapp/referrals/generate
   */
  fastify.post('/referrals/generate', async (request, reply) => {
    const body = request.body as { customerName: string; customerPhone: string; deviceBought: string };
    if (!body.customerName || !body.customerPhone || !body.deviceBought) {
      return reply.status(400).send({
        success: false,
        error: 'customerName, customerPhone e deviceBought são obrigatórios',
      });
    }

    const created = WhatsAppReferralService.generateReferral(body.customerName, body.customerPhone, body.deviceBought);
    return reply.status(201).send({
      success: true,
      data: created,
    });
  });

  /**
   * Envia convite de embaixador no WhatsApp do cliente
   * POST /api/whatsapp/referrals/:id/share
   */
  fastify.post('/referrals/:id/share', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { operator?: string } | undefined;
    const operator = body?.operator || 'Hiago Vendas';

    const result = await WhatsAppReferralService.sendReferralInvite(id, operator);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: result.error });
    }

    return reply.status(200).send({ success: true, data: result });
  });

  /**
   * Dashboard Executivo de ROI (Épico 10)
   * GET /api/whatsapp/roi-metrics
   */
  fastify.get('/roi-metrics', async () => {
    const metrics = WhatsAppReferralService.getExecutiveRoiMetrics();
    return {
      success: true,
      data: metrics,
    };
  });

  /**
   * Consulta status de conexão da Evolution API
   * GET /api/whatsapp/evolution/status
   */
  fastify.get('/evolution/status', async () => {
    const state = await EvolutionService.getConnectionState();
    return {
      success: true,
      data: state,
    };
  });

  /**
   * Obtém QR Code / Pairing Code em tempo real da Evolution API
   * GET /api/whatsapp/evolution/qrcode
   */
  fastify.get('/evolution/qrcode', async (request, reply) => {
    try {
      const qrData = await EvolutionService.getConnectQRCode();
      return reply.status(200).send({
        success: true,
        data: qrData,
      });
    } catch (err: any) {
      return reply.status(502).send({
        success: false,
        error: err.message || 'Erro ao gerar QR Code',
      });
    }
  });

  /**
   * Webhook Receptor de Mensagens e Eventos da Evolution API
   * POST /api/whatsapp/evolution/webhook
   */
  fastify.post('/evolution/webhook', async (request, reply) => {
    const body = request.body as any;
    const event = body?.event || body?.type;

    console.log(`📩 [Evolution Webhook Recebido] Evento: ${event}`);

    // Quando recebe nova mensagem de cliente
    if (event === 'messages.upsert' || event === 'MESSAGES_UPSERT') {
      const data = body.data || body;
      const key = data.key || {};
      const fromMe = key.fromMe;
      const remoteJid = key.remoteJid || '';

      // Ignora mensagens enviadas pelo próprio robô/atendente
      if (!fromMe && remoteJid && !remoteJid.includes('@g.us')) {
        const phone = remoteJid.replace('@s.whatsapp.net', '');
        const messageText = data.message?.conversation ||
          data.message?.extendedTextMessage?.text ||
          data.message?.imageMessage?.caption ||
          '[Mídia recebida]';
        const senderName = data.pushName || `Cliente (${phone})`;

        console.log(`📱 Nova mensagem recebida de ${senderName} (${phone}): "${messageText}"`);

        // Grava no Supabase e atualiza o Inbox do CRM
        await EvolutionService.persistIncomingMessage({
          phone,
          senderName,
          messageText,
          externalId: key.id,
        });
      }
    }

    return reply.status(200).send({ received: true });
  });
};

