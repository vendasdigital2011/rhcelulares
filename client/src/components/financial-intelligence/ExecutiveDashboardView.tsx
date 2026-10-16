import React from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Calendar,
  PieChart,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { FinancialConsolidatedData, FinancialIntelligenceSubtab } from '../../types.js';

interface ExecutiveDashboardViewProps {
  data: FinancialConsolidatedData;
  onNavigate: (tab: FinancialIntelligenceSubtab) => void;
  onRequestAI: (questionType: string) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  data,
  onNavigate,
  onRequestAI,
}) => {
  const { summary, dre, categoryProfitability, scenarios, alerts } = data;
  const d30Provavel = scenarios.d30.provavel;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. BANNER EXECUTIVO COM STATUS DE CONCILIAÇÃO & BOTÃO IA */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 14,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: '#3b82f6',
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Visão Financeira 360°
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={14} color="#10b981" />
              Saldos Conciliados em {data.accountsCount} Contas
            </span>
            {data.unreconciledTransactionsCount > 0 && (
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: 4 }}>
                {data.unreconciledTransactionsCount} a conciliar
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: 6 }}>
            Painel Executivo de Controladoria & Liquidez
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: 2, maxWidth: 680 }}>
            Dados auditados com separação rigorosa entre faturamento bruto, recebimentos em caixa, CMV real de aparelhos e despesas fixas.
          </p>
        </div>

        <button
          onClick={() => onRequestAI('health_overview')}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            border: 'none',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 10,
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={16} />
          <span>Solicitar Diagnóstico com IA</span>
        </button>
      </div>

      {/* 2. ALERTAS CRÍTICOS DETERMINÍSTICOS (SE HOUVER) */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map(alert => (
            <div
              key={alert.id}
              style={{
                background: alert.severity === 'critico' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${alert.severity === 'critico' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                borderRadius: 10,
                padding: '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle
                  size={20}
                  color={alert.severity === 'critico' ? '#ef4444' : '#f59e0b'}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                      {alert.title}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: alert.severity === 'critico' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                      color: alert.severity === 'critico' ? '#ef4444' : '#f59e0b',
                      textTransform: 'uppercase',
                    }}>
                      {alert.severity}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: 2 }}>
                    {alert.description} &bull; <em>Regra: {alert.ruleApplied}</em>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{alert.recommendedAction}</span>
                <button
                  onClick={() => onNavigate('payables_receivables')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. OS 10 INDICADORES PRINCIPAIS EXECUTIVOS */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
          10 Indicadores de Desempenho Financeiro (KPIs)
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}>
          {/* KPI 1: Saldo Atual Conciliado */}
          <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span>1. Saldo em Caixa e Bancos</span>
              <DollarSign size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', marginTop: 8 }}>
              R$ {summary.currentTotalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6 }}>
              Disponibilidade imediata (Santander, Caixa e Adquirentes).
            </div>
          </div>

          {/* KPI 2: Entradas Recebidas */}
          <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span>2. Entradas Realizadas (Mês)</span>
              <ArrowDownRight size={16} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#3b82f6', marginTop: 8 }}>
              R$ {summary.realizedInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6 }}>
              Dinheiro efetivamente liquidado no caixa/bancos.
            </div>
          </div>

          {/* KPI 3: Saídas Efetivamente Pagas */}
          <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span>3. Saídas Efetivamente Pagas</span>
              <ArrowUpRight size={16} color="#ef4444" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ef4444', marginTop: 8 }}>
              R$ {summary.realizedOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6 }}>
              Pagamentos realizados (fornecedores, aluguel, folha).
            </div>
          </div>

          {/* KPI 4: Resultado Operacional (EBITDA) */}
          <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span>4. Resultado Operacional</span>
              <TrendingUp size={16} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: dre.operationalResult >= 0 ? '#10b981' : '#ef4444', marginTop: 8 }}>
              R$ {dre.operationalResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6 }}>
              Lucro gerado pela atividade após custos e despesas fixas.
            </div>
          </div>

          {/* KPI 5: Contas a Pagar em Aberto */}
          <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span>5. Contas a Pagar em Aberto</span>
              <Clock size={16} color="#f97316" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
              R$ {summary.pendingBillsToPayAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: summary.overdueBillsToPayAmount > 0 ? '#ef4444' : '#64748b', marginTop: 6 }}>
              {summary.overdueBillsToPayAmount > 0
                ? `⚠️ R$ ${summary.overdueBillsToPayAmount.toFixed(2)} já estão vencidos!`
                : 'Nenhum título em atraso.'}
            </div>
          </div>

          {/* KPI 6: Contas a Receber em Aberto */}
          <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span>6. Contas a Receber em Aberto</span>
              <Calendar size={16} color="#06b6d4" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
              R$ {summary.pendingBillsToReceiveAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6 }}>
              Crediários próprios e serviços a faturar.
            </div>
          </div>

          {/* KPI 7: Inadimplência / Vencidos */}
          <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span>7. Taxa de Inadimplência</span>
              <AlertTriangle size={16} color={summary.defaultRatePercent > 10 ? '#ef4444' : '#f59e0b'} />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: summary.defaultRatePercent > 10 ? '#ef4444' : '#f59e0b', marginTop: 8 }}>
              {summary.defaultRatePercent.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6 }}>
              R$ {summary.overdueBillsToReceiveAmount.toFixed(2)} em atraso com clientes.
            </div>
          </div>

          {/* KPI 8: Margem Bruta & Líquida */}
          <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span>8. Margem Bruta / Líquida</span>
              <PieChart size={16} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#8b5cf6', marginTop: 8 }}>
              {dre.grossMarginPercent.toFixed(1)}% <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ {dre.netMarginPercent.toFixed(1)}%</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6 }}>
              Margem bruta sobre receita líquida após CMV.
            </div>
          </div>

          {/* KPI 9: Previsão do Saldo (30 Dias) */}
          <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span>9. Saldo Projetado (30d)</span>
              <BarChart3 size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: d30Provavel.projectedFinalBalance >= 0 ? '#10b981' : '#ef4444', marginTop: 8 }}>
              R$ {d30Provavel.projectedFinalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6 }}>
              Cenário provável considerando recebíveis e saídas.
            </div>
          </div>

          {/* KPI 10: Compromissos Próximos */}
          <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span>10. Compromissos (7 Dias)</span>
              <Clock size={16} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
              R$ {scenarios.d7.provavel.timeline.reduce((acc, t) => acc + t.outflow, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6 }}>
              Saídas previstas na próxima semana de operação.
            </div>
          </div>
        </div>
      </div>

      {/* 4. GRÁFICOS VISUAIS: ENTRADAS VS SAÍDAS & COMPOSIÇÃO DE RECEITAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20 }}>
        {/* GRÁFICO 1: ENTRADAS VS SAÍDAS */}
        <div style={{
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                Fluxo Realizado: Entradas vs Saídas
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Valores efetivamente movimentados nas contas e caixas
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', color: summary.netRealized >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
              Saldo Líquido: R$ {summary.netRealized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: 6 }}>
                <span>Entradas Recebidas (Receitas Operacionais)</span>
                <strong style={{ color: '#3b82f6' }}>R$ {summary.realizedInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ width: '100%', height: 12, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (summary.realizedInflows / Math.max(1, summary.realizedInflows + summary.realizedOutflows)) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                  borderRadius: 6,
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: 6 }}>
                <span>Saídas Pagas (Fornecedores & Despesas)</span>
                <strong style={{ color: '#ef4444' }}>R$ {summary.realizedOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ width: '100%', height: 12, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (summary.realizedOutflows / Math.max(1, summary.realizedInflows + summary.realizedOutflows)) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ef4444, #f87171)',
                  borderRadius: 6,
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* GRÁFICO 2: RENTABILIDADE POR CATEGORIA */}
        <div style={{
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                Rentabilidade e Margem por Linha de Negócio
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Margem bruta real apurada por categoria
              </p>
            </div>
            <button
              onClick={() => onNavigate('profitability')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Ver DRE Completo &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categoryProfitability.map((cat, idx) => {
              const color = idx === 0 ? '#3b82f6' : idx === 1 ? '#10b981' : '#f59e0b';
              return (
                <div key={cat.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#f8fafc', marginBottom: 4 }}>
                    <span>{cat.category}</span>
                    <span>
                      <strong style={{ color }}>{cat.marginPercent.toFixed(1)}% margem</strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem', marginLeft: 8 }}>
                        (R$ {cat.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })})
                      </span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, cat.marginPercent)}%`,
                      height: '100%',
                      background: color,
                      borderRadius: 4,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
