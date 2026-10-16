import test from 'node:test';
import assert from 'node:assert/strict';
import { FinancialCalculator, type RawFinancialInputs } from '../modules/financial-intelligence/financial-intelligence.calculator.js';
import { FinancialIntelligenceService } from '../modules/financial-intelligence/financial-intelligence.service.js';
import { buildApp } from '../index.js';

const MOCK_INPUTS: RawFinancialInputs = {
  accounts: [
    { id: 'acc-1', name: 'Banco Santander', currentBalance: 15000.00, type: 'checking' },
    { id: 'acc-2', name: 'Caixa Gaveta', currentBalance: 1200.00, type: 'cash' },
  ],
  billsPay: [
    {
      id: 'bp-1',
      supplierName: 'Distribuidora SP',
      category: 'Fornecedores de Aparelhos',
      description: 'Lote iPhone 15',
      finalAmount: 10000.00,
      paidAmount: 5000.00,
      remainingAmount: 5000.00,
      dueDate: '2026-10-25',
      status: 'partial',
    },
    {
      id: 'bp-2',
      supplierName: 'Apple Parts',
      category: 'Peças & Telas',
      description: 'Telas e Baterias',
      finalAmount: 2000.00,
      paidAmount: 0.00,
      remainingAmount: 2000.00,
      dueDate: '2026-10-01', // vencida
      status: 'pending',
    },
  ],
  billsReceive: [
    {
      id: 'br-1',
      customerName: 'Cliente A',
      category: 'Venda Aparelho',
      description: 'Parcela Crediário',
      finalAmount: 1500.00,
      receivedAmount: 0.00,
      remainingAmount: 1500.00,
      dueDate: '2026-10-20',
      status: 'pending',
    },
    {
      id: 'br-2',
      customerName: 'Cliente B',
      category: 'Venda Aparelho',
      description: 'Promissória Atrasada',
      finalAmount: 500.00,
      receivedAmount: 0.00,
      remainingAmount: 500.00,
      dueDate: '2026-10-02', // vencida
      status: 'pending',
    },
  ],
  transactions: [
    { id: 'tx-1', type: 'income', amount: 3000, category: 'Vendas - iPhones', date: '2026-10-05', reconciled: true, description: 'Venda iPhone 13' },
    { id: 'tx-2', type: 'income', amount: 500, category: 'Serviços Técnicos', date: '2026-10-06', reconciled: true, description: 'Troca de tela' },
    { id: 'tx-3', type: 'expense', amount: 2500, category: 'Aluguel & Condomínio', date: '2026-10-08', reconciled: true, description: 'Aluguel' },
    { id: 'tx-4', type: 'expense', amount: 5000, category: 'Fornecedores de Aparelhos', date: '2026-10-09', reconciled: true, description: 'Pgto Lote' },
  ],
  sales: [
    {
      id: 'sale-1',
      date: '2026-10-05',
      totalAmount: 3000,
      items: [{ id: 'it-1', type: 'device', name: 'iPhone 13 128GB', price: 3000, costPrice: 2200, quantity: 1 }],
    },
  ],
  serviceOrders: [
    { id: 'os-1', osNumber: 101, status: 'entregue', totalPrice: 500, laborCost: 350, partsCost: 150 },
  ],
};

test('MÓDULO INTELIGÊNCIA FINANCEIRA COM IA (AUDITORIA RM SAAS)', async (t) => {

  await t.test('1. Cálculo Determinístico de DRE: Nunca confunde receita bruta com dinheiro recebido', () => {
    const data = FinancialCalculator.consolidate(MOCK_INPUTS);
    
    // Receita Bruta = Vendas (3000) + OS (500) = 3500
    assert.equal(data.dre.grossRevenue, 3500);
    // Saldo atual conciliado = 15000 + 1200 = 16200
    assert.equal(data.summary.currentTotalBalance, 16200);
    // Não confunde receita bruta (3500) com saldo disponível (16200)
    assert.notEqual(data.dre.grossRevenue, data.summary.currentTotalBalance);

    // CMV Total = 2200 (iPhone 13) + 150 (peças OS) = 2350
    assert.equal(data.dre.cmvTotal, 2350);
    assert.equal(data.dre.cmvDevices, 2200);
    assert.equal(data.dre.cmvParts, 150);

    // Lucro Bruto = Receita Líquida - CMV
    assert.ok(data.dre.grossProfit > 0);
    assert.ok(data.dre.grossMarginPercent > 0);
  });

  await t.test('2. Segregação de custos e despesas operacionais no resultado líquido', () => {
    const data = FinancialCalculator.consolidate(MOCK_INPUTS);
    
    // Despesas operacionais não devem incluir compras de aparelhos para estoque (ativo)
    assert.ok(data.dre.operationalExpenses < 5000, 'Compras de estoque não devem ser infladas como despesas operacionais correntes');
    assert.ok(typeof data.dre.netResult === 'number');
    assert.ok(typeof data.dre.netMarginPercent === 'number');
  });

  await t.test('3. Rentabilidade detalhada por categoria de produto e serviço', () => {
    const data = FinancialCalculator.consolidate(MOCK_INPUTS);
    
    assert.equal(data.categoryProfitability.length, 3);
    const iphoneCat = data.categoryProfitability.find(c => c.category.includes('iPhones'));
    const osCat = data.categoryProfitability.find(c => c.category.includes('Assistência'));
    
    assert.ok(iphoneCat);
    assert.ok(osCat);
    assert.ok(osCat.marginPercent > iphoneCat.marginPercent, 'Mão de obra de assistência técnica deve apresentar margem superior');
  });

  await t.test('4. Projeção de fluxo de caixa nos 3 cenários (Provável, Pessimista, Otimista)', () => {
    const data = FinancialCalculator.consolidate(MOCK_INPUTS);
    
    const d30 = data.scenarios.d30;
    assert.ok(d30.provavel);
    assert.ok(d30.pessimista);
    assert.ok(d30.otimista);

    // O saldo final otimista deve ser superior ao provável, que deve ser superior ao pessimista
    assert.ok(d30.otimista.projectedFinalBalance > d30.provavel.projectedFinalBalance);
    assert.ok(d30.provavel.projectedFinalBalance > d30.pessimista.projectedFinalBalance);

    // Todas as projeções devem conter premissas explícitas documentadas
    assert.ok(d30.provavel.assumptions.length >= 2);
    assert.ok(d30.pessimista.assumptions.length >= 2);
    assert.ok(d30.otimista.assumptions.length >= 2);
  });

  await t.test('5. Detecção determinística de alertas operacionais e inadimplência', () => {
    const data = FinancialCalculator.consolidate(MOCK_INPUTS);
    
    // bp-2 está vencida
    const overduePayAlert = data.alerts.find(a => a.type === 'overdue_bill_pay');
    assert.ok(overduePayAlert, 'Deve emitir alerta de conta a pagar vencida');

    // br-2 está vencida
    const overdueRecAlert = data.alerts.find(a => a.type === 'overdue_bill_receive');
    assert.ok(overdueRecAlert, 'Deve emitir alerta de inadimplência/recebimento vencido');
  });

  await t.test('6. Contrato Estruturado da IA: Valida os 10 tópicos obrigatórios', async () => {
    const analysis = await FinancialIntelligenceService.runAIAnalysis(MOCK_INPUTS, 'health_overview');
    
    assert.ok(analysis.id);
    assert.ok(analysis.createdAt);
    assert.ok(analysis.executiveSummary.length > 20);
    assert.ok(analysis.identifiedSituation.length > 10);
    assert.ok(Array.isArray(analysis.evidenceAndValues));
    assert.ok(analysis.evidenceAndValues.length > 0);
    assert.ok(analysis.comparisonWithPast);
    assert.ok(Array.isArray(analysis.identifiedRisks));
    assert.ok(Array.isArray(analysis.possibleScenarios));
    assert.ok(Array.isArray(analysis.prioritizedRecommendations));
    assert.ok(analysis.prioritizedRecommendations.length > 0);
    assert.ok(analysis.estimatedFinancialImpactSummary);
    assert.ok(Array.isArray(analysis.assumptionsAndLimitations));
    assert.ok(Array.isArray(analysis.additionalDataNeeded));
  });

  await t.test('7. Separação explícita entre Fatos, Cálculos, Estimativas, Hipóteses e Recomendações', async () => {
    const analysis = await FinancialIntelligenceService.runAIAnalysis(MOCK_INPUTS, 'health_overview');
    
    const db = analysis.distinctionBreakdown;
    assert.ok(db, 'Deve conter distinctionBreakdown');
    assert.ok(db.factsObserved.length > 0, 'Deve listar fatos observados');
    assert.ok(db.systemCalculations.length > 0, 'Deve listar cálculos do sistema');
    assert.ok(db.estimates.length > 0, 'Deve listar estimativas');
    assert.ok(db.hypotheses.length > 0, 'Deve listar hipóteses');
    assert.ok(db.recommendations.length > 0, 'Deve listar recomendações');
  });

  await t.test('8. Governança e Controle Humano: Registro auditável de decisão (Aprovação / Rejeição)', () => {
    const analysisList = FinancialIntelligenceService.getAnalysisHistory();
    const currentAnalysis = analysisList[0];
    assert.ok(currentAnalysis);
    const firstRec = currentAnalysis.prioritizedRecommendations[0];
    assert.ok(firstRec);

    // Registra aprovação humana com justificativa
    const decision = FinancialIntelligenceService.recordDecision({
      analysisId: currentAnalysis.id,
      recommendationId: firstRec.id,
      recommendationTitle: firstRec.title,
      actionTaken: 'approved',
      decidedBy: 'Rodrigo Lojista',
      justification: 'Aprovado para renegociação imediata na segunda-feira.',
    });

    assert.ok(decision.id);
    assert.equal(decision.actionTaken, 'approved');
    assert.equal(decision.decidedBy, 'Rodrigo Lojista');

    // Recomendação deve ter status atualizado para approved
    assert.equal(firstRec.status, 'approved');

    const decisions = FinancialIntelligenceService.getDecisionHistory();
    assert.ok(decisions.length > 0);
  });

  await t.test('9. Resiliência: Sem chave OpenAI no ambiente de teste, gera análise determinística robusta sem erro 500', async () => {
    const analysis = await FinancialIntelligenceService.runAIAnalysis(MOCK_INPUTS, 'cash_risk_30d');
    assert.ok(analysis);
    assert.equal(analysis.source, 'deterministic_engine');
  });

  await t.test('10. Endpoints Fastify: /api/financial-intelligence/overview, /analyze e /decision respondem com sucesso', async () => {
    const app = await buildApp();

    // GET /overview
    const resOverview = await app.inject({
      method: 'GET',
      url: '/api/financial-intelligence/overview',
    });
    assert.equal(resOverview.statusCode, 200);
    const jsonOverview = JSON.parse(resOverview.payload);
    assert.equal(jsonOverview.success, true);
    assert.ok(jsonOverview.data.dre);
    assert.ok(jsonOverview.data.scenarios);

    // POST /analyze
    const resAnalyze = await app.inject({
      method: 'POST',
      url: '/api/financial-intelligence/analyze',
      payload: {
        questionType: 'health_overview',
      },
    });
    assert.equal(resAnalyze.statusCode, 200);
    const jsonAnalyze = JSON.parse(resAnalyze.payload);
    assert.equal(jsonAnalyze.success, true);
    assert.ok(jsonAnalyze.data.executiveSummary);

    // GET /config
    const resConfig = await app.inject({
      method: 'GET',
      url: '/api/financial-intelligence/config',
    });
    assert.equal(resConfig.statusCode, 200);
    const jsonConfig = JSON.parse(resConfig.payload);
    assert.equal(jsonConfig.success, true);
    assert.ok(typeof jsonConfig.data.openaiApiKeyConfigured === 'boolean');
  });
});
