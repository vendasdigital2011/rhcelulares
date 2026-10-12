import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../index.js';
import { env } from '../config/index.js';
import { encryptSensitiveData, decryptSensitiveData, verifyMetaSignature } from '../utils/crypto.js';

describe('Sprint 1 - Validações Técnicas & Critérios de Aceitação', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await buildApp();
  });

  after(async () => {
    await app.close();
  });

  // 1. Criptografia AES-256-GCM para Tokens WABA Sensíveis
  test('US-02.1: Deve criptografar e descriptografar token com AES-256-GCM de forma simétrica e segura', () => {
    const rawToken = 'EAABwz1234MetaSystemUserPermanentTokenValid999';
    const encrypted = encryptSensitiveData(rawToken);

    assert.notStrictEqual(encrypted, rawToken);
    assert.strictEqual(encrypted.split(':').length, 3, 'Deve conter IV, AuthTag e CipherText');

    const decrypted = decryptSensitiveData(encrypted);
    assert.strictEqual(decrypted, rawToken);
  });

  // 2. Validação da assinatura HMAC SHA256 do Webhook da Meta
  test('US-03.1: Deve validar corretamente a assinatura HMAC-SHA256 do webhook da Meta', () => {
    const payload = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
    const hmac = crypto.createHmac('sha256', env.META_APP_SECRET).update(payload).digest('hex');
    const validHeader = `sha256=${hmac}`;

    assert.strictEqual(verifyMetaSignature(payload, validHeader), true);
    assert.strictEqual(verifyMetaSignature(payload, 'sha256=invalid_hash'), false);
  });

  // 3. Health Check
  test('Deve responder 200 OK no Health Check com status do sistema', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.status, 'online');
    assert.strictEqual(body.service, 'hiago-iphones-saas-api');
  });

  // 4. Handshake do Webhook da Meta (GET /webhooks/meta)
  test('US-02.1: Handshake de Verificação da Meta deve aceitar verify_token correto e retornar challenge', async () => {
    const challenge = '1158201444';
    const response = await app.inject({
      method: 'GET',
      url: `/webhooks/meta?hub.mode=subscribe&hub.verify_token=${env.META_WEBHOOK_VERIFY_TOKEN}&hub.challenge=${challenge}`,
    });

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.body, challenge);
  });

  test('Handshake de Verificação da Meta deve recusar token incorreto com 403', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/webhooks/meta?hub.mode=subscribe&hub.verify_token=token_falso_errado&hub.challenge=123`,
    });

    assert.strictEqual(response.statusCode, 403);
  });

  // 5. Ingestão de Webhook (POST /webhooks/meta) em menos de 100ms
  test('US-03.1: Ingestão de Webhook deve responder HTTP 200 com status EVENT_RECEIVED', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '123456789',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                messages: [
                  {
                    from: '5511999998888',
                    id: 'wamid.HBgLMTE5OTk5OTg4ODgVAgASGBQzQjFFMTE4OQ==',
                    text: { body: 'Olá! Quanto sai o iPhone 15 Pro 128gb?' },
                    timestamp: '1728770000',
                    type: 'text',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const startTime = Date.now();
    const response = await app.inject({
      method: 'POST',
      url: '/webhooks/meta',
      payload,
    });
    const latency = Date.now() - startTime;

    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.status, 'EVENT_RECEIVED');
    assert.ok(latency < 100, `Latência (${latency}ms) deve ser inferior a 100ms`);
  });

  // 6. Autenticação e Emissão de JWT (US-01.1)
  test('US-01.1: Login com credenciais válidas deve retornar JWT e dados do usuário', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin@hiagoiphones.com.br',
        password: '123456',
      },
    });

    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.ok(body.token, 'Deve retornar Access Token');
    assert.strictEqual(body.user.role, 'admin');
    assert.strictEqual(body.user.storeName, 'Hiago iPhones');

    // Valida acesso a rota protegida com o token gerado
    const meResponse = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${body.token}`,
      },
    });

    assert.strictEqual(meResponse.statusCode, 200);
    const meBody = JSON.parse(meResponse.body);
    assert.strictEqual(meBody.user.role, 'admin');
  });

  test('US-01.1: Login com credenciais incorretas deve retornar 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin@hiagoiphones.com.br',
        password: 'senha_incorreta',
      },
    });

    assert.strictEqual(response.statusCode, 401);
  });
});
