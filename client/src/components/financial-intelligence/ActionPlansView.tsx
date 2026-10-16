import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { FinancialConsolidatedData, PrioritizedRecommendation, FinancialDecisionRecord } from '../../types.js';
import { FinancialIntelligenceRepository } from '../../repositories/financialIntelligenceRepository.js';

interface ActionPlansViewProps {
  data?: FinancialConsolidatedData;
}

export const ActionPlansView: React.FC<ActionPlansViewProps> = () => {
  const [recommendations, setRecommendations] = useState<PrioritizedRecommendation[]>(() => {
    const history = FinancialIntelligenceRepository.getAnalysisHistory();
    if (history.length > 0 && history[0].prioritizedRecommendations) {
      return history[0].prioritizedRecommendations;
    }
    return [
      {
        id: 'rec-init-1',
        priority: 1,
        title: 'Renegociação de Títulos Vencidos com Fornecedores',
        action: 'Contatar os credores dos boletos em atraso para repactuar vencimento em 2x sem juros.',
        justification: 'Evitar interrupção no fornecimento de aparelhos e telas para assistência técnica.',
        estimatedFinancialImpact: 'Economia estimada de R$ 380,00 em encargos.',
        status: 'pending',
        category: 'fornecedores',
      },
      {
        id: 'rec-init-2',
        priority: 2,
        title: 'Ativação de Régua de Cobrança no WhatsApp para Inadimplentes',
        action: 'Disparar mensagens amigáveis com chave Pix de desconto para os clientes em atraso há mais de 3 dias.',
        justification: 'A inadimplência atual pressiona o fluxo de caixa de curto prazo.',
        estimatedFinancialImpact: 'Recuperação estimada de R$ 1.800,00 nos próximos 5 dias.',
        status: 'pending',
        category: 'cobranca',
      },
      {
        id: 'rec-init-3',
        priority: 3,
        title: 'Campanha de Venda Casada: iPhone + Kit Proteção',
        action: 'Oferecer película de cerâmica e capa anti-impacto com margem de 65% em todas as saídas de iPhone.',
        justification: 'Acessórios aumentam a margem líquida média da venda em 4 pontos percentuais.',
        estimatedFinancialImpact: 'Aumento de R$ 2.400,00 no lucro bruto mensal.',
        status: 'pending',
        category: 'preco_margem',
      },
    ];
  });

  const [decisions, setDecisions] = useState<FinancialDecisionRecord[]>(() => {
    return FinancialIntelligenceRepository.getDecisionHistory();
  });

  // Modal de Decisão Humana
  const [selectedRecForDecision, setSelectedRecForDecision] = useState<{
    rec: PrioritizedRecommendation;
    action: 'approved' | 'rejected' | 'revised';
  } | null>(null);

  const [decisionJustification, setDecisionJustification] = useState('');
  const [decisionAuthor, setDecisionAuthor] = useState('Rodrigo (Proprietário)');

  const handleOpenDecisionModal = (rec: PrioritizedRecommendation, action: 'approved' | 'rejected' | 'revised') => {
    setSelectedRecForDecision({ rec, action });
    setDecisionJustification(
      action === 'approved'
        ? 'Aprovado para execução pela equipe comercial/financeira.'
        : action === 'rejected'
        ? 'Rejeitado devido a prioridades operacionais vigentes.'
        : 'Solicitado reexame com dados complementares.'
    );
  };

  const handleConfirmDecision = async () => {
    if (!selectedRecForDecision) return;
    const { rec, action } = selectedRecForDecision;

    const analysisHistory = FinancialIntelligenceRepository.getAnalysisHistory();
    const currentAnalysisId = analysisHistory.length > 0 ? analysisHistory[0].id : `ai-session-${Date.now()}`;

    await FinancialIntelligenceRepository.recordDecision(
      currentAnalysisId,
      rec.id,
      rec.title,
      action,
      decisionJustification,
      decisionAuthor
    );

    // Atualiza estado local
    setRecommendations(prev =>
      prev.map(r => (r.id === rec.id ? { ...r, status: action === 'approved' ? 'approved' : 'rejected' } : r))
    );
    setDecisions(FinancialIntelligenceRepository.getDecisionHistory());
    setSelectedRecForDecision(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. CABEÇALHO COM PRINCÍPIO DE GOVERNANÇA HUMANA */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: '#10b981',
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 6,
              textTransform: 'uppercase',
            }}>
              Controle Humano Obrigatório
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Nenhuma ação financeira é executada sem aprovação do gestor
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: 6 }}>
            Mural de Recomendações & Planos de Ação
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: 2, maxWidth: 640 }}>
            Avalie cada sugestão estratégica fundamentada nos números, registre sua decisão e acompanhe o histórico de governança.
          </p>
        </div>
      </div>

      {/* 2. LISTA DE RECOMENDAÇÕES PARA APROVAÇÃO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
          Recomendações Pendentes de Avaliação
        </h3>

        {recommendations.map(rec => (
          <div
            key={rec.id}
            style={{
              background: '#0d1322',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: '#3b82f6',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}>
                  Prioridade {rec.priority}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                  Categoria: {rec.category}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: rec.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : rec.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: rec.status === 'approved' ? '#10b981' : rec.status === 'rejected' ? '#ef4444' : '#f59e0b',
                  textTransform: 'uppercase',
                }}>
                  {rec.status === 'approved' ? 'Aprovada' : rec.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                </span>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
                {rec.title}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: 4 }}>
                {rec.action}
              </p>

              <div style={{
                marginTop: 10,
                display: 'flex',
                gap: 16,
                fontSize: '0.75rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '6px 12px',
                borderRadius: 6,
              }}>
                <div><strong>Justificativa:</strong> {rec.justification}</div>
                <div><strong>Impacto Estimado:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>{rec.estimatedFinancialImpact}</span></div>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO HUMANA */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {rec.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleOpenDecisionModal(rec, 'approved')}
                    style={{
                      background: '#10b981',
                      border: 'none',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Aprovar</span>
                  </button>

                  <button
                    onClick={() => handleOpenDecisionModal(rec, 'rejected')}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <XCircle size={15} />
                    <span>Rejeitar</span>
                  </button>
                </>
              ) : (
                <div style={{ fontSize: '0.75rem', color: rec.status === 'approved' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                  Decisão Registrada &bull; {rec.status === 'approved' ? 'Aprovada para execução' : 'Descartada'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. HISTÓRICO DE DECISÕES TOMADAS (AUDITORIA) */}
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: 20,
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: 14 }}>
          Histórico de Auditoria & Decisões Humanas
        </h3>

        {decisions.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
            Nenhuma decisão foi registrada ainda. As decisões de aprovação ou rejeição tomadas acima ficarão arquivadas aqui.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {decisions.map(dec => (
              <div
                key={dec.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: dec.actionTaken === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: dec.actionTaken === 'approved' ? '#10b981' : '#ef4444',
                      textTransform: 'uppercase',
                    }}>
                      {dec.actionTaken === 'approved' ? 'Aprovada' : 'Rejeitada'}
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{dec.recommendationTitle}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: 4 }}>
                    <strong>Justificativa:</strong> {dec.justification}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <div>Decidido por: <strong style={{ color: '#f8fafc' }}>{dec.decidedBy}</strong></div>
                  <div>{new Date(dec.decidedAt).toLocaleString('pt-BR')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE JUSTIFICATIVA DA DECISÃO */}
      {selectedRecForDecision && (
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
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 14,
            padding: 24,
            maxWidth: 520,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              Confirmar Decisão de {selectedRecForDecision.action === 'approved' ? 'Aprovação' : 'Rejeição'}
            </h3>

            <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Você está registrando a decisão para a recomendação: <strong>"{selectedRecForDecision.rec.title}"</strong>.
            </p>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Responsável pela Decisão:
              </label>
              <input
                type="text"
                value={decisionAuthor}
                onChange={e => setDecisionAuthor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: '0.82rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Justificativa Operacional / Racional da Decisão:
              </label>
              <textarea
                rows={3}
                value={decisionJustification}
                onChange={e => setDecisionJustification(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: '0.82rem',
                  resize: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setSelectedRecForDecision(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDecision}
                style={{
                  background: selectedRecForDecision.action === 'approved' ? '#10b981' : '#ef4444',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 20px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Gravar Decisão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
