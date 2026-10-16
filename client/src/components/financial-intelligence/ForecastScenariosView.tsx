import React, { useState } from 'react';
import type { FinancialConsolidatedData } from '../../types.js';

interface ForecastScenariosViewProps {
  data: FinancialConsolidatedData;
}

export const ForecastScenariosView: React.FC<ForecastScenariosViewProps> = ({ data }) => {
  const [horizon, setHorizon] = useState<7 | 30 | 60 | 90>(30);

  const scenarios = horizon === 7 ? data.scenarios.d7
    : horizon === 30 ? data.scenarios.d30
    : horizon === 60 ? data.scenarios.d60
    : data.scenarios.d90;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. CABEÇALHO */}
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
            Previsão Financeira & Cenários de Estresse
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
            Projeções matemáticas estruturadas para tomada de decisão preventiva e blindagem de caixa.
          </p>
        </div>

        {/* SELETOR DE HORIZONTE */}
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
              }}
            >
              {d} Dias
            </button>
          ))}
        </div>
      </div>

      {/* 2. OS 3 CENÁRIOS COMPARATIVOS LADO A LADO */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
        gap: 18,
      }}>
        {/* CENÁRIO PESSIMISTA */}
        <div style={{
          background: '#0d1322',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}>
                Cenário Pessimista
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Probabilidade: ~20%</span>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Saldo Final Projetado</div>
              <div style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: scenarios.pessimista.projectedFinalBalance >= 0 ? '#f8fafc' : '#ef4444',
                marginTop: 4,
              }}>
                R$ {scenarios.pessimista.projectedFinalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {scenarios.pessimista.riskOfCashShortage ? (
              <div style={{
                marginTop: 12,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                color: '#f8fafc',
              }}>
                ⚠️ <strong>Déficit de Caixa:</strong> até R$ {scenarios.pessimista.shortageAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.
              </div>
            ) : (
              <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#10b981' }}>
                ✅ Caixa permanece positivo mesmo sob estresse.
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', marginBottom: 6 }}>
                Premissas de Estresse:
              </div>
              <ul style={{ fontSize: '0.73rem', color: '#94a3b8', paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {scenarios.pessimista.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.72rem', color: '#64748b' }}>
            Recomendação: Congelar compras extras de iPhones de baixa saída.
          </div>
        </div>

        {/* CENÁRIO PROVÁVEL (BASE) */}
        <div style={{
          background: '#0d1322',
          border: '2px solid rgba(59, 130, 246, 0.5)',
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: '#3b82f6',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}>
                Cenário Provável (Mais Realista)
              </span>
              <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 700 }}>Probabilidade: ~70%</span>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Saldo Final Projetado</div>
              <div style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: scenarios.provavel.projectedFinalBalance >= 0 ? '#3b82f6' : '#ef4444',
                marginTop: 4,
              }}>
                R$ {scenarios.provavel.projectedFinalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{
              marginTop: 12,
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: '0.75rem',
              color: '#cbd5e1',
            }}>
              Saldo mínimo em conta: R$ {scenarios.provavel.lowestBalanceInPeriod.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', marginBottom: 6 }}>
                Premissas Base:
              </div>
              <ul style={{ fontSize: '0.73rem', color: '#94a3b8', paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {scenarios.provavel.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.72rem', color: '#64748b' }}>
            Recomendação: Manter giro de estoque regular e monitorar vencimentos semanais.
          </div>
        </div>

        {/* CENÁRIO OTIMISTA */}
        <div style={{
          background: '#0d1322',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}>
                Cenário Otimista
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Probabilidade: ~10%</span>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Saldo Final Projetado</div>
              <div style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#10b981',
                marginTop: 4,
              }}>
                R$ {scenarios.otimista.projectedFinalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{
              marginTop: 12,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: '0.75rem',
              color: '#f8fafc',
            }}>
              🚀 Saldo de alta liquidez para reinvestimento e expansão.
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', marginBottom: 6 }}>
                Premissas de Expansão:
              </div>
              <ul style={{ fontSize: '0.73rem', color: '#94a3b8', paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {scenarios.otimista.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.72rem', color: '#64748b' }}>
            Recomendação: Negociar lotes maiores de iPhone 15/16 com desconto de volume.
          </div>
        </div>
      </div>
    </div>
  );
};
