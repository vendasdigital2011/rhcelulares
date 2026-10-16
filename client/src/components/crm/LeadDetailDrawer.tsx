import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Send,
  Link2,
  Edit2,
  Trash2,
} from 'lucide-react';
import type {
  Lead,
  LeadStage,
  LeadActivityType,
} from '../../types.js';
import {
  moveLeadStageApi,
  addLeadActivityApi,
  addLeadTaskApi,
  toggleLeadTaskApi,
} from '../../api/erpApi.js';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

const STAGES: Array<{ id: LeadStage; label: string; color: string }> = [
  { id: 'novo_lead', label: 'Novo lead', color: '#3b82f6' },
  { id: 'qualificacao', label: 'Qualificação', color: '#8b5cf6' },
  { id: 'primeiro_contato', label: 'Primeiro contato', color: '#06b6d4' },
  { id: 'em_negociacao', label: 'Em negociação', color: '#f59e0b' },
  { id: 'aguardando_retorno', label: 'Aguardando retorno', color: '#f97316' },
  { id: 'convertido', label: 'Convertido', color: '#10b981' },
  { id: 'perdido', label: 'Perdido', color: '#ef4444' },
];

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  onEditLead,
  onDeleteLead,
}) => {
  if (!isOpen || !lead) return null;

  // Nova Atividade
  const [activityType, setActivityType] = useState<LeadActivityType>('observacao');
  const [activityDesc, setActivityDesc] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // Nova Tarefa
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Modal Justificativa de Mudança de Etapa
  const [targetStage, setTargetStage] = useState<LeadStage | null>(null);
  const [stageReason, setStageReason] = useState('');
  const [isChangingStage, setIsChangingStage] = useState(false);

  const handleStageClick = async (newStage: LeadStage) => {
    if (newStage === lead.stage) return;
    if (newStage === 'perdido' || newStage === 'convertido') {
      setTargetStage(newStage);
      setStageReason('');
      return;
    }

    try {
      const updated = await moveLeadStageApi(lead.id, newStage, lead.assignedUserName);
      onUpdateLead(updated);
    } catch (e: any) {
      alert(`Falha ao alterar etapa: ${e.message}`);
    }
  };

  const confirmStageTransition = async () => {
    if (!targetStage) return;
    setIsChangingStage(true);
    try {
      const updated = await moveLeadStageApi(
        lead.id,
        targetStage,
        lead.assignedUserName,
        stageReason.trim() || undefined
      );
      onUpdateLead(updated);
      setTargetStage(null);
    } catch (e: any) {
      alert(`Erro ao alterar etapa: ${e.message}`);
    } finally {
      setIsChangingStage(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityDesc.trim()) return;

    setIsAddingActivity(true);
    try {
      await addLeadActivityApi(lead.id, {
        type: activityType,
        description: activityDesc.trim(),
        authorName: lead.assignedUserName || 'Robson Oliveira',
      });
      // Atualiza o lead local
      const updatedActivities = [
        {
          id: `act-${Date.now()}`,
          leadId: lead.id,
          type: activityType,
          description: activityDesc.trim(),
          timestamp: new Date().toISOString(),
          authorName: lead.assignedUserName || 'Robson Oliveira',
        },
        ...lead.activities,
      ];
      onUpdateLead({
        ...lead,
        activities: updatedActivities,
        lastContactDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setActivityDesc('');
    } catch (e: any) {
      alert(`Erro ao registrar atividade: ${e.message}`);
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate) return;

    setIsAddingTask(true);
    try {
      const newTask = await addLeadTaskApi(lead.id, {
        title: taskTitle.trim(),
        dueDate: taskDueDate,
        completed: false,
      });
      onUpdateLead({
        ...lead,
        tasks: [...lead.tasks, newTask],
        updatedAt: new Date().toISOString(),
      });
      setTaskTitle('');
      setTaskDueDate('');
    } catch (e: any) {
      alert(`Erro ao criar tarefa: ${e.message}`);
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleLeadTaskApi(lead.id, taskId);
      const updatedTasks = lead.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } : t
      );
      onUpdateLead({
        ...lead,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      });
    } catch (e: any) {
      alert(`Erro ao atualizar tarefa: ${e.message}`);
    }
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(lead.phone);
    alert('Telefone copiado para a área de transferência!');
  };

  const openWhatsAppWeb = () => {
    const clean = lead.phone.replace(/\D/g, '');
    const num = clean.startsWith('55') ? clean : `55${clean}`;
    const text = encodeURIComponent(`Olá ${lead.contactName}! Tudo bem? Sou da equipe da Hiago iPhones.`);
    window.open(`https://wa.me/${num}?text=${text}`, '_blank');
  };

  const priorityColor = {
    baixa: '#64748b',
    media: '#06b6d4',
    alta: '#f59e0b',
    urgente: '#ef4444',
  }[lead.priority];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 16, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 1100,
    }}>
      <div style={{
        background: '#0d1322',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        width: '100%',
        maxWidth: 780,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
      }}>
        {/* CABEÇALHO DO LEAD */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
                {lead.contactName}
              </h2>
              {lead.companyName && (
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: 6 }}>
                  {lead.companyName}
                </span>
              )}
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 6,
                textTransform: 'uppercase',
                background: `${priorityColor}22`,
                color: priorityColor,
                border: `1px solid ${priorityColor}44`,
              }}>
                {lead.priority}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, fontSize: '0.78rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={13} color="#f97316" />
                <span onClick={copyPhone} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{lead.phone}</span>
                <button
                  onClick={openWhatsAppWeb}
                  title="Abrir WhatsApp Web no navegador"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '1px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  WhatsApp
                </button>
              </div>

              {lead.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={13} color="#3b82f6" />
                  <span>{lead.email}</span>
                </div>
              )}

              {lead.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} color="#94a3b8" />
                  <span>{lead.city}/{lead.state}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => onEditLead(lead)}
              title="Editar dados cadastrais"
              style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '6px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Edit2 size={13} />
              <span>Editar</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Excluir permanentemente o lead "${lead.contactName}"?`)) {
                  onDeleteLead(lead.id);
                  onClose();
                }
              }}
              title="Excluir lead"
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', padding: '6px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Trash2 size={13} />
            </button>

            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PIPELINE DE ETAPAS (SELETOR INTERATIVO) */}
        <div style={{
          padding: '14px 24px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
            Etapa Atual no Pipeline Comercial:
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {STAGES.map(s => {
              const isCurrent = lead.stage === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleStageClick(s.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: isCurrent ? 800 : 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: isCurrent ? s.color : 'rgba(255, 255, 255, 0.04)',
                    color: isCurrent ? '#fff' : '#94a3b8',
                    whiteSpace: 'nowrap',
                    boxShadow: isCurrent ? `0 2px 8px ${s.color}55` : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CORPO DO DRAWER COM SCROLL */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* CARDS DE RESUMO DO LEAD */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Interesse Comercial</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                {lead.commercialInterest}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Potencial Estimado</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                R$ {(lead.potentialValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Origem & Entrada</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginTop: 4 }}>
                {lead.origin} • {lead.entryDate}
              </div>
            </div>
          </div>

          {/* PRÓXIMA AÇÃO PLANEJADA */}
          {(lead.nextAction || lead.nextReturnDate) && (
            <div style={{
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.25)',
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase' }}>
                  Próxima Ação Comercial
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                  {lead.nextAction || 'Acompanhamento comercial'}
                </div>
              </div>
              {lead.nextReturnDate && (
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#cbd5e1' }}>
                  <div style={{ color: '#94a3b8' }}>Retorno Previsto:</div>
                  <strong style={{ color: '#f97316' }}>{new Date(lead.nextReturnDate).toLocaleDateString('pt-BR')}</strong>
                </div>
              )}
            </div>
          )}

          {/* HISTÓRICO DE ATIVIDADES COMERCIAIS */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color="#f97316" />
                <span>Histórico de Atividades Comerciais</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {lead.activities.length} registro(s)
              </span>
            </div>

            {/* FORMULÁRIO RÁPIDO DE ATIVIDADE */}
            <form onSubmit={handleAddActivity} style={{ marginBottom: 18, background: 'rgba(0, 0, 0, 0.2)', padding: 14, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <select
                  value={activityType}
                  onChange={e => setActivityType(e.target.value as LeadActivityType)}
                  style={{ padding: '6px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 6, color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  <option value="ligacao">📞 Ligação realizada</option>
                  <option value="email">✉️ E-mail enviado</option>
                  <option value="reuniao">🤝 Reunião agendada</option>
                  <option value="retorno">⏳ Retorno solicitado</option>
                  <option value="observacao">📝 Observação interna</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Descreva a atividade realizada ou ponto discutido..."
                  value={activityDesc}
                  onChange={e => setActivityDesc(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 6, color: '#fff', fontSize: '0.8rem' }}
                />
                <button
                  type="submit"
                  disabled={isAddingActivity || !activityDesc.trim()}
                  style={{
                    background: '#f97316',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Send size={13} />
                  <span>Registrar</span>
                </button>
              </div>
            </form>

            {/* TIMELINE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {lead.activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: '0.78rem' }}>
                  Nenhuma atividade registrada ainda para este lead.
                </div>
              ) : (
                lead.activities.map(act => (
                  <div key={act.id} style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', flexShrink: 0, marginTop: 2 }}>
                      {act.type === 'ligacao' ? '📞' : act.type === 'email' ? '✉️' : act.type === 'mudanca_etapa' ? '🔄' : '📝'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f97316', textTransform: 'capitalize' }}>
                          {act.type.replace('_', ' ')} • {act.authorName}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          {new Date(act.timestamp).toLocaleDateString('pt-BR')} {new Date(act.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: 4, lineHeight: 1.4 }}>
                        {act.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TAREFAS E PRÓXIMOS CONTATOS */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Tarefas e Próximos Contatos</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {lead.tasks.filter(t => t.completed).length}/{lead.tasks.length} concluídas
              </span>
            </div>

            {/* ADICIONAR TAREFA */}
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Ex: Enviar vídeo do aparelho funcionando..."
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                style={{ flex: 2, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 6, color: '#fff', fontSize: '0.8rem' }}
              />
              <input
                type="date"
                value={taskDueDate}
                onChange={e => setTaskDueDate(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 6, color: '#fff', fontSize: '0.75rem' }}
              />
              <button
                type="submit"
                disabled={isAddingTask || !taskTitle.trim() || !taskDueDate}
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  padding: '8px 14px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Plus size={14} />
                <span>Adicionar</span>
              </button>
            </form>

            {/* LISTA DE TAREFAS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lead.tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#64748b', fontSize: '0.78rem' }}>
                  Nenhuma tarefa pendente para este lead.
                </div>
              ) : (
                lead.tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: task.completed ? 'rgba(255, 255, 255, 0.015)' : 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                    }}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={16} color="#10b981" />
                    ) : (
                      <Circle size={16} color="#64748b" />
                    )}
                    <span style={{
                      flex: 1,
                      fontSize: '0.8rem',
                      color: task.completed ? '#64748b' : '#f8fafc',
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}>
                      {task.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Até {task.dueDate}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PREPARAÇÃO PARA INTEGRAÇÃO COM ERP */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8' }}>
              <Link2 size={16} color="#3b82f6" />
              <span>Integração com ERP (Arquitetura Futura Preparada)</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6, lineHeight: 1.4 }}>
              Status: <strong style={{ color: '#eab308' }}>Não vinculado a ERP externo</strong>.
              A estrutura de dados está pronta para receber códigos de clientes e pedidos assim que o provedor oficial de ERP for homologado, sem necessidade de reconstrução do funil.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE JUSTIFICATIVA DE TRANSIÇÃO (SE CONVERTIDO OU PERDIDO) */}
      {targetStage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: 16,
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 12,
            padding: 24,
            maxWidth: 450,
            width: '100%',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              {targetStage === 'convertido' ? '🎉 Confirmar Conversão em Venda' : '⚠️ Marcar Lead como Perdido'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
              {targetStage === 'convertido'
                ? 'Registre detalhes da venda realizada ou condições acordadas com o cliente.'
                : 'Informe o motivo da perda (preço alto, comprou em outra loja, desistência, etc.) para alimentar a inteligência comercial.'}
            </p>

            <textarea
              rows={3}
              required
              placeholder="Justificativa da alteração..."
              value={stageReason}
              onChange={e => setStageReason(e.target.value)}
              style={{ width: '100%', marginTop: 14, padding: 10, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setTargetStage(null)}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#cbd5e1', padding: '8px 14px', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={isChangingStage}
                onClick={confirmStageTransition}
                style={{
                  background: targetStage === 'convertido' ? '#10b981' : '#ef4444',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isChangingStage ? 'Gravando...' : 'Confirmar Mudança'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
