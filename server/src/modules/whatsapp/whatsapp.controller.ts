import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  sendWhatsAppCloudMessage,
  getMetaConnectionStatus,
  normalizePhoneForWhatsApp
} from './whatsapp.service.js';
import { WhatsAppAIService } from './whatsapp-ai.service.js';

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
   * POST /api/whatsapp/automations/:id/dismiss
   */
  fastify.post('/automations/:id/dismiss', async (request, reply) => {
    const { id } = request.params as { id: string };
    const success = WhatsAppAIService.dismissAutomation(id);
    return reply.status(200).send({
      success,
    });
  });
};

