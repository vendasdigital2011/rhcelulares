import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  sendWhatsAppCloudMessage,
  getMetaConnectionStatus,
  normalizePhoneForWhatsApp
} from './whatsapp.service.js';

const sendMessageSchema = z.object({
  to: z.string().min(8, 'Número de telefone obrigatório'),
  message: z.string().min(1, 'A mensagem não pode ser vazia'),
  chatId: z.string().optional(),
  senderName: z.string().default('Hiago Vendas'),
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
};
