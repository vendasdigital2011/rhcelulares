import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../index.js';

test('1. Sugestões de Copiloto IA (POST /api/whatsapp/ai/suggest)', async () => {
  const app = await buildApp();

  const response = await app.inject({
    method: 'POST',
    url: '/api/whatsapp/ai/suggest',
    payload: {
      customerName: 'Lucas Oliveira',
      customerPhone: '77988442211',
      recentMessages: [
        { sender: 'customer', text: 'Boa tarde, quanto tá o iPhone 13 128gb?' }
      ],
      availableStock: [
        { model: 'iPhone 13 128GB', price: 2890, batteryHealth: 88, color: 'Estelar' }
      ]
    },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data.suggestions));
  assert.ok(body.data.suggestions.length > 0);
  // Deve conter menção ao preço real do estoque sem alucinação
  const hasRealPrice = body.data.suggestions.some((s: { text: string }) => s.text.includes('2.890') || s.text.includes('2890'));
  assert.ok(hasRealPrice, 'Deve conter o preço do estoque real nas sugestões');

  await app.close();
});

test('2. Fila de Automações Pendentes (GET /api/whatsapp/automations)', async () => {
  const app = await buildApp();

  const response = await app.inject({
    method: 'GET',
    url: '/api/whatsapp/automations',
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length >= 1);

  const first = body.data[0];
  assert.ok(first.id);
  assert.ok(first.targetName);
  assert.ok(first.suggestedMessage);

  // Testar aprovação
  const approveRes = await app.inject({
    method: 'POST',
    url: `/api/whatsapp/automations/${first.id}/approve`,
  });

  assert.equal(approveRes.statusCode, 200);
  const approveBody = approveRes.json();
  assert.equal(approveBody.success, true);
  assert.equal(approveBody.data.status, 'executed');

  await app.close();
});
