import type { FastifyPluginAsync } from 'fastify';
import { FinancialIntelligenceService } from './financial-intelligence.service.js';
import type { RawFinancialInputs } from './financial-intelligence.calculator.js';

// Dados operacionais padrão de fallback se o request não enviar o payload bruto
const DEFAULT_INPUTS: RawFinancialInputs = {
  accounts: [
    { id: 'acc-1', name: 'Banco Santander - Conta Principal', currentBalance: 18450.00, type: 'checking' },
    { id: 'acc-2', name: 'Gaveta do Balcão (Dinheiro Físico)', currentBalance: 1280.00, type: 'cash' },
    { id: 'acc-3', name: 'Conta Adquirente Stone / D+1', currentBalance: 6940.00, type: 'card_settlement' },
  ],
  billsPay: [
    {
      id: 'bp-1',
      supplierName: 'Distribuidora Alpha SP',
      category: 'Fornecedores de Aparelhos',
      description: 'Lote reposição iPhone 15 Pro (Nota 4891)',
      finalAmount: 9600.00,
      paidAmount: 4800.00,
      remainingAmount: 4800.00,
      dueDate: '2026-10-25',
      status: 'partial',
    },
    {
      id: 'bp-2',
      supplierName: 'Apple Parts Brasil',
      category: 'Peças & Telas',
      description: 'Displays OLED iPhone 13 e baterias homologadas',
      finalAmount: 1850.00,
      paidAmount: 0.00,
      remainingAmount: 1850.00,
      dueDate: '2026-10-20',
      status: 'pending',
    },
    {
      id: 'bp-3',
      supplierName: 'Imobiliária Salvador Prime',
      category: 'Aluguel & Condomínio',
      description: 'Aluguel do ponto comercial - Loja Shopping',
      finalAmount: 3200.00,
      paidAmount: 3200.00,
      remainingAmount: 0.00,
      dueDate: '2026-10-10',
      status: 'paid',
    },
    {
      id: 'bp-4',
      supplierName: 'Distribuidora SP Import',
      category: 'Fornecedores de Aparelhos',
      description: 'Boleto reposição iPhone 12 / 13 (Vencido)',
      finalAmount: 2400.00,
      paidAmount: 0.00,
      remainingAmount: 2400.00,
      dueDate: '2026-10-05',
      status: 'pending',
    },
  ],
  billsReceive: [
    {
      id: 'br-1',
      customerName: 'Renato Silva',
      category: 'Venda Aparelho',
      description: 'Parcela 1/2 Entrada no Crediário Próprio',
      finalAmount: 900.00,
      receivedAmount: 0.00,
      remainingAmount: 900.00,
      dueDate: '2026-10-22',
      status: 'pending',
    },
    {
      id: 'br-2',
      customerName: 'Clínica Odonto Prime',
      category: 'Assistência Técnica B2B',
      description: 'Faturamento de manutenção de 4 iPhones corporativos',
      finalAmount: 1800.00,
      receivedAmount: 0.00,
      remainingAmount: 1800.00,
      dueDate: '2026-10-28',
      status: 'pending',
    },
    {
      id: 'br-3',
      customerName: 'Carlos Eduardo',
      category: 'Venda de Acessórios',
      description: 'Troca com promissória (Vencido)',
      finalAmount: 350.00,
      receivedAmount: 0.00,
      remainingAmount: 350.00,
      dueDate: '2026-10-08',
      status: 'pending',
    },
  ],
  transactions: [
    { id: 'tx-1', type: 'income', amount: 2890, category: 'Vendas - iPhones', date: '2026-10-02', reconciled: true, description: 'Venda iPhone 13 128GB à vista' },
    { id: 'tx-2', type: 'income', amount: 4890, category: 'Vendas - iPhones', date: '2026-10-05', reconciled: true, description: 'Venda iPhone 14 Pro Pix' },
    { id: 'tx-3', type: 'income', amount: 7290, category: 'Vendas - iPhones', date: '2026-10-09', reconciled: true, description: 'Venda iPhone 15 Pro Max D+1 Stone' },
    { id: 'tx-4', type: 'income', amount: 1650, category: 'Vendas - iPhones', date: '2026-10-12', reconciled: true, description: 'Venda iPhone 11 128GB' },
    { id: 'tx-5', type: 'income', amount: 450, category: 'Serviços Técnicos', date: '2026-10-10', reconciled: true, description: 'Troca de Tela OLED iPhone 12' },
    { id: 'tx-6', type: 'income', amount: 280, category: 'Serviços Técnicos', date: '2026-10-14', reconciled: true, description: 'Troca de Bateria iPhone 13' },
    { id: 'tx-7', type: 'income', amount: 420, category: 'Acessórios', date: '2026-10-11', reconciled: true, description: 'Combo Capa + Película + Carregador 20W' },
    { id: 'tx-8', type: 'expense', amount: 3200, category: 'Aluguel & Condomínio', date: '2026-10-08', reconciled: true, description: 'Aluguel Loja Física' },
    { id: 'tx-9', type: 'expense', amount: 4800, category: 'Fornecedores de Aparelhos', date: '2026-10-11', reconciled: true, description: 'Pagamento Parcial Fornecedor Alpha' },
    { id: 'tx-10', type: 'expense', amount: 650, category: 'Energia & Internet', date: '2026-10-07', reconciled: true, description: 'Coelba + Link Fibra Dedicado' },
    { id: 'tx-11', type: 'expense', amount: 1200, category: 'Marketing & Tráfego', date: '2026-10-04', reconciled: false, description: 'Meta Ads Instagram Anúncios' },
  ],
  sales: [
    {
      id: 'sale-1',
      date: '2026-10-02',
      totalAmount: 2890,
      items: [{ id: 'i-1', type: 'device', name: 'iPhone 13 128GB', price: 2890, costPrice: 2100, quantity: 1 }],
    },
    {
      id: 'sale-2',
      date: '2026-10-05',
      totalAmount: 4890,
      items: [{ id: 'i-2', type: 'device', name: 'iPhone 14 Pro 256GB', price: 4890, costPrice: 3800, quantity: 1 }],
    },
    {
      id: 'sale-3',
      date: '2026-10-09',
      totalAmount: 7290,
      items: [{ id: 'i-3', type: 'device', name: 'iPhone 15 Pro Max 256GB', price: 7290, costPrice: 6100, quantity: 1 }],
    },
    {
      id: 'sale-4',
      date: '2026-10-12',
      totalAmount: 1750,
      items: [
        { id: 'i-4', type: 'device', name: 'iPhone 11 128GB', price: 1650, costPrice: 1100, quantity: 1 },
        { id: 'i-5', type: 'accessory', name: 'Capa Anti-Impacto', price: 60, costPrice: 18, quantity: 1 },
        { id: 'i-6', type: 'accessory', name: 'Película 3D', price: 40, costPrice: 10, quantity: 1 },
      ],
    },
  ],
  serviceOrders: [
    { id: 'os-1', osNumber: 1001, status: 'entregue', totalPrice: 450, laborCost: 250, partsCost: 200 },
    { id: 'os-2', osNumber: 1002, status: 'entregue', totalPrice: 280, laborCost: 160, partsCost: 120 },
    { id: 'os-3', osNumber: 1003, status: 'em_bancada', totalPrice: 390, laborCost: 220, partsCost: 170 },
  ],
};

export const financialIntelligenceRoutes: FastifyPluginAsync = async (app) => {
  // 1. Visão Geral Consolidada (DRE, Projeções, Cenários, Alertas)
  app.post('/overview', async (req) => {
    const body = (req.body as any) || {};
    const inputs: RawFinancialInputs = body.inputs || DEFAULT_INPUTS;
    const period = body.period || 'this_month';
    const overview = FinancialIntelligenceService.getConsolidatedOverview(inputs, period);
    return { success: true, data: overview };
  });

  app.get('/overview', async () => {
    const overview = FinancialIntelligenceService.getConsolidatedOverview(DEFAULT_INPUTS, 'this_month');
    return { success: true, data: overview };
  });

  // 2. Execução de Análise Financeira por IA
  app.post('/analyze', async (req) => {
    const body = (req.body as any) || {};
    const inputs: RawFinancialInputs = body.inputs || DEFAULT_INPUTS;
    const questionType = body.questionType || 'health_overview';
    const customQuestion = body.customQuestion;
    const period = body.period || 'this_month';

    const analysis = await FinancialIntelligenceService.runAIAnalysis(
      inputs,
      questionType,
      customQuestion,
      period
    );

    return { success: true, data: analysis };
  });

  // 3. Histórico de Análises Realizadas
  app.get('/history', async () => {
    const history = FinancialIntelligenceService.getAnalysisHistory();
    return { success: true, data: history };
  });

  // 4. Registro de Decisão Humana sobre Recomendação
  app.post('/decision', async (req, reply) => {
    const body = req.body as any;
    if (!body || !body.analysisId || !body.recommendationId || !body.actionTaken) {
      return reply.status(400).send({
        success: false,
        error: 'Campos obrigatórios: analysisId, recommendationId, actionTaken (approved | rejected | revised)',
      });
    }

    const decision = FinancialIntelligenceService.recordDecision({
      analysisId: body.analysisId,
      recommendationId: body.recommendationId,
      recommendationTitle: body.recommendationTitle || 'Recomendação Financeira',
      actionTaken: body.actionTaken,
      decidedBy: body.decidedBy || 'Rodrigo (Proprietário)',
      justification: body.justification || 'Decisão aprovada pelo gestor.',
      observedResult: body.observedResult,
    });

    return { success: true, data: decision };
  });

  // 5. Histórico de Decisões e Auditoria
  app.get('/decisions', async () => {
    const decisions = FinancialIntelligenceService.getDecisionHistory();
    return { success: true, data: decisions };
  });

  // 6. Configurações da IA e Parâmetros Financeiros
  app.get('/config', async () => {
    const config = FinancialIntelligenceService.getConfig();
    return { success: true, data: config };
  });

  app.post('/config', async (req) => {
    const body = (req.body as any) || {};
    const updated = FinancialIntelligenceService.updateConfig(body);
    return { success: true, data: updated };
  });
};
