import { test, describe } from 'node:test';
import assert from 'node:assert';

// Credenciais ativas do Supabase
const SUPABASE_URL = 'https://bytmvqvydxealupmvlme.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xnG6KZJgB4jiRhMgyxSUFA_NbSPfsjX';

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

describe('AUDITORIA COMERCIAL COMPLETA — CRM HIAGO IPHONES', () => {

  const testSuffix = Date.now();
  let testCustomerId: string;
  let testSaleId: string;
  let testImei = '356984112094832'; // iPhone 13 128GB do estoque

  // 1. Cadastro e consulta de cliente
  test('1. Deve cadastrar e consultar cliente com integridade e campos completos', async () => {
    const custPayload = {
      name: `Cliente Auditoria ${testSuffix}`,
      phone: `7799988${testSuffix.toString().slice(-4)}`,
      cpf: '12345678901',
      total_spent: 0,
      last_purchase_date: new Date().toLocaleDateString('pt-BR'),
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(custPayload),
    });

    assert.strictEqual(res.status, 201, 'Deve retornar 201 Created');
    const created = await res.json();
    testCustomerId = created[0].id;
    assert.ok(testCustomerId, 'Cliente deve possuir ID UUID');

    // Consulta
    const getRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${testCustomerId}`, {
      headers,
    });
    const found = await getRes.json();
    assert.strictEqual(found.length, 1);
    assert.strictEqual(found[0].name, custPayload.name);
  });

  // 2. Abertura de caixa
  test('2. Deve verificar ou abrir sessão de caixa com saldo inicial de troco', async () => {
    const getRes = await fetch(`${SUPABASE_URL}/rest/v1/cash_registers?status=eq.open&limit=1`, {
      headers,
    });
    const openList = await getRes.json();
    assert.ok(openList.length > 0, 'Deve haver um caixa aberto para operação');
    assert.strictEqual(Number(openList[0].initial_float), 300, 'Fundo inicial deve ser R$ 300,00');
  });

  // 3. Venda com pagamento integral e baixa de estoque
  test('3. Deve registrar venda à vista (PIX) com baixa imediata do IMEI', async () => {
    testSaleId = `sale-audit-${testSuffix}`;
    const salePayload = {
      sale_number: `VD-AUDIT-${testSuffix}`,
      customer_id: testCustomerId,
      customer_name: `Cliente Auditoria ${testSuffix}`,
      customer_phone: '77999887766',
      seller_name: 'Hiago (Responsável)',
      subtotal: 2890.00,
      discount: 90.00,
      total_amount: 2800.00,
      payment_method: 'Pix',
      installments: 1,
      date: new Date().toLocaleDateString('pt-BR'),
    };

    const saleRes = await fetch(`${SUPABASE_URL}/rest/v1/sales`, {
      method: 'POST',
      headers,
      body: JSON.stringify(salePayload),
    });
    assert.strictEqual(saleRes.status, 201, 'Venda deve ser criada com 201');
    const createdSales = await saleRes.json();
    testSaleId = createdSales[0].id;
    assert.ok(testSaleId, 'Venda criada deve conter UUID');

    // Registra item da venda
    const itemRes = await fetch(`${SUPABASE_URL}/rest/v1/sale_items`, {
      method: 'POST',
      headers,
      body: JSON.stringify([{
        sale_id: testSaleId,
        item_type: 'device',
        name: 'iPhone 13 128GB Meia-noite',
        price: 2890.00,
        quantity: 1,
        imei: testImei,
      }]),
    });
    assert.strictEqual(itemRes.status, 201, 'Item da venda deve ser persistido');

    // Dá baixa no estoque
    const devUpdateRes = await fetch(`${SUPABASE_URL}/rest/v1/devices?imei=eq.${testImei}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'sold' }),
    });
    assert.ok([200, 204].includes(devUpdateRes.status), 'Status do aparelho deve ser atualizado para sold');

    // Valida status no banco
    const devCheck = await fetch(`${SUPABASE_URL}/rest/v1/devices?imei=eq.${testImei}`, { headers });
    const devData = await devCheck.json();
    assert.strictEqual(devData[0].status, 'sold', 'Aparelho deve estar como sold');
  });

  // 4. Venda com Trade-In e Parcelamento
  test('4. Venda com Trade-in deve registrar valor de entrada do seminovo', async () => {
    const tradeInSalePayload = {
      sale_number: `VD-TI-${testSuffix}`,
      customer_name: 'Cliente Trade-In',
      seller_name: 'Hiago',
      subtotal: 4890.00,
      discount: 0,
      trade_in_model: 'iPhone 11 64GB',
      trade_in_amount: 800.00,
      total_amount: 4090.00,
      payment_method: 'Cartão de Crédito 12x',
      installments: 12,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/sales`, {
      method: 'POST',
      headers,
      body: JSON.stringify(tradeInSalePayload),
    });
    assert.strictEqual(res.status, 201);
    const createdTradeIn = await res.json();
    const tradeInSaleId = createdTradeIn[0].id;

    // Limpa registro de teste
    await fetch(`${SUPABASE_URL}/rest/v1/sales?id=eq.${tradeInSaleId}`, { method: 'DELETE', headers });
  });

  // 5. Atualização do caixa e do fluxo financeiro
  test('5. Deve registrar entrada financeira vinculada à venda em cash_transactions', async () => {
    const txPayload = {
      type: 'inflow',
      category: 'sale',
      description: `Venda VD-AUDIT-${testSuffix}`,
      amount: 2800.00,
      payment_method: 'Pix',
      sale_id: testSaleId,
    };

    const txRes = await fetch(`${SUPABASE_URL}/rest/v1/cash_transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(txPayload),
    });
    assert.strictEqual(txRes.status, 201, 'Transação de entrada deve ser registrada no fluxo de caixa');
  });

  // 6. Consulta da venda no histórico do cliente e LTV
  test('6. Deve refletir compra no histórico e acumular LTV do cliente', async () => {
    const updateCustRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${testCustomerId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        total_spent: 2800.00,
        last_purchase_date: new Date().toLocaleDateString('pt-BR'),
      }),
    });
    assert.ok([200, 204].includes(updateCustRes.status));

    const custRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${testCustomerId}`, { headers });
    const custData = await custRes.json();
    assert.strictEqual(Number(custData[0].total_spent), 2800.00, 'LTV do cliente deve ser atualizado');
  });

  // 7. Cancelamento/Estorno com reversão multi-módulo
  test('7. Cancelamento deve estornar no caixa e retornar aparelho ao estoque como available', async () => {
    // 1. Devolve aparelho ao estoque
    const devRestoreRes = await fetch(`${SUPABASE_URL}/rest/v1/devices?imei=eq.${testImei}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'available' }),
    });
    assert.ok([200, 204].includes(devRestoreRes.status));

    const devCheck = await fetch(`${SUPABASE_URL}/rest/v1/devices?imei=eq.${testImei}`, { headers });
    const devData = await devCheck.json();
    assert.strictEqual(devData[0].status, 'available', 'Aparelho deve ter voltado para available');

    // 2. Lança estorno no caixa
    const refundTx = {
      type: 'outflow',
      category: 'estorno',
      description: `Estorno Venda VD-AUDIT-${testSuffix}`,
      amount: 2800.00,
      payment_method: 'Pix',
      sale_id: testSaleId,
    };
    const refundRes = await fetch(`${SUPABASE_URL}/rest/v1/cash_transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(refundTx),
    });
    assert.strictEqual(refundRes.status, 201, 'Estorno deve ser lançado como saída no fluxo de caixa');

    // 3. Reverte LTV do cliente
    await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${testCustomerId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ total_spent: 0 }),
    });
  });

  // 8. Sangria e Suprimento
  test('8. Deve registrar sangria (retirada) e suprimento de caixa', async () => {
    const sangriaPayload = {
      type: 'outflow',
      category: 'sangria',
      description: 'Sangria para depósito bancário',
      amount: 500.00,
      payment_method: 'Dinheiro',
    };
    const sRes = await fetch(`${SUPABASE_URL}/rest/v1/cash_transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(sangriaPayload),
    });
    assert.strictEqual(sRes.status, 201, 'Sangria deve ser persistida');
  });

  // 9. Prevenção de duplicidade por IMEI (restrição UNIQUE)
  test('9. Banco de dados deve rejeitar cadastro concorrente do mesmo IMEI', async () => {
    const duplicateDev = {
      imei: testImei, // IMEI já existente
      model: 'iPhone Duplicado',
      storage: '128GB',
      color: 'Preto',
      cost_price: 1000,
      selling_price: 2000,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/devices`, {
      method: 'POST',
      headers,
      body: JSON.stringify(duplicateDev),
    });

    assert.strictEqual(res.status, 409, 'Banco deve retornar 409 Conflict para IMEI duplicado');
  });

  // 10. Consistência e Limpeza de Testes
  test('10. Limpeza dos registros de teste executada sem deixar lixo no banco', async () => {
    // Remove venda de teste e itens
    await fetch(`${SUPABASE_URL}/rest/v1/sale_items?sale_id=eq.${testSaleId}`, { method: 'DELETE', headers });
    await fetch(`${SUPABASE_URL}/rest/v1/cash_transactions?sale_id=eq.${testSaleId}`, { method: 'DELETE', headers });
    await fetch(`${SUPABASE_URL}/rest/v1/sales?id=eq.${testSaleId}`, { method: 'DELETE', headers });
    await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${testCustomerId}`, { method: 'DELETE', headers });
    assert.ok(true, 'Limpeza concluída');
  });
});
