import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import type { FinancialConsolidatedData, CashFlowScenario } from '../../types.js';

interface CashFlowViewProps {
  data: FinancialConsolidatedData;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({ data }) => {
  const [horizon, setHorizon] = useState<7 | 30 | 60 | 90>(30);
  const [selectedScenarioType, setSelectedScenarioType] = useState<'provavel' | 'pessimista' | 'otimista'>('provavel');

  const scenarioGroup = horizon === 7 ? data.scenarios.d7
    : horizon === 30 ? data.scenarios.d30
    : horizon === 60 ? data.scenarios.d60
    : data.scenarios.d90;

  const currentScenario: CashFlowScenario = scenarioGroup[selectedScenarioType];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. CABEÇALHO DA SEÇÃO DE FLUXO DE CAIXA */}
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
            Fluxo de Caixa Realizado & Projeções Futuras
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
            Acompanhe as entradas e saídas efetivas e projete a liquidez nos horizontes de 7, 30, 60 e 90 dias.
          </p>
        </div>

        {/* SELETOR DE HORIZONTE DE DIAS */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          padding: 3,
        }}>
          {([7, 30, 60, 90] as const).map(d => (
            <button
              key={d}
              onClick={() => setHorizon(d)}
              style={{
                background: horizon === d ? '#3b82f6' : 'transparent',
                color: horizon === d ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {d} Dias
            </button>
          ))}
        </div>
      </div>

      {/* 2. CARDS RESUMO DO FLUXO REALIZADO (MÊS ATUAL) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {/* Entradas */}
        <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3b82f6', fontSize: '0.78rem', fontWeight: 700 }}>
            <span>Total de Entradas Realizadas</span>
            <ArrowDownRight size={18} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6', marginTop: 8 }}>
            R$ {data.summary.realizedInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div>&bull; Vendas de iPhones liquidadas em caixa e Stone</div>
            <div>&bull; Recebimentos de O.S. de assistência técnica</div>
            <div>&bull; Vendas de acessórios de balcão</div>
          </div>
        </div>

        {/* Saídas */}
        <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700 }}>
            <span>Total de Saídas Pagas</span>
            <ArrowUpRight size={18} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: 8 }}>
            R$ {data.summary.realizedOutflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div>&bull; Pagamentos de lotes de fornecedores de celulares</div>
            <div>&bull; Despesas fixas (Aluguel, energia, internet)</div>
            <div>&bull; Peças, baterias e telas para reposição</div>
          </div>
        </div>

        {/* Saldo Líquido do Período */}
        <div style={{ background: '#0d1322', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: data.summary.netRealized >= 0 ? '#10b981' : '#f59e0b', fontSize: '0.78rem', fontWeight: 700 }}>
            <span>Geração Líquida de Caixa</span>
            <DollarSign size={18} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: data.summary.netRealized >= 0 ? '#10b981' : '#f59e0b', marginTop: 8 }}>
            R$ {data.summary.netRealized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 8 }}>
            {data.summary.netRealized >= 0
              ? '✅ As entradas cobriram integralmente as saídas do período.'
              : '⚠️ As saídas superaram as entradas no período (uso de saldo anterior).'}
          </div>
        </div>
      </div>

      {/* 3. PROJEÇÃO DO FLUXO DE CAIXA NO HORIZONTE SELECIONADO */}
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              Projeção de Saldo para os Próximos {horizon} Dias
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Simulação matemática considerando saldo inicial de R$ {data.summary.currentTotalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* SELETOR DE CENÁRIO */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(['provavel', 'pessimista', 'otimista'] as const).map(scType => (
              <button
                key={scType}
                onClick={() => setSelectedScenarioType(scType)}
                style={{
                  background: selectedScenarioType === scType
                    ? (scType === 'provavel' ? '#3b82f6' : scType === 'pessimista' ? '#ef4444' : '#10b981')
                    : 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {scType}
              </button>
            ))}
          </div>
        </div>

        {/* ALERTA DE RISCO DE CAIXA SE HOUVER */}
        {currentScenario.riskOfCashShortage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#f8fafc',
            fontSize: '0.82rem',
          }}>
            <AlertTriangle size={20} color="#ef4444" />
            <div>
              <strong>Risco de Insuficiência de Caixa Identificado:</strong> No cenário {selectedScenarioType}, há risco de déficit de até R$ {currentScenario.shortageAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por volta de {new Date(currentScenario.lowestBalanceDate).toLocaleDateString('pt-BR')}.
            </div>
          </div>
        )}

        {/* MÉTRICAS CHAVE DA PROJEÇÃO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Saldo Inicial</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
              R$ {data.summary.currentTotalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Menor Saldo Previsto</div>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: currentScenario.lowestBalanceInPeriod >= 0 ? '#10b981' : '#ef4444',
              marginTop: 4,
            }}>
              R$ {currentScenario.lowestBalanceInPeriod.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Saldo Final Projetado</div>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: currentScenario.projectedFinalBalance >= 0 ? '#3b82f6' : '#ef4444',
              marginTop: 4,
            }}>
              R$ {currentScenario.projectedFinalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* GRÁFICO VISUAL DE LINHA DO TEMPO DIA A DIA */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 10 }}>
            Evolução Prevista do Saldo de Caixa (Dia a Dia)
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 4,
            height: 120,
            padding: '10px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            overflowX: 'auto',
          }}>
            {currentScenario.timeline.map((pt, i) => {
              const maxVal = Math.max(1, ...currentScenario.timeline.map(t => Math.abs(t.balance)));
              const heightPct = Math.max(10, Math.min(100, (Math.abs(pt.balance) / maxVal) * 90));
              const isPositive = pt.balance >= 0;

              return (
                <div
                  key={i}
                  title={`${pt.date}: Saldo R$ ${pt.balance.toLocaleString('pt-BR')}`}
                  style={{
                    flex: 1,
                    minWidth: 16,
                    height: `${heightPct}%`,
                    background: isPositive
                      ? (selectedScenarioType === 'otimista' ? '#10b981' : '#3b82f6')
                      : '#ef4444',
                    borderRadius: '3px 3px 0 0',
                    opacity: 0.85,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* PREMISSAS TRANSPARENTES DOCUMENTADAS */}
        <div style={{
          marginTop: 20,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 8,
          padding: 14,
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
            Premissas Determinísticas Utilizadas no Cálculo:
          </div>
          <ul style={{ fontSize: '0.78rem', color: '#cbd5e1', paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {currentScenario.assumptions.map((assump, idx) => (
              <li key={idx}>{assump}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
