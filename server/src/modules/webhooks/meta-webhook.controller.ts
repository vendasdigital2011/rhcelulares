import type { FastifyPluginAsync } from 'fastify';
import { env } from '../../config/index.js';
import { verifyMetaSignature } from '../../utils/crypto.js';
import { enqueueMetaWebhook } from '../../queue/webhook.queue.js';

export const metaWebhookRoutes: FastifyPluginAsync = async (fastify) => {
  // 1. Handshake de Verificação da Meta (GET /webhooks/meta)
  fastify.get('/meta', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === env.META_WEBHOOK_VERIFY_TOKEN) {
      console.log('✅ Handshake do Webhook da Meta realizado com sucesso!');
      return reply.status(200).type('text/plain').send(challenge);
    }

    console.warn('❌ Tentativa de verificação do Webhook da Meta com token inválido:', token);
    return reply.status(403).send('Forbidden');
  });

  // 2. Ingestão de Mensagens e Status (POST /webhooks/meta)
  fastify.post('/meta', async (request, reply) => {
    const signature = request.headers['x-hub-signature-256'] as string | undefined;
    const rawBody = JSON.stringify(request.body);

    // Validação de assinatura HMAC SHA-256 em produção
    if (env.NODE_ENV === 'production' || signature) {
      const isValid = verifyMetaSignature(rawBody, signature);
      if (!isValid && env.NODE_ENV === 'production') {
        console.warn('⚠️ Assinatura de Webhook Meta inválida rejeitada.');
        return reply.status(401).send({ error: 'Assinatura inválida' });
      }
    }

    // Ingestão desacoplada: Enfileira e responde < 100ms
    try {
      await enqueueMetaWebhook({
        receivedAt: new Date().toISOString(),
        rawPayload: request.body,
        headers: request.headers,
      });

      // Retorno imediato exigido pela Meta para evitar timeouts
      return reply.status(200).send({ status: 'EVENT_RECEIVED' });
    } catch (err: any) {
      console.error('❌ Falha ao enfileirar webhook da Meta:', err.message);
      return reply.status(500).send({ error: 'Falha ao enfileirar evento' });
    }
  });
};
