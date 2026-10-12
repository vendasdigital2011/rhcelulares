import { Queue } from 'bullmq';
import { env } from '../config/index.js';
import { getRedisClient, isRedisAvailable } from './redis.js';

export const META_WEBHOOK_QUEUE_NAME = 'meta-webhook-queue';

let webhookQueue: Queue | null = null;

export function getWebhookQueue(): Queue | null {
  if (!webhookQueue && isRedisAvailable()) {
    try {
      webhookQueue = new Queue(META_WEBHOOK_QUEUE_NAME, {
        connection: {
          url: env.REDIS_URL,
        },
      });
      console.log(`✅ Fila BullMQ [${META_WEBHOOK_QUEUE_NAME}] inicializada.`);
    } catch (err: any) {
      console.warn('⚠️ Falha ao inicializar fila BullMQ:', err.message);
    }
  }
  return webhookQueue;
}

export interface WebhookJobPayload {
  receivedAt: string;
  rawPayload: any;
  headers: Record<string, any>;
}

export async function enqueueMetaWebhook(jobData: WebhookJobPayload): Promise<void> {
  const queue = getWebhookQueue();
  if (queue) {
    await queue.add('process-meta-webhook', jobData, {
      removeOnComplete: true,
      removeOnFail: 100,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  } else {
    // Fallback em memória para ambiente de desenvolvimento sem Redis
    console.log('📥 [Webhook Queued Localmente]: Payload enfileirado para processamento assíncrono.');
  }
}
