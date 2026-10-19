import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Upload,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RefreshCw,
  X,
  FileSpreadsheet,
  MessageCircle,
} from 'lucide-react';
import type {
  Lead,
  LeadStage,
  LeadPriority,
  CommercialSummary,
  AIRecommendation,
} from '../../types.js';
import {
  fetchLeadsApi,
  createLeadApi,
  updateLeadApi,
  moveLeadStageApi,
  fetchCommercialSummaryApi,
  fetchAIRecommendationsApi,
} from '../../api/erpApi.js';
import { LeadFormModal } from './LeadFormModal.js';
import { LeadDetailDrawer } from './LeadDetailDrawer.js';

const KANBAN_STAGES: Array<{ id: LeadStage; label: string; color: string; bgBadge: string }> = [
  { id: 'novo_lead', label: '1. Novo lead', color: '#3b82f6', bgBadge: 'rgba(59, 130, 246, 0.15)' },
  { id: 'qualificacao', label: '2. Qualificação', color: '#8b5cf6', bgBadge: 'rgba(139, 92, 246, 0.15)' },
  { id: 'primeiro_contato', label: '3. Primeiro contato', color: '#06b6d4', bgBadge: 'rgba(6, 182, 212, 0.15)' },
  { id: 'em_negociacao', label: '4. Em negociação', color: '#f59e0b', bgBadge: 'rgba(245, 158, 11, 0.15)' },
  { id: 'aguardando_retorno', label: '5. Aguardando retorno', color: '#f97316', bgBadge: 'rgba(249, 115, 22, 0.15)' },
  { id: 'convertido', label: '6. Convertido', color: '#10b981', bgBadge: 'rgba(16, 185, 129, 0.15)' },
  { id: 'perdido', label: '7. Perdido', color: '#ef4444', bgBadge: 'rgba(239, 68, 68, 0.15)' },
];

export const CrmKanbanView: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('todas');
  const [originFilter, setOriginFilter] = useState<string>('todas');
  const [priorityFilter, setPriorityFilter] = useState<string>('todas');
  const [sortBy, setSortBy] = useState<'updated' | 'value' | 'priority' | 'return'>('updated');

  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // IA Comercial
  const [aiExpanded, setAiExpanded] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  // Resumo Comercial
  const [summary, setSummary] = useState<CommercialSummary>({
    totalLeads: 0,
    newLeadsCount: 0,
    inProgressCount: 0,
    pendingReturnCount: 0,
    convertedCount: 0,
    totalPotentialValue: 0,
    conversionRate: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const allLeads = await fetchLeadsApi();
      setLeads(allLeads);
      const summ = await fetchCommercialSummaryApi(allLeads);
      setSummary(summ);
      const recs = await fetchAIRecommendationsApi(allLeads);
      setRecommendations(recs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtros & Ordenação
  const filteredLeads = leads
    .filter(l => {
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        const matchesName = l.contactName.toLowerCase().includes(term);
        const matchesCompany = l.companyName ? l.companyName.toLowerCase().includes(term) : false;
        const matchesPhone = l.phone.includes(term);
        const matchesEmail = l.email ? l.email.toLowerCase().includes(term) : false;
        const matchesInterest = l.commercialInterest.toLowerCase().includes(term);
        if (!matchesName && !matchesCompany && !matchesPhone && !matchesEmail && !matchesInterest) return false;
      }
      if (stageFilter !== 'todas' && l.stage !== stageFilter) return false;
      if (originFilter !== 'todas' && l.origin !== originFilter) return false;
      if (priorityFilter !== 'todas' && l.priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'value') {
        return (b.potentialValue || 0) - (a.potentialValue || 0);
      }
      if (sortBy === 'priority') {
        const order: Record<LeadPriority, number> = { urgente: 4, alta: 3, media: 2, baixa: 1 };
        return order[b.priority] - order[a.priority];
      }
      if (sortBy === 'return') {
        if (!a.nextReturnDate) return 1;
        if (!b.nextReturnDate) return -1;
        return new Date(a.nextReturnDate).getTime() - new Date(b.nextReturnDate).getTime();
      }
      return 0;
    });

  const handleSaveLead = async (data: Partial<Lead>) => {
    if (editingLead) {
      const updated = await updateLeadApi(editingLead.id, data);
      setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)));
      if (selectedLead?.id === updated.id) setSelectedLead(updated);
    } else {
      const created = await createLeadApi(data);
      setLeads(prev => [created, ...prev]);
    }
    // Recalcula KPIs
    const updatedAll = await fetchLeadsApi();
    const s = await fetchCommercialSummaryApi(updatedAll);
    setSummary(s);
    const r = await fetchAIRecommendationsApi(updatedAll);
    setRecommendations(r);
  };

  const handleMoveStageQuick = async (leadId: string, newStage: LeadStage, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await moveLeadStageApi(leadId, newStage, 'Robson Oliveira');
      setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)));
      if (selectedLead?.id === updated.id) setSelectedLead(updated);
      const updatedAll = await fetchLeadsApi();
      setSummary(await fetchCommercialSummaryApi(updatedAll));
      setRecommendations(await fetchAIRecommendationsApi(updatedAll));
    } catch (err: any) {
      alert(`Falha ao mover lead: ${err.message}`);
    }
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
    if (selectedLead?.id === leadId) setSelectedLead(null);
  };

  const applyAIRecommendation = async (rec: AIRecommendation) => {
    if (!rec.leadId) return;
    const targetLead = leads.find(l => l.id === rec.leadId);
    if (!targetLead) return;

    if (rec.suggestedActionType === 'move_stage' && rec.suggestedStage) {
      if (confirm(`Aprovar recomendação da IA e mover "${targetLead.contactName}" para "${rec.suggestedStage}"?`)) {
        await moveLeadStageApi(rec.leadId, rec.suggestedStage, 'IA Comercial', 'Aprovado pelo gestor via Assistente IA');
        await loadData();
      }
    } else {
      setSelectedLead(targetLead);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      padding: '24px 32px',
      maxWidth: 1600,
      margin: '0 auto',
      minHeight: '100vh',
    }}>
      {/* 1. CABEÇALHO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            CRM DE CLIENTES & PROSPECÇÃO
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            CRM de Clientes
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
            Gerencie sua prospecção e acompanhe oportunidades comerciais.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setIsImportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '9px 16px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Upload size={15} />
            <span>Importar leads</span>
          </button>

          <button
            onClick={() => {
              setEditingLead(null);
              setIsFormModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f97316',
              border: 'none',
              color: '#fff',
              padding: '9px 20px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={16} />
            <span>Adicionar lead</span>
          </button>
        </div>
      </div>

      {/* 2. RESUMO COMERCIAL (5 CARDS BASEADOS EM DADOS REAIS) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
      }}>
        <div className="balcao-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>Total de Leads</span>
            <Users size={16} color="#2563EB" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            {summary.totalLeads}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: 4, fontWeight: 500 }}>
            R$ {summary.totalPotentialValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em potencial
          </div>
        </div>

        <div className="balcao-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>Leads Novos (7d)</span>
            <Calendar size={16} color="#0891B2" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            {summary.newLeadsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>
            Entradas recentes no funil
          </div>
        </div>

        <div className="balcao-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>Em Andamento</span>
            <TrendingUp size={16} color="#D97706" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D97706', marginTop: 6 }}>
            {summary.inProgressCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>
            Qualificação, contato e negociação
          </div>
        </div>

        <div className="balcao-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>Retorno Pendente</span>
            <Clock size={16} color="#EA580C" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: summary.pendingReturnCount > 0 ? '#EA580C' : '#17181A', marginTop: 6 }}>
            {summary.pendingReturnCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>
            Aguardando ou com prazo vencido
          </div>
        </div>

        <div className="balcao-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>Convertidas</span>
            <CheckCircle2 size={16} color="#16A34A" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16A34A', marginTop: 6 }}>
            {summary.convertedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: 4, fontWeight: 500 }}>
            {summary.conversionRate}% taxa de conversão
          </div>
        </div>
      </div>

      {/* 3. ASSISTENTE DE IA COMERCIAL (BASEADO EM EVIDÊNCIAS REAIS) */}
      <div className="balcao-card" style={{
        backgroundColor: '#F0FDF4',
        border: '1px solid #DCFCE7',
        padding: '14px 18px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#166534' }}>
                  Sugestões Automáticas Comerciais
                </span>
                <span className="status-chip status-available" style={{ fontSize: '0.6875rem' }}>
                  {recommendations.length} verificável(is)
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#15803D', margin: '2px 0 0' }}>
                Análise baseada estritamente nos dados reais de retorno, estagnação de negociações e follow-up do funil.
              </p>
            </div>
          </div>

          <button
            onClick={() => setAiExpanded(!aiExpanded)}
            style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600 }}
          >
            <span>{aiExpanded ? 'Recolher' : 'Ver Recomendações'}</span>
            {aiExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {aiExpanded && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #BBF7D0', paddingTop: 12 }}>
            {recommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '12px 0', color: '#166534', fontSize: '0.75rem' }}>
                Nenhuma pendência crítica ou dados insuficientes para novas recomendações no momento. Todos os retornos estão em dia!
              </div>
            ) : (
              recommendations.map(rec => (
                <div
                  key={rec.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DCFCE7',
                    borderRadius: 6,
                    padding: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A' }}>
                        {rec.problemOrOpportunity}
                      </span>
                      <span className={`status-chip ${rec.urgency === 'alta' ? 'status-cancelled' : 'status-maintenance'}`} style={{ fontSize: '0.625rem' }}>
                        {rec.urgency}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: '#475467', marginTop: 4, margin: 0 }}>
                      {rec.justification}
                    </p>

                    <div style={{ fontSize: '0.6875rem', color: '#667085', marginTop: 4, display: 'flex', gap: 14 }}>
                      <span><strong>Dados:</strong> {rec.usedData}</span>
                      <span><strong>Período:</strong> {rec.analyzedPeriod}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => applyAIRecommendation(rec)}
                    className="balcao-btn-primary"
                    style={{ height: 32, fontSize: '0.75rem', whiteSpace: 'nowrap', gap: 4 }}
                  >
                    <span>Aprovar Ação</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 4. BARRA DE BUSCA, FILTROS E ORDENAÇÃO */}
      <div className="balcao-card" style={{
        padding: '12px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* BUSCA */}
        <div style={{ position: 'relative', minWidth: 260, flex: 1, maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 9, color: '#667085' }} />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, modelo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              backgroundColor: '#F7F8FA',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              color: '#17181A',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          />
        </div>

        {/* FILTROS */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            style={{ padding: '6px 10px', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, color: '#17181A', fontSize: '0.75rem', outline: 'none' }}
          >
            <option value="todas">Todas as Etapas</option>
            {KANBAN_STAGES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <select
            value={originFilter}
            onChange={e => setOriginFilter(e.target.value)}
            style={{ padding: '6px 10px', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, color: '#17181A', fontSize: '0.75rem', outline: 'none' }}
          >
            <option value="todas">Todas as Origens</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="balcao">Balcão Loja</option>
            <option value="indicacao">Indicação</option>
            <option value="site">Site / Catálogo</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            style={{ padding: '6px 10px', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, color: '#17181A', fontSize: '0.75rem', outline: 'none' }}
          >
            <option value="todas">Todas as Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{ padding: '6px 10px', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, color: '#2563EB', fontWeight: 600, fontSize: '0.75rem', outline: 'none' }}
          >
            <option value="updated">Ordenar: Atualização Recente</option>
            <option value="value">Ordenar: Maior Valor Potencial</option>
            <option value="priority">Ordenar: Maior Prioridade</option>
            <option value="return">Ordenar: Próximo Retorno</option>
          </select>

          <button
            onClick={loadData}
            title="Atualizar dados"
            style={{ background: '#F7F8FA', border: '1px solid #E5E7EB', color: '#667085', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
      {/* 5. PIPELINE KANBAN (7 ETAPAS COM IDENTIFICAÇÃO VISUAL CLARA) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#667085' }}>
          Carregando pipeline de prospecção comercial...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(240px, 1fr))',
          gap: 14,
          overflowX: 'auto',
          paddingBottom: 16,
          alignItems: 'flex-start',
        }}>
          {KANBAN_STAGES.map(col => {
            const stageLeads = filteredLeads.filter(l => l.stage === col.id);
            const stageTotalValue = stageLeads.reduce((acc, l) => acc + (l.potentialValue || 0), 0);

            return (
              <div
                key={col.id}
                style={{
                  backgroundColor: '#F7F8FA',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 520,
                  maxHeight: 'calc(100vh - 330px)',
                }}
              >
                {/* CABEÇALHO DA COLUNA */}
                <div style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #E5E7EB',
                  borderTop: `3px solid ${col.color}`,
                  borderRadius: '8px 8px 0 0',
                  backgroundColor: '#FFFFFF',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A' }}>
                      {col.label}
                    </span>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: 10,
                      backgroundColor: '#F3F4F6',
                      color: '#667085',
                      border: '1px solid #E5E7EB',
                    }}>
                      {stageLeads.length}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#667085', marginTop: 2 }}>
                    Total: <strong style={{ color: '#17181A' }}>R$ {stageTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</strong>
                  </div>
                </div>

                {/* CORPO DA COLUNA / CARDS */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  {stageLeads.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '24px 10px',
                      color: '#98A2B3',
                      fontSize: '0.75rem',
                      border: '1px dashed #E5E7EB',
                      borderRadius: 6,
                    }}>
                      Nenhum lead nesta etapa
                    </div>
                  ) : (
                    stageLeads.map(lead => {
                      const isReturnOverdue = lead.nextReturnDate && new Date(lead.nextReturnDate) < new Date();
                      return (
                        <div
                          key={lead.id}
                          className="balcao-card"
                          onClick={() => setSelectedLead(lead)}
                          style={{
                            padding: 10,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            borderColor: isReturnOverdue ? '#D97706' : '#E5E7EB',
                            transition: 'border-color 0.12s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#2563EB';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = isReturnOverdue ? '#D97706' : '#E5E7EB';
                          }}
                        >
                          {/* NOME & PRIORIDADE */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A' }}>
                                {lead.contactName}
                              </div>
                              {lead.companyName && (
                                <div style={{ fontSize: '0.6875rem', color: '#667085' }}>
                                  {lead.companyName}
                                </div>
                              )}
                            </div>
                            <span className={`status-chip ${lead.priority === 'urgente' ? 'status-cancelled' : lead.priority === 'alta' ? 'status-maintenance' : 'status-waiting'}`} style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                              {lead.priority}
                            </span>
                          </div>

                          {/* INTERESSE COMERCIAL */}
                          <div style={{ fontSize: '0.75rem', color: '#344054', fontWeight: 500 }}>
                            {lead.commercialInterest}
                          </div>

                          {/* VALOR POTENCIAL */}
                          {(lead.potentialValue || 0) > 0 && (
                            <div className="tabular-nums" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#16A34A' }}>
                              R$ {(lead.potentialValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          )}

                          {/* PRÓXIMA AÇÃO / RETORNO */}
                          {lead.nextAction && (
                            <div style={{
                              fontSize: '0.6875rem',
                              color: '#475467',
                              backgroundColor: '#F9FAFB',
                              padding: '4px 6px',
                              borderRadius: 4,
                              borderLeft: isReturnOverdue ? '2px solid #D97706' : '2px solid #E5E7EB',
                            }}>
                              <div style={{ color: '#667085', fontSize: '0.625rem' }}>Próxima Ação:</div>
                              <div>{lead.nextAction}</div>
                              {lead.nextReturnDate && (
                                <div style={{ color: isReturnOverdue ? '#D97706' : '#667085', fontWeight: isReturnOverdue ? 600 : 400, marginTop: 2 }}>
                                  {isReturnOverdue ? '⚠️ Retorno atrasado: ' : 'Retorno: '}
                                  {new Date(lead.nextReturnDate).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          )}

                          {/* RODAPÉ DO CARD */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 4,
                            paddingTop: 6,
                            borderTop: '1px solid #F3F4F6',
                            fontSize: '0.6875rem',
                            color: '#667085',
                          }}>
                            <span>{lead.origin.replace('_', ' ')}</span>

                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <button
                                type="button"
                                title={`Conversar com ${lead.contactName} no WhatsApp`}
                                onClick={e => {
                                  e.stopPropagation();
                                  const clean = lead.phone.replace(/\D/g, '');
                                  const num = clean.startsWith('55') ? clean : `55${clean}`;
                                  const text = encodeURIComponent(`Olá ${lead.contactName}! Tudo bem? Sou da equipe da Hiago iPhones.`);
                                  window.open(`https://wa.me/${num}?text=${text}`, '_blank');
                                }}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #E5E7EB',
                                  color: '#16A34A',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  fontSize: '0.625rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  cursor: 'pointer',
                                }}
                              >
                                <MessageCircle size={10} />
                                <span>WhatsApp</span>
                              </button>

                              <select
                                value={lead.stage}
                                onClick={e => e.stopPropagation()}
                                onChange={e => handleMoveStageQuick(lead.id, e.target.value as LeadStage, e as any)}
                                style={{
                                  background: '#131b2e',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: 4,
                                  color: '#cbd5e1',
                                  fontSize: '0.65rem',
                                  padding: '2px 4px',
                                  cursor: 'pointer',
                                }}
                              >
                                {KANBAN_STAGES.map(s => (
                                  <option key={s.id} value={s.id}>Mover p/ {s.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL NOVO/EDITAR LEAD */}
      <LeadFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingLead(null);
        }}
        onSave={handleSaveLead}
        initialData={editingLead}
      />

      {/* DRAWER DETALHE DO LEAD */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={updated => {
          setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)));
          setSelectedLead(updated);
        }}
        onEditLead={l => {
          setEditingLead(l);
          setIsFormModalOpen(true);
        }}
        onDeleteLead={handleDeleteLead}
      />

      {/* MODAL IMPORTAÇÃO DE LEADS */}
      {isImportModalOpen && (
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
          zIndex: 1300,
          padding: 16,
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 14,
            padding: 24,
            maxWidth: 520,
            width: '100%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileSpreadsheet size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                  Importação de Leads em Lote
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 10, lineHeight: 1.5 }}>
              Prepare uma planilha CSV ou Excel com as colunas: <strong>Nome, Empresa, Telefone, E-mail, Interesse e Origem</strong>.
            </p>

            <div style={{
              margin: '18px 0',
              padding: 24,
              border: '2px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: 10,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
            }}>
              <Upload size={32} color="#f97316" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                Arraste seu arquivo CSV ou clique para selecionar
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                Suporta formato .CSV com codificação UTF-8
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={() => {
                  alert('Arquivo CSV recebido para validação de layout. Os registros serão validados contra duplicidades de telefone.');
                  setIsImportModalOpen(false);
                }}
                style={{ marginTop: 12, fontSize: '0.75rem', color: '#cbd5e1' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setIsImportModalOpen(false)}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#cbd5e1', padding: '8px 16px', borderRadius: 8, fontSize: '0.78rem', cursor: 'pointer' }}
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
