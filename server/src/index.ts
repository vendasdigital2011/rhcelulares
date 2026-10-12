import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { env } from './config/index.js';
import { checkDatabaseConnection, getDatabaseStatus } from './db/client.js';
import { getRedisClient, isRedisAvailable } from './queue/redis.js';
import { authRoutes } from './modules/auth/auth.controller.js';
import { tenantRoutes } from './modules/tenants/tenant.controller.js';
import { metaWebhookRoutes } from './modules/webhooks/meta-webhook.controller.js';
import { erpRoutes } from './modules/erp/erp.controller.js';

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === 'test' ? false : {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // 1. Plugins essenciais
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(cookie);

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'refresh_token',
      signed: false,
    },
  });

  // 2. Rota de Health Check e Observabilidade
  app.get('/api/health', async () => {
    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      service: 'hiago-iphones-saas-api',
      version: '1.0.0',
      database: getDatabaseStatus() ? 'connected' : 'offline_fallback',
      redis: isRedisAvailable() ? 'connected' : 'offline_fallback',
      environment: env.NODE_ENV,
    };
  });

  // 3. Registro dos Módulos do ERP & WhatsApp
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(tenantRoutes, { prefix: '/api/tenants' });
  await app.register(metaWebhookRoutes, { prefix: '/webhooks' });
  await app.register(erpRoutes, { prefix: '/api/erp' });

  return app;
}

async function start() {
  try {
    const app = await buildApp();

    // Tenta conectar ao PostgreSQL e Redis
    await checkDatabaseConnection();
    getRedisClient();

    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 API Core rodando com sucesso em http://localhost:${env.PORT}`);
    console.log(`🔗 Webhook da Meta disponível em http://localhost:${env.PORT}/webhooks/meta`);
    console.log(`🩺 Health check disponível em http://localhost:${env.PORT}/api/health`);
  } catch (err) {
    console.error('❌ Falha ao iniciar servidor:', err);
    process.exit(1);
  }
}

// Inicia se executado diretamente
if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  start();
}
