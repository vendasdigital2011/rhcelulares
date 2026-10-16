export type PeriodFilter = 'this_month' | 'last_month' | 'last_30_days' | 'last_90_days' | 'year_to_date';

export interface DREMetrics {
  period: string;
  grossRevenue: number;
  cardFeesAndDiscounts: number;
  netRevenue: number;
  cmvTotal: number;
  cmvDevices: number;
  cmvAccessories: number;
  cmvParts: number;
  grossProfit: number;
  grossMarginPercent: number;
  operationalExpenses: number;
  operationalResult: number; // EBITDA / LAJIR
  netResult: number;
  netMarginPercent: number;
  ticketMediumSales: number;
  ticketMediumOS: number;
  totalSalesCount: number;
  totalOSCount: number;
  dataQuality: 'complete' | 'estimated' | 'partial';
  notes: string[];
}

export interface CategoryProfitability {
  category: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  marginPercent: number;
  volume: number;
  shareOfTotalRevenuePercent: number;
}

export interface CashFlowPeriodSummary {
  period: string;
  realizedInflows: number;
  realizedOutflows: number;
  netRealized: number;
  currentTotalBalance: number;
  reconciledBalance: number;
  pendingBillsToPayAmount: number;
  overdueBillsToPayAmount: number;
  pendingBillsToReceiveAmount: number;
  overdueBillsToReceiveAmount: number;
  defaultRatePercent: number;
}

export interface CashFlowDayPoint {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

export interface CashFlowScenario {
  daysHorizon: 7 | 30 | 60 | 90;
  scenarioType: 'provavel' | 'pessimista' | 'otimista';
  title: string;
  projectedFinalBalance: number;
  lowestBalanceInPeriod: number;
  lowestBalanceDate: string;
  riskOfCashShortage: boolean;
  shortageAmount: number;
  assumptions: string[];
  timeline: CashFlowDayPoint[];
}

export interface FinancialAlert {
  id: string;
  type: 'cash_shortage' | 'overdue_bill_pay' | 'overdue_bill_receive' | 'margin_drop' | 'expense_spike' | 'unreconciled_divergence';
  severity: 'info' | 'alerta' | 'critico';
  title: string;
  description: string;
  detectedValue: string;
  ruleApplied: string;
  recommendedAction: string;
}

export interface FinancialConsolidatedData {
  summary: CashFlowPeriodSummary;
  dre: DREMetrics;
  categoryProfitability: CategoryProfitability[];
  scenarios: {
    d7: { provavel: CashFlowScenario; pessimista: CashFlowScenario; otimista: CashFlowScenario };
    d30: { provavel: CashFlowScenario; pessimista: CashFlowScenario; otimista: CashFlowScenario };
    d60: { provavel: CashFlowScenario; pessimista: CashFlowScenario; otimista: CashFlowScenario };
    d90: { provavel: CashFlowScenario; pessimista: CashFlowScenario; otimista: CashFlowScenario };
  };
  alerts: FinancialAlert[];
  accountsCount: number;
  unreconciledTransactionsCount: number;
  lastUpdated: string;
}

export interface PrioritizedRecommendation {
  id: string;
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  action: string;
  justification: string;
  estimatedFinancialImpact: string;
  status: 'pending' | 'approved' | 'rejected';
  category: 'custos' | 'preco_margem' | 'cobranca' | 'estoque' | 'fornecedores' | 'metas';
}

export interface AIStructuredAnalysis {
  id: string;
  createdAt: string;
  period: string;
  questionRequested: string;
  modelUsed: string;
  source: 'openai' | 'deterministic_engine';
  executiveSummary: string;
  identifiedSituation: string;
  evidenceAndValues: Array<{ metric: string; value: string; context: string }>;
  comparisonWithPast: string;
  identifiedRisks: Array<{ risk: string; severity: 'baixa' | 'media' | 'alta' | 'critica'; explanation: string }>;
  possibleScenarios: Array<{ name: string; probability: string; outcome: string }>;
  prioritizedRecommendations: PrioritizedRecommendation[];
  estimatedFinancialImpactSummary: string;
  assumptionsAndLimitations: string[];
  additionalDataNeeded: string[];
  distinctionBreakdown: {
    factsObserved: string[];
    systemCalculations: string[];
    estimates: string[];
    hypotheses: string[];
    recommendations: string[];
  };
}

export interface FinancialDecisionRecord {
  id: string;
  analysisId: string;
  recommendationId: string;
  recommendationTitle: string;
  actionTaken: 'approved' | 'rejected' | 'revised';
  decidedBy: string;
  decidedAt: string;
  justification: string;
  observedResult?: string;
}

export interface FinancialIntelligenceConfig {
  openaiApiKeyConfigured: boolean;
  openaiApiKeyMasked?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  defaultCardFeeRate: number;
  targetGrossMargin: number;
  targetNetMargin: number;
  minCashReserveDays: number;
}
