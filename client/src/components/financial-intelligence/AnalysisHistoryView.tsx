import React, { useState } from 'react';
import type { AIStructuredAnalysis } from '../../types.js';
import { FinancialIntelligenceRepository } from '../../repositories/financialIntelligenceRepository.js';

export const AnalysisHistoryView: React.FC = () => {
  const [history] = useState<AIStructuredAnalysis[]>(() => {
    return FinancialIntelligenceRepository.getAnalysisHistory();
  });

  const [selectedAnalysis, setSelectedAnalysis] = useState<AIStructuredAnalysis | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. CABEÇALHO */}
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: '20px 24px',
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
          Histórico de Análises & Diagnósticos de IA
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
          Linha do tempo auditável de todas as consultas financeiras e recomendações geradas anteriormente.
        </p>
      </div>

      {/* 2. LISTA HISTÓRICA */}
      {history.length === 0 ? (
        <div style={{
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 40,
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.85rem',
        }}>
          Nenhuma análise foi realizada ainda nesta sessão. Clique na aba <strong>"Analista de IA"</strong> para formular uma pergunta.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {history.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedAnalysis(item)}
              style={{
                background: '#0d1322',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: 18,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#3b82f6')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    background: item.source === 'openai' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: item.source === 'openai' ? '#10b981' : '#3b82f6',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                  }}>
                    {item.source === 'openai' ? `OpenAI (${item.modelUsed})` : 'Motor Determinístico'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(item.createdAt).toLocaleString('pt-BR')} &bull; Período: {item.period}
                  </span>
                </div>

                <span style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 700 }}>
                  {item.prioritizedRecommendations.length} Recomendações &rarr;
                </span>
              </div>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc', marginTop: 10 }}>
                "{item.questionRequested}"
              </h4>

              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.executiveSummary}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE DETALHES DE UMA ANÁLISE DO HISTÓRICO */}
      {selectedAnalysis && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 16, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: 16,
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 14,
            padding: 24,
            maxWidth: 680,
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 700 }}>
                  {selectedAnalysis.source === 'openai' ? `OpenAI (${selectedAnalysis.modelUsed})` : 'Motor Determinístico'} &bull; {new Date(selectedAnalysis.createdAt).toLocaleString('pt-BR')}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                  "{selectedAnalysis.questionRequested}"
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnalysis(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>

            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 4 }}>
                Resumo Executivo
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {selectedAnalysis.executiveSummary}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 4 }}>
                Diagnóstico da Situação
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                {selectedAnalysis.identifiedSituation}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: 6 }}>
                Recomendações Emitidas ({selectedAnalysis.prioritizedRecommendations.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedAnalysis.prioritizedRecommendations.map(r => (
                  <div key={r.id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 6, fontSize: '0.75rem' }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>P{r.priority}: {r.title}</div>
                    <div style={{ color: '#cbd5e1', marginTop: 2 }}>{r.action}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={() => setSelectedAnalysis(null)}
                style={{
                  background: '#3b82f6',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
