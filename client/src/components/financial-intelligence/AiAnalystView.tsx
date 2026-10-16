import React, { useState } from 'react';
import {
  Sparkles,
  Send,
} from 'lucide-react';
import type { FinancialConsolidatedData, AIStructuredAnalysis } from '../../types.js';
import { FinancialIntelligenceRepository } from '../../repositories/financialIntelligenceRepository.js';

interface AiAnalystViewProps {
  data: FinancialConsolidatedData;
  onApproveRecommendation?: (recId: string) => void;
}

const PRESET_QUESTIONS = [
  { id: 'health_overview', text: 'Como está a saúde financeira da minha loja?' },
  { id: 'cash_risk_30d', text: 'Existe risco de faltar dinheiro nos próximos 30 dias?' },
  { id: 'expense_growth', text: 'Quais despesas mais cresceram?' },
  { id: 'spend_safety', text: 'Quanto posso gastar sem comprometer o caixa?' },
  { id: 'category_margin', text: 'Quais categorias estão gerando maior margem?' },
  { id: 'revenue_up_cash_down', text: 'Por que meu faturamento cresceu, mas meu saldo diminuiu?' },
  { id: 'priority_bills', text: 'Quais contas merecem prioridade?' },
  { id: 'scenarios_90d', text: 'Qual é o cenário financeiro dos próximos 90 dias?' },
  { id: 'attention_indicators', text: 'Quais indicadores precisam de atenção?' },
  { id: 'profitability_investigation', text: 'O que devo investigar para melhorar minha rentabilidade?' },
];

export const AiAnalystView: React.FC<AiAnalystViewProps> = ({ data }) => {
  const [analysis, setAnalysis] = useState<AIStructuredAnalysis | null>(() => {
    const hist = FinancialIntelligenceRepository.getAnalysisHistory();
    return hist.length > 0 ? hist[0] : null;
  });
  const [loading, setLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('health_overview');

  const handleRunAnalysis = async (type: string, query?: string) => {
    setLoading(true);
    try {
      const res = await FinancialIntelligenceRepository.requestAIAnalysis(data, type, query);
      setAnalysis(res);
    } catch (e: any) {
      alert(`Erro ao executar análise: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. SELETOR DE PERGUNTAS & CHAT COM ANALISTA IA */}
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            width: 32,
            height: 32,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
              Analista Financeiro IA &bull; Inteligência & Apoio à Decisão
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Faça perguntas sobre seu fluxo de caixa, rentabilidade e riscos. A IA interpreta os dados determinísticos sem inventar números.
            </p>
          </div>
        </div>

        {/* 10 PERGUNTAS RÁPIDAS EXECUTIVAS */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: 8 }}>
            Perguntas Frequentes do Proprietário:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESET_QUESTIONS.map(q => (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedPreset(q.id);
                  handleRunAnalysis(q.id);
                }}
                disabled={loading}
                style={{
                  background: selectedPreset === q.id ? '#3b82f6' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  fontWeight: selectedPreset === q.id ? 800 : 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>

        {/* CAMPO DE PERGUNTA LIVRE */}
        <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Ou digite sua pergunta específica sobre a situação financeira da loja..."
            value={customQuery}
            onChange={e => setCustomQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && customQuery.trim()) {
                handleRunAnalysis('custom', customQuery.trim());
              }
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 8,
              color: '#fff',
              fontSize: '0.85rem',
            }}
          />
          <button
            onClick={() => customQuery.trim() && handleRunAnalysis('custom', customQuery.trim())}
            disabled={loading || !customQuery.trim()}
            style={{
              background: '#3b82f6',
              border: 'none',
              color: '#fff',
              padding: '0 20px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: loading || !customQuery.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !customQuery.trim() ? 0.6 : 1,
            }}
          >
            <Send size={15} />
            <span>{loading ? 'Analisando...' : 'Consultar'}</span>
          </button>
        </div>
      </div>

      {/* 2. EXIBIÇÃO DA ANÁLISE ESTRUTURADA (10 TÓPICOS OBRIGATÓRIOS) */}
      {analysis && (
        <div style={{
          background: '#0d1322',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 14,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          {/* HEADER DO RESULTADO */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: analysis.source === 'openai' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  color: analysis.source === 'openai' ? '#10b981' : '#3b82f6',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}>
                  {analysis.source === 'openai' ? `OpenAI (${analysis.modelUsed})` : 'Motor Determinístico de Controladoria'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {new Date(analysis.createdAt).toLocaleString('pt-BR')} &bull; {analysis.period}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginTop: 6 }}>
                "{analysis.questionRequested}"
              </h3>
            </div>
          </div>

          {/* 1. RESUMO EXECUTIVO */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 6 }}>
              1. Resumo Executivo
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              {analysis.executiveSummary}
            </p>
          </div>

          {/* 2. SITUAÇÃO IDENTIFICADA & EVIDÊNCIAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 10 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 6 }}>
                2. Diagnóstico da Situação
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                {analysis.identifiedSituation}
              </p>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 8 }}>
                <strong>Comparativo:</strong> {analysis.comparisonWithPast}
              </div>
            </div>

            {/* 3. EVIDÊNCIAS E VALORES UTILIZADOS */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 10 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: 8 }}>
                3. Evidências e Valores Utilizados
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {analysis.evidenceAndValues.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: 4 }}>
                    <span style={{ color: '#cbd5e1' }}>{ev.metric}</span>
                    <strong style={{ color: '#f8fafc' }}>{ev.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. SEPARAÇÃO EXPLÍCITA OBRIGATÓRIA (FATOS, CÁLCULOS, ESTIMATIVAS, HIPÓTESES, RECOMENDAÇÕES) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 10,
            padding: 16,
          }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: 12 }}>
              Transparência Epistêmica &bull; Distinção de Natureza dos Dados
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>📌 Fatos Observados:</span>
                <ul style={{ fontSize: '0.72rem', color: '#94a3b8', paddingLeft: 14, margin: '4px 0 0 0' }}>
                  {analysis.distinctionBreakdown?.factsObserved?.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>⚙️ Cálculos do Sistema:</span>
                <ul style={{ fontSize: '0.72rem', color: '#94a3b8', paddingLeft: 14, margin: '4px 0 0 0' }}>
                  {analysis.distinctionBreakdown?.systemCalculations?.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>📊 Estimativas:</span>
                <ul style={{ fontSize: '0.72rem', color: '#94a3b8', paddingLeft: 14, margin: '4px 0 0 0' }}>
                  {analysis.distinctionBreakdown?.estimates?.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase' }}>💡 Hipóteses:</span>
                <ul style={{ fontSize: '0.72rem', color: '#94a3b8', paddingLeft: 14, margin: '4px 0 0 0' }}>
                  {analysis.distinctionBreakdown?.hypotheses?.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* 5. RISCOS IDENTIFICADOS & CENÁRIOS POSSÍVEIS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {/* Riscos */}
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: 16, borderRadius: 10 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: 8 }}>
                5. Riscos Identificados
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analysis.identifiedRisks.map((r, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', color: '#f8fafc' }}>
                    <div style={{ fontWeight: 700, color: r.severity === 'alta' ? '#ef4444' : '#f59e0b' }}>
                      &bull; {r.risk} ({r.severity})
                    </div>
                    <div style={{ color: '#94a3b8', paddingLeft: 10 }}>{r.explanation}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cenários */}
            <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: 16, borderRadius: 10 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', marginBottom: 8 }}>
                6. Cenários Projetados
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analysis.possibleScenarios.map((sc, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', color: '#f8fafc' }}>
                    <div style={{ fontWeight: 700, color: '#60a5fa' }}>
                      &bull; {sc.name} ({sc.probability})
                    </div>
                    <div style={{ color: '#94a3b8', paddingLeft: 10 }}>{sc.outcome}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7. RECOMENDAÇÕES PRIORIZADAS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                7. Recomendações Priorizadas para Aprovação Humana
              </h4>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Recomendações não executam alterações financeiras sem você.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analysis.prioritizedRecommendations.map(rec => (
                <div
                  key={rec.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    padding: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        background: '#3b82f6',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}>
                        Prioridade {rec.priority}
                      </span>
                      <strong style={{ fontSize: '0.82rem', color: '#f8fafc' }}>{rec.title}</strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: 4 }}>
                      {rec.action}
                    </p>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
                      <strong>Justificativa:</strong> {rec.justification} &bull; <strong>Impacto:</strong> <span style={{ color: '#10b981' }}>{rec.estimatedFinancialImpact}</span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: rec.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : rec.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: rec.status === 'approved' ? '#10b981' : rec.status === 'rejected' ? '#ef4444' : '#f59e0b',
                    textTransform: 'uppercase',
                  }}>
                    {rec.status === 'approved' ? 'Aprovada' : rec.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 8. IMPACTO FINANCEIRO CONSOLIDADO & PREMISSAS */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 10,
            padding: 14,
            fontSize: '0.75rem',
            color: '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            <div>
              <strong style={{ color: '#cbd5e1' }}>8. Impacto Financeiro Consolidado:</strong> {analysis.estimatedFinancialImpactSummary}
            </div>
            <div>
              <strong style={{ color: '#cbd5e1' }}>9. Premissas e Limitações:</strong> {analysis.assumptionsAndLimitations.join(' &bull; ')}
            </div>
            <div>
              <strong style={{ color: '#cbd5e1' }}>10. Dados Complementares Necessários:</strong> {analysis.additionalDataNeeded.join(' &bull; ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
