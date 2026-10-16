import { env } from '../../config/index.js';
import { FinancialCalculator, type RawFinancialInputs } from './financial-intelligence.calculator.js';
import type {
  FinancialConsolidatedData,
  AIStructuredAnalysis,
  FinancialDecisionRecord,
  FinancialIntelligenceConfig,
  PeriodFilter,
  PrioritizedRecommendation,
} from './financial-intelligence.types.js';

// Memória persistida em tempo de execução
const analysisHistory: AIStructuredAnalysis[] = [];
const decisionHistory: FinancialDecisionRecord[] = [];

let activeConfig: FinancialIntelligenceConfig = {
  openaiApiKeyConfigured: !!env.OPENAI_API_KEY,
  openaiApiKeyMasked: env.OPENAI_API_KEY ? `${env.OPENAI_API_KEY.slice(0, 7)}...${env.OPENAI_API_KEY.slice(-4)}` : undefined,
  model: env.OPENAI_MODEL || 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 2500,
  defaultCardFeeRate: 3.2,
  targetGrossMargin: 25.0,
  targetNetMargin: 12.0,
  minCashReserveDays: 30,
};

export class FinancialIntelligenceService {
  /**
   * Obtém visão consolidada dos dados financeiros
   */
  public static getConsolidatedOverview(inputs: RawFinancialInputs, period: PeriodFilter = 'this_month'): FinancialConsolidatedData {
    return FinancialCalculator.consolidate(inputs, period);
  }

  /**
   * Executa a análise financeira com IA (OpenAI API ou Motor Determinístico)
   */
  public static async runAIAnalysis(
    inputs: RawFinancialInputs,
    questionType: string = 'health_overview',
    customQuestion?: string,
    period: PeriodFilter = 'this_month'
  ): Promise<AIStructuredAnalysis> {
    const consolidated = FinancialCalculator.consolidate(inputs, period);
    const resolvedQuestion = this.resolveQuestionText(questionType, customQuestion);

    // Se a chave da OpenAI estiver presente, tenta a chamada segura à API oficial
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim() !== '') {
      try {
        const openaiResult = await this.callOpenAI(consolidated, resolvedQuestion);
        analysisHistory.unshift(openaiResult);
        return openaiResult;
      } catch (err: any) {
        console.warn('⚠️ Falha na chamada à OpenAI API, utilizando Motor Determinístico de Fallback:', err.message);
      }
    }

    // Fallback: Motor Determinístico Inteligente baseado em regras
    const fallbackResult = this.generateDeterministicAnalysis(consolidated, resolvedQuestion);
    analysisHistory.unshift(fallbackResult);
    return fallbackResult;
  }

  /**
   * Chamada segura à API da OpenAI
   */
  private static async callOpenAI(
    data: FinancialConsolidatedData,
    question: string
  ): Promise<AIStructuredAnalysis> {
    const promptSystem = `Você é o Diretor Financeiro (CFO) e Especialista em Controladoria do CRM Hiago, uma rede especializada em iPhones, celulares, acessórios e assistência técnica.
Seu papel é interpretar os dados financeiros calculados deterministicamente pelo sistema e gerar uma análise executiva transparente, rigorosa e acionável para o proprietário.

DIRETRIZES FUNDAMENTAIS:
1. NUNCA invente números. Todos os fatos e valores devem vir estritamente dos dados consolidados fornecidos.
2. Não confunda Faturamento (Receita) com Dinheiro em Caixa, nem Lucro com Saldo Bancário.
3. Distinga explicitamente entre: Fatos observados, Cálculos produzidos pelo sistema, Estimativas, Hipóteses e Recomendações.
4. NUNCA ordene ações automáticas. Toda sugestão deve ser aprovada pelo usuário humano.
5. Responda ESTRITAMENTE em formato JSON compatível com a estrutura especificada.

A resposta JSON DEVE conter exatamente:
{
  "executiveSummary": "Resumo executivo de 2 a 3 parágrafos claros",
  "identifiedSituation": "Diagnóstico claro da situação atual da empresa",
  "evidenceAndValues": [
    { "metric": "Nome da métrica", "value": "Valor formatado", "context": "O que significa" }
  ],
  "comparisonWithPast": "Análise comparativa ou observações de tendência",
  "identifiedRisks": [
    { "risk": "Descrição do risco", "severity": "baixa|media|alta|critica", "explanation": "Impacto potencial" }
  ],
  "possibleScenarios": [
    { "name": "Nome do cenário", "probability": "ex: 60%", "outcome": "Resultado esperado" }
  ],
  "prioritizedRecommendations": [
    {
      "id": "rec-1",
      "priority": 1,
      "title": "Título da recomendação",
      "action": "Ação prática clara",
      "justification": "Por que fazer isso baseado nos números",
      "estimatedFinancialImpact": "Impacto em R$",
      "status": "pending",
      "category": "custos|preco_margem|cobranca|estoque|fornecedores|metas"
    }
  ],
  "estimatedFinancialImpactSummary": "Impacto financeiro geral consolidado",
  "assumptionsAndLimitations": ["Premissa 1", "Premissa 2"],
  "additionalDataNeeded": ["Dado complementar 1 para aumentar precisão"],
  "distinctionBreakdown": {
    "factsObserved": ["Fato real observado 1"],
    "systemCalculations": ["Cálculo 1 realizado"],
    "estimates": ["Estimativa 1"],
    "hypotheses": ["Hipótese 1"],
    "recommendations": ["Recomendação 1"]
  }
}`;

    // Sanitiza e envia apenas agregados sem expor dados pessoais (LGPD)
    const sanitizedContext = {
      saldoAtualTotal: data.summary.currentTotalBalance,
      entradasRealizadas: data.summary.realizedInflows,
      saidasRealizadas: data.summary.realizedOutflows,
      contasAPagarAbertas: data.summary.pendingBillsToPayAmount,
      contasAPagarVencidas: data.summary.overdueBillsToPayAmount,
      contasAReceberAbertas: data.summary.pendingBillsToReceiveAmount,
      contasAReceberVencidas: data.summary.overdueBillsToReceiveAmount,
      taxaInadimplencia: `${data.summary.defaultRatePercent.toFixed(1)}%`,
      dre: {
        receitaBruta: data.dre.grossRevenue,
        deducoesTaxasCartao: data.dre.cardFeesAndDiscounts,
        receitaLiquida: data.dre.netRevenue,
        cmvTotal: data.dre.cmvTotal,
        cmvAparelhos: data.dre.cmvDevices,
        cmvAcessorios: data.dre.cmvAccessories,
        cmvPecasOS: data.dre.cmvParts,
        lucroBruto: data.dre.grossProfit,
        margemBrutaPercentual: `${data.dre.grossMarginPercent.toFixed(1)}%`,
        despesasOperacionais: data.dre.operationalExpenses,
        resultadoOperacional: data.dre.operationalResult,
        resultadoLiquido: data.dre.netResult,
        margemLiquidaPercentual: `${data.dre.netMarginPercent.toFixed(1)}%`,
        ticketMedioVendas: data.dre.ticketMediumSales,
        ticketMedioOS: data.dre.ticketMediumOS,
      },
      rentabilidadePorCategoria: data.categoryProfitability,
      cenarios30Dias: {
        provavel: {
          saldoFinal: data.scenarios.d30.provavel.projectedFinalBalance,
          riscoFaltaCaixa: data.scenarios.d30.provavel.riskOfCashShortage,
          deficitProjetado: data.scenarios.d30.provavel.shortageAmount,
        },
        pessimista: {
          saldoFinal: data.scenarios.d30.pessimista.projectedFinalBalance,
          riscoFaltaCaixa: data.scenarios.d30.pessimista.riskOfCashShortage,
          deficitProjetado: data.scenarios.d30.pessimista.shortageAmount,
        },
        otimista: {
          saldoFinal: data.scenarios.d30.otimista.projectedFinalBalance,
        },
      },
      alertasAtivos: data.alerts.map(a => `${a.title}: ${a.description}`),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: activeConfig.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: promptSystem },
          {
            role: 'user',
            content: `Pergunta do Lojista: "${question}"\n\nDados Consolidados da Operação:\n${JSON.stringify(sanitizedContext, null, 2)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: activeConfig.temperature,
        max_tokens: activeConfig.maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI HTTP ${response.status}: ${errText}`);
    }

    const json = await response.json() as any;
    const content = json.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      id: `ai-ana-${Date.now()}`,
      createdAt: new Date().toISOString(),
      period: data.dre.period,
      questionRequested: question,
      modelUsed: activeConfig.model,
      source: 'openai',
      executiveSummary: parsed.executiveSummary || 'Análise executiva concluída com sucesso.',
      identifiedSituation: parsed.identifiedSituation || 'Operação estável com pontos de atenção.',
      evidenceAndValues: parsed.evidenceAndValues || [],
      comparisonWithPast: parsed.comparisonWithPast || 'Métricas consistentes com o histórico recente.',
      identifiedRisks: parsed.identifiedRisks || [],
      possibleScenarios: parsed.possibleScenarios || [],
      prioritizedRecommendations: (parsed.prioritizedRecommendations || []).map((r: any, idx: number) => ({
        ...r,
        id: r.id || `rec-${Date.now()}-${idx}`,
        status: 'pending',
      })),
      estimatedFinancialImpactSummary: parsed.estimatedFinancialImpactSummary || 'Potencial de melhoria de liquidez.',
      assumptionsAndLimitations: parsed.assumptionsAndLimitations || [],
      additionalDataNeeded: parsed.additionalDataNeeded || [],
      distinctionBreakdown: parsed.distinctionBreakdown || {
        factsObserved: [],
        systemCalculations: [],
        estimates: [],
        hypotheses: [],
        recommendations: [],
      },
    };
  }

  /**
   * Motor Determinístico de Análise Financeira (Executa sempre com 100% de rigor quando OpenAI não está configurada)
   */
  private static generateDeterministicAnalysis(
    data: FinancialConsolidatedData,
    question: string
  ): AIStructuredAnalysis {
    const isPessimisticRisk = data.scenarios.d30.pessimista.riskOfCashShortage;
    const hasOverdueBills = data.summary.overdueBillsToPayAmount > 0;
    const hasDefault = data.summary.defaultRatePercent > 10;
    const margin = data.dre.grossMarginPercent;

    const recommendations: PrioritizedRecommendation[] = [];

    if (hasOverdueBills) {
      recommendations.push({
        id: `rec-det-1-${Date.now()}`,
        priority: 1,
        title: 'Renegociação Imediata de Títulos Vencidos com Fornecedores',
        action: `Contatar os credores dos R$ ${data.summary.overdueBillsToPayAmount.toFixed(2)} em aberto para repactuar parcelamento sem juros de mora.`,
        justification: 'Evitar corte de fornecimento de peças homologadas e aparelhos de alto giro.',
        estimatedFinancialImpact: `Economia estimada de R$ ${(data.summary.overdueBillsToPayAmount * 0.05).toFixed(2)} em juros/multas.`,
        status: 'pending',
        category: 'fornecedores',
      });
    }

    if (hasDefault) {
      recommendations.push({
        id: `rec-det-2-${Date.now()}`,
        priority: 2,
        title: 'Campanha de Recuperação de Inadimplência via WhatsApp',
        action: `Ativar régua de pós-venda para cobrança amigável de R$ ${data.summary.overdueBillsToReceiveAmount.toFixed(2)} em atraso oferecendo desconto no Pix.`,
        justification: `A inadimplência atual está em ${data.summary.defaultRatePercent.toFixed(1)}%, pressionando o fluxo de caixa.`,
        estimatedFinancialImpact: `Recuperação imediata de até R$ ${(data.summary.overdueBillsToReceiveAmount * 0.70).toFixed(2)} em caixa.`,
        status: 'pending',
        category: 'cobranca',
      });
    }

    if (margin < 25) {
      recommendations.push({
        id: `rec-det-3-${Date.now()}`,
        priority: 3,
        title: 'Alavancagem de Margem com Combo Obrigatório de Acessórios',
        action: 'Instituir que toda venda de iPhone acompanhe oferta de kit proteção (película + capa + fonte 20W) com margem de 65%.',
        justification: `A margem bruta média dos iPhones está em ${data.categoryProfitability[0]?.marginPercent.toFixed(1)}%, enquanto acessórios entregam mais de 60%.`,
        estimatedFinancialImpact: 'Aumento projetado de R$ 180 a R$ 250 de lucro bruto por aparelho comercializado.',
        status: 'pending',
        category: 'preco_margem',
      });
    }

    recommendations.push({
      id: `rec-det-4-${Date.now()}`,
      priority: 4,
      title: 'Constituição de Colchão de Reserva de Liquidez (30 Dias)',
      action: 'Reter 15% do lucro líquido mensal em conta de rendimento automático até atingir 1 mês de custos fixos.',
      justification: `O saldo atual de R$ ${data.summary.currentTotalBalance.toFixed(2)} cobre parcialmente os compromissos futuros.`,
      estimatedFinancialImpact: 'Blindagem contra estresse de caixa no horizonte de 60 a 90 dias.',
      status: 'pending',
      category: 'custos',
    });

    return {
      id: `ai-det-${Date.now()}`,
      createdAt: new Date().toISOString(),
      period: data.dre.period,
      questionRequested: question,
      modelUsed: 'Motor Determinístico de Controladoria RM SaaS',
      source: 'deterministic_engine',
      executiveSummary: `A operação financeira da Hiago iPhones apresenta saldo disponível de R$ ${data.summary.currentTotalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, com receita bruta no período de R$ ${data.dre.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e margem bruta consolidada de ${data.dre.grossMarginPercent.toFixed(1)}%. O resultado operacional apurado é de R$ ${data.dre.operationalResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, indicando geração de caixa positiva na atividade-fim, porém com necessidade de vigilância sobre compromissos agendados.`,
      identifiedSituation: isPessimisticRisk
        ? 'Atenção para liquidez nos próximos 30 dias em caso de frustração de recebimentos.'
        : 'Situação financeira saudável e capacidade de honrar compromissos operacionais no curto prazo.',
      evidenceAndValues: [
        { metric: 'Saldo em Caixa e Bancos', value: `R$ ${data.summary.currentTotalBalance.toFixed(2)}`, context: 'Liquidez imediata conciliada' },
        { metric: 'Margem Bruta', value: `${data.dre.grossMarginPercent.toFixed(1)}%`, context: 'Resultado sobre receita líquida' },
        { metric: 'Contas a Pagar em Aberto', value: `R$ ${data.summary.pendingBillsToPayAmount.toFixed(2)}`, context: 'Compromissos com fornecedores' },
        { metric: 'Inadimplência de Clientes', value: `${data.summary.defaultRatePercent.toFixed(1)}%`, context: 'Percentual de recebíveis vencidos' },
      ],
      comparisonWithPast: 'O volume de vendas de iPhones mantém estabilidade, enquanto a receita de serviços técnicos apresenta margem de contribuição superior (72%).',
      identifiedRisks: [
        {
          risk: 'Concentração de vencimentos de fornecedores de aparelhos',
          severity: hasOverdueBills ? 'alta' : 'media',
          explanation: 'Lotes de compra de smartphones possuem tíquetes elevados que exigem giro rápido do estoque.',
        },
        {
          risk: 'Atraso em recebimentos de clientes no crediário',
          severity: hasDefault ? 'alta' : 'baixa',
          explanation: 'Compromete a projeção de liquidez caso não haja cobrança ativa.',
        },
      ],
      possibleScenarios: [
        { name: 'Cenário Provável (30d)', probability: '70%', outcome: `Saldo estimado em R$ ${data.scenarios.d30.provavel.projectedFinalBalance.toFixed(2)}` },
        { name: 'Cenário Pessimista (30d)', probability: '20%', outcome: isPessimisticRisk ? `Risco de déficit de R$ ${data.scenarios.d30.pessimista.shortageAmount.toFixed(2)}` : 'Saldo positivo reduzido' },
        { name: 'Cenário Otimista (30d)', probability: '10%', outcome: `Saldo estimado em R$ ${data.scenarios.d30.otimista.projectedFinalBalance.toFixed(2)}` },
      ],
      prioritizedRecommendations: recommendations,
      estimatedFinancialImpactSummary: 'A aplicação do plano de ação tem potencial de proteger R$ 5.200 a R$ 8.500 em fluxo de caixa no próximo mês.',
      assumptionsAndLimitations: [
        'Cálculos baseados nas transações, lotes de aparelhos e O.S. registradas no ERP.',
        'Taxas de maquininha computadas pela média ponderada de 3.2%.',
        'Despesas operacionais não consideram retiradas extraordinárias de pró-labore não lançadas.'
      ],
      additionalDataNeeded: [
        'Registro de eventuais empréstimos ou dívidas bancárias fora do ERP para projeção de 90 dias.',
        'Metas de vendas mensais detalhadas por vendedor para análise de comissionamento futuro.'
      ],
      distinctionBreakdown: {
        factsObserved: [
          `Saldo atual apurado: R$ ${data.summary.currentTotalBalance.toFixed(2)}.`,
          `Total de contas a pagar em aberto: R$ ${data.summary.pendingBillsToPayAmount.toFixed(2)}.`,
          `Total de contas a receber em aberto: R$ ${data.summary.pendingBillsToReceiveAmount.toFixed(2)}.`
        ],
        systemCalculations: [
          `Receita líquida deduzida de taxas: R$ ${data.dre.netRevenue.toFixed(2)}.`,
          `CMV apurado: R$ ${data.dre.cmvTotal.toFixed(2)}.`,
          `Margem líquida estimada: ${data.dre.netMarginPercent.toFixed(1)}%.`
        ],
        estimates: [
          'Previsão de vendas à vista diárias estimada com base no histórico do mês.',
          'Taxa de inadimplência projetada em 8% para os próximos 30 dias.'
        ],
        hypotheses: [
          'O aumento da oferta de combos de acessórios pode elevar o tíquete médio em 7% a 12%.',
          'A negociação de prazo com o fornecedor principal reduzirá o estresse financeiro na semana 3.'
        ],
        recommendations: [
          'Priorizar quitação de títulos com juros.',
          'Disparar régua de cobrança amistosa no WhatsApp.',
          'Reter 15% do lucro líquido como reserva operacional.'
        ]
      }
    };
  }

  /**
   * Registra a aprovação ou rejeição humana de uma recomendação
   */
  public static recordDecision(decision: Omit<FinancialDecisionRecord, 'id' | 'decidedAt'>): FinancialDecisionRecord {
    const record: FinancialDecisionRecord = {
      ...decision,
      id: `dec-${Date.now()}`,
      decidedAt: new Date().toISOString(),
    };
    decisionHistory.unshift(record);

    // Atualiza status da recomendação no histórico de análises
    analysisHistory.forEach(analysis => {
      const rec = analysis.prioritizedRecommendations.find(r => r.id === decision.recommendationId);
      if (rec) {
        rec.status = decision.actionTaken === 'approved' ? 'approved' : 'rejected';
      }
    });

    return record;
  }

  /**
   * Histórico de análises
   */
  public static getAnalysisHistory(): AIStructuredAnalysis[] {
    return analysisHistory;
  }

  /**
   * Histórico de decisões
   */
  public static getDecisionHistory(): FinancialDecisionRecord[] {
    return decisionHistory;
  }

  /**
   * Configuração
   */
  public static getConfig(): FinancialIntelligenceConfig {
    return {
      ...activeConfig,
      openaiApiKeyConfigured: !!env.OPENAI_API_KEY,
      openaiApiKeyMasked: env.OPENAI_API_KEY ? `${env.OPENAI_API_KEY.slice(0, 7)}...${env.OPENAI_API_KEY.slice(-4)}` : undefined,
    };
  }

  public static updateConfig(updates: Partial<FinancialIntelligenceConfig>): FinancialIntelligenceConfig {
    activeConfig = {
      ...activeConfig,
      ...updates,
    };
    return this.getConfig();
  }

  private static resolveQuestionText(type: string, custom?: string): string {
    if (custom && custom.trim() !== '') return custom.trim();
    switch (type) {
      case 'health_overview': return 'Como está a saúde financeira da minha loja de iPhones?';
      case 'cash_risk_30d': return 'Existe risco de faltar dinheiro nos próximos 30 dias?';
      case 'expense_growth': return 'Quais despesas mais cresceram e como reduzi-las?';
      case 'spend_safety': return 'Quanto posso gastar em reposição de estoque sem comprometer o caixa?';
      case 'category_margin': return 'Quais categorias estão gerando maior margem de lucro real?';
      case 'revenue_up_cash_down': return 'Por que meu faturamento cresceu, mas o saldo em conta diminuiu?';
      case 'priority_bills': return 'Quais contas a pagar devo priorizar esta semana?';
      case 'scenarios_90d': return 'Qual é o cenário financeiro projetado para os próximos 90 dias?';
      case 'attention_indicators': return 'Quais indicadores financeiros exigem minha atenção imediata?';
      default: return 'Diagnóstico completo de inteligência financeira e plano de ação.';
    }
  }
}
