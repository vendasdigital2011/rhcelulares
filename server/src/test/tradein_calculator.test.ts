import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Motor de Cálculo Comercial de Trade-in & Parcelamento com Repasse de Taxa de Maquininha
 */
function calculateTradeInFinancing(params: {
  devicePrice: number;
  tradeInValue?: number;
  pixEntry?: number;
  feeRate: number; // Ex: 10.8 para 12x
  passFeeToClient: boolean;
  installments: number;
}) {
  const tradeIn = params.tradeInValue || 0;
  const pix = params.pixEntry || 0;
  const balance = Math.max(0, params.devicePrice - tradeIn - pix);

  let totalWithFee = balance;
  let installmentValue = 0;

  if (params.passFeeToClient && balance > 0) {
    // Fórmula padrão de mercado para repasse de taxas de maquininhas (Stone / PagBank / InfinitePay)
    // Valor Cobrado = Saldo / (1 - Taxa / 100)
    totalWithFee = balance / (1 - (params.feeRate / 100));
  }

  installmentValue = params.installments > 0 ? totalWithFee / params.installments : 0;

  return {
    balance,
    totalWithFee: Number(totalWithFee.toFixed(2)),
    installmentValue: Number(installmentValue.toFixed(2)),
  };
}

test('1. Abatimento de Trade-in e Entrada Pix sobre Aparelho Novo', () => {
  const result = calculateTradeInFinancing({
    devicePrice: 4490,
    tradeInValue: 1200,
    pixEntry: 500,
    feeRate: 10.8,
    passFeeToClient: true,
    installments: 12,
  });

  // Saldo a financiar: 4490 - 1200 - 500 = 2790
  assert.equal(result.balance, 2790);

  // Com repasse de taxa de 10.8%: 2790 / (1 - 0.108) = 2790 / 0.892 = 3127.80
  assert.equal(result.totalWithFee, 3127.80);

  // Valor da parcela em 12x: 3127.80 / 12 = 260.65
  assert.equal(result.installmentValue, 260.65);
});

test('2. Simulação sem repasse de taxa (Lojista absorve taxa)', () => {
  const result = calculateTradeInFinancing({
    devicePrice: 3890,
    tradeInValue: 1000,
    pixEntry: 0,
    feeRate: 6.6,
    passFeeToClient: false,
    installments: 6,
  });

  // Saldo a financiar: 3890 - 1000 = 2890
  assert.equal(result.balance, 2890);
  assert.equal(result.totalWithFee, 2890);
  // Parcela 6x: 2890 / 6 = 481.67
  assert.equal(result.installmentValue, 481.67);
});

test('3. Simulação com valor zerado ou coberto 100% por entrada', () => {
  const result = calculateTradeInFinancing({
    devicePrice: 3000,
    tradeInValue: 2000,
    pixEntry: 1000,
    feeRate: 14.5,
    passFeeToClient: true,
    installments: 18,
  });

  assert.equal(result.balance, 0);
  assert.equal(result.totalWithFee, 0);
  assert.equal(result.installmentValue, 0);
});

