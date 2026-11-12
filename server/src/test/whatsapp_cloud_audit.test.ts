import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../index.js';
import { normalizePhoneForWhatsApp, getMetaConnectionStatus } from '../modules/whatsapp/whatsapp.service.js';
import { env } from '../config/index.js';

test('1. Normalização de números de telefone para padrão E.164 Meta', () => {
  assert.equal(normalizePhoneForWhatsApp('(77) 98844-2211'), '5577988442211');
  assert.equal(normalizePhoneForWhatsApp('77988442211'), '5577988442211');
  assert.equal(normalizePhoneForWhatsApp('5577988442211'), '5577988442211');
  assert.equal(normalizePhoneForWhatsApp(''), '');
});

test('2. Status de conexão da Meta Cloud API', () => {
  const status = getMetaConnectionStatus();
  assert.ok(status.graphApiVersion);
  assert.ok(typeof status.configured === 'boolean');
  assert.ok(['official_cloud_api', 'simulated_dev'].includes(status.mode));
});

test('3. Handshake do Webhook da Meta (GET /webhooks/meta)', async () => {
  const app = await buildApp();

  // Teste com token correto
  const challenge = 'random_challenge_string_12345';
  const responseOk = await app.inject({
    method: 'GET',
    url: `/webhooks/meta?hub.mode=subscribe&hub.verify_token=${env.META_WEBHOOK_VERIFY_TOKEN}&hub.challenge=${challenge}`,
  });

  assert.equal(responseOk.statusCode, 200);
  assert.equal(responseOk.body, challenge);

  // Teste com token incorreto (deve rejeitar com 403 Forbidden)
  const responseFail = await app.inject({
    method: 'GET',
    url: `/webhooks/meta?hub.mode=subscribe&hub.verify_token=token_invalido&hub.challenge=${challenge}`,
  });

  assert.equal(responseFail.statusCode, 403);
  await app.close();
});

test('4. Envio de mensagem WhatsApp Cloud (POST /api/whatsapp/send)', async () => {
  const app = await buildApp();

  const response = await app.inject({
    method: 'POST',
    url: '/api/whatsapp/send',
    payload: {
      to: '77988442211',
      message: 'Olá! Seu iPhone 13 está pronto para retirada.',
      senderName: 'Hiago Vendas',
    },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.success, true);
  assert.ok(body.messageId);
  assert.equal(body.to, '5577988442211');

  await app.close();
});

test('5. Consulta de Status da Meta API (GET /api/whatsapp/status)', async () => {
  const app = await buildApp();

  const response = await app.inject({
    method: 'GET',
    url: '/api/whatsapp/status',
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.success, true);
  assert.ok(body.data.graphApiVersion);

  await app.close();
});

