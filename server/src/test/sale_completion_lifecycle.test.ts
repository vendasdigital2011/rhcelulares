import { describe, it } from 'node:test';
import assert from 'node:assert';

interface DeviceItem {
  id: string;
  model: string;
  storage: string;
  color: string;
  imei: string;
  status: 'available' | 'showcase' | 'sold' | 'reserved';
  sellPrice: number;
}

interface TradeInItem {
  model: string;
  imei: string;
  batteryHealth: number;
  evaluatedValue: number;
}

interface QuickSalePayload {
  saleNumber: string;
  customerName: string;
  customerPhone: string;
  soldDevice: DeviceItem;
  tradeIn?: TradeInItem;
  pixDownPayment: number;
  installments: number;
}

/**
 * Motor de Conclusão Rápida de Venda & Ciclo de Vida do Aparelho (Épico 07)
 */
function processQuickSaleCompletion(payload: QuickSalePayload) {
  // 1. Validação de regras de negócio
  if (!payload.soldDevice.imei || payload.soldDevice.status === 'sold') {
    throw new Error('Aparelho indisponível ou sem IMEI válido para venda.');
  }

  // 2. Cálculo financeiro
  const tradeInDeduction = payload.tradeIn ? payload.tradeIn.evaluatedValue : 0;
  const balanceToFinance = Math.max(0, payload.soldDevice.sellPrice - payload.pixDownPayment - tradeInDeduction);

  // 3. Atualização de estado do estoque (Baixa do IMEI)
  const updatedSoldDevice: DeviceItem = {
    ...payload.soldDevice,
    status: 'sold',
  };

  // 4. Ingestão do aparelho de Trade-in no inventário se presente
  let ingestedTradeIn: DeviceItem | null = null;
  if (payload.tradeIn) {
    ingestedTradeIn = {
      id: `dev-tradein-${Date.now()}`,
      model: payload.tradeIn.model,
      storage: 'Trade-in',
      color: 'Usado',
      imei: payload.tradeIn.imei,
      status: 'available',
      sellPrice: payload.tradeIn.evaluatedValue,
    };
  }

  // 5. Geração da mensagem do Termo de Garantia D+0
  const warrantyDays = 90;
  const d0Message = `Olá ${payload.customerName.split(' ')[0]}! Parabéns pelo seu novo ${payload.soldDevice.model}! 📱✨\n` +
    `Segue a confirmação da sua compra (Venda #${payload.saleNumber}).\n` +
    `Seu Termo de Garantia Legal de ${warrantyDays} dias da Hiago iPhones está ativo a partir de hoje.\n` +
    `IMEI Registrado: ${payload.soldDevice.imei}.\n` +
    `Qualquer dúvida com backup ou uso, conte conosco!`;

  return {
    success: true,
    saleNumber: payload.saleNumber,
    balanceToFinance,
    updatedSoldDevice,
    ingestedTradeIn,
    d0Message,
  };
}

describe('Épico 07: Ficha de Ciclo de Vida do Aparelho & Conclusão de Venda (<30s)', () => {
  const mockStockDevice: DeviceItem = {
    id: 'dev-14pro-01',
    model: 'iPhone 14 Pro 128GB Roxo Profundo',
    storage: '128GB',
    color: 'Roxo Profundo',
    imei: '354891102938475',
    status: 'available',
    sellPrice: 4890,
  };

  it('1. Deve concluir venda à vista com baixa de status do IMEI para "sold"', () => {
    const result = processQuickSaleCompletion({
      saleNumber: 'VD-849201',
      customerName: 'Renato Guimarães',
      customerPhone: '5577999887766',
      soldDevice: { ...mockStockDevice },
      pixDownPayment: 4890,
      installments: 1,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.balanceToFinance, 0);
    assert.strictEqual(result.updatedSoldDevice.status, 'sold');
    assert.strictEqual(result.updatedSoldDevice.imei, '354891102938475');
    assert.ok(result.d0Message.includes('Garantia Legal de 90 dias'));
    assert.ok(result.d0Message.includes('IMEI Registrado: 354891102938475'));
  });

  it('2. Deve abater trade-in + entrada Pix e calcular saldo a parcelar corretamente', () => {
    const result = processQuickSaleCompletion({
      saleNumber: 'VD-849202',
      customerName: 'Camila Vasconcelos',
      customerPhone: '5577988112233',
      soldDevice: { ...mockStockDevice },
      tradeIn: {
        model: 'iPhone 11 64GB Preto',
        imei: '351234567890123',
        batteryHealth: 81,
        evaluatedValue: 1200,
      },
      pixDownPayment: 690,
      installments: 12,
    });

    // Saldo: 4890 - 1200 - 690 = 3000
    assert.strictEqual(result.balanceToFinance, 3000);
    assert.strictEqual(result.updatedSoldDevice.status, 'sold');
    assert.ok(result.ingestedTradeIn !== null);
    assert.strictEqual(result.ingestedTradeIn?.imei, '351234567890123');
    assert.strictEqual(result.ingestedTradeIn?.status, 'available');
  });

  it('3. Deve impedir conclusão de venda para aparelho com status já "sold"', () => {
    const alreadySoldDevice: DeviceItem = {
      ...mockStockDevice,
      status: 'sold',
    };

    assert.throws(() => {
      processQuickSaleCompletion({
        saleNumber: 'VD-849203',
        customerName: 'Teste Falha',
        customerPhone: '5577900000000',
        soldDevice: alreadySoldDevice,
        pixDownPayment: 4890,
        installments: 1,
      });
    }, /Aparelho indisponível/);
  });
});
