import React, { useState, useMemo } from 'react';
import {
  Search,
  MessageSquare,
  Clock,
  User,
  ChevronRight,
  Filter,
  Eye,
  Smartphone
} from 'lucide-react';
import type { ServiceOrder, OSStatus } from '../../types.js';

interface CrmAssistanceKanbanProps {
  serviceOrders: ServiceOrder[];
  onUpdateStatus: (id: string, status: OSStatus, notes?: string, operator?: string) => Promise<any>;
  onOpenOrderDetail?: (order: ServiceOrder) => void;
}

interface KanbanStage {
  id: string;
  label: string;
  color: string;
  bgBadge: string;
  targetStatus: OSStatus;
  statuses: string[];
}

const ASSISTANCE_STAGES: KanbanStage[] = [
  {
    id: 'recebido',
    label: '1. Recebido',
    color: '#3B82F6',
    bgBadge: 'rgba(59, 130, 246, 0.12)',
    targetStatus: 'aberta',
    statuses: ['aberta', 'received', 'aguardando_diagnostico'],
  },
  {
    id: 'diagnostico',
    label: '2. Diagnóstico',
    color: '#8B5CF6',
    bgBadge: 'rgba(139, 92, 246, 0.12)',
    targetStatus: 'em_diagnostico',
    statuses: ['em_diagnostico', 'diagnosing', 'aguardando_orcamento'],
  },
  {
    id: 'orcamento',
    label: '3. Orçamento',
    color: '#F59E0B',
    bgBadge: 'rgba(245, 158, 11, 0.12)',
    targetStatus: 'aguardando_aprovacao',
    statuses: ['aguardando_aprovacao', 'waiting_approval'],
  },
  {
    id: 'em_reparo',
    label: '4. Em Reparo',
    color: '#EC4899',
    bgBadge: 'rgba(236, 72, 153, 0.12)',
    targetStatus: 'em_reparo',
    statuses: ['aprovada', 'approved', 'em_reparo', 'in_repair', 'aguardando_pecas', 'waiting_parts'],
  },
  {
    id: 'pronto',
    label: '5. Pronto p/ Retirada',
    color: '#10B981',
    bgBadge: 'rgba(16, 185, 129, 0.12)',
    targetStatus: 'pronta',
    statuses: ['pronta', 'ready', 'em_testes', 'testing'],
  },
  {
    id: 'entregue',
    label: '6. Entregue',
    color: '#6B7280',
    bgBadge: 'rgba(107, 114, 128, 0.12)',
    targetStatus: 'entregue',
    statuses: ['entregue', 'delivered'],
  },
];

export const CrmAssistanceKanban: React.FC<CrmAssistanceKanbanProps> = ({
  serviceOrders,
  onUpdateStatus,
  onOpenOrderDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Lista de técnicos únicos
  const technicians = useMemo(() => {
    const set = new Set<string>();
    serviceOrders.forEach(o => {
      const tech = o.technician || (o as any).technicianName;
      if (tech) set.add(tech);
    });
    return Array.from(set);
  }, [serviceOrders]);

  // Filtragem de ordens
  const filteredOrders = useMemo(() => {
    return serviceOrders.filter(os => {
      const tech = os.technician || (os as any).technicianName;
      if (technicianFilter !== 'all' && tech !== technicianFilter) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        const matchName = os.customerName?.toLowerCase().includes(term);
        const matchPhone = os.customerPhone?.includes(term);
        const matchModel = os.deviceModel?.toLowerCase().includes(term);
        const matchNumber = os.osNumber?.toLowerCase().includes(term);
        const matchImei = os.imei?.includes(term);
        return Boolean(matchName || matchPhone || matchModel || matchNumber || matchImei);
      }
      return true;
    });
  }, [serviceOrders, technicianFilter, searchTerm]);

  // Disparo de mensagem no WhatsApp com template inteligente de acordo com o status
  const handleOpenWhatsApp = (order: ServiceOrder) => {
    const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      alert('Telefone do cliente não cadastrado.');
      return;
    }

    let message = '';
    const val = Number(order.finalValue || order.estimatedValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    if (['aguardando_aprovacao', 'waiting_approval'].includes(order.status)) {
      message = `Olá, ${order.customerName}! Aqui é da assistência técnica Hiago iPhones. O orçamento para o seu ${order.deviceModel} (OS ${order.osNumber}) ficou em R$ ${val}. Podemos iniciar o reparo?`;
    } else if (['pronta', 'ready'].includes(order.status)) {
      message = `Olá, ${order.customerName}! Boas notícias da Hiago iPhones: seu ${order.deviceModel} (OS ${order.osNumber}) já está pronto para retirada! Ficamos no aguardo da sua visita.`;
    } else if (['em_reparo', 'in_repair', 'aprovada'].includes(order.status)) {
      message = `Olá, ${order.customerName}! Seu ${order.deviceModel} (OS ${order.osNumber}) já está na bancada com nosso técnico e o reparo está em andamento. Avisaremos assim que concluir!`;
    } else {
      message = `Olá, ${order.customerName}! Aqui é da assistência técnica Hiago iPhones sobre a sua Ordem de Serviço ${order.osNumber} (${order.deviceModel}). Como podemos ajudar?`;
    }

    const text = encodeURIComponent(message);
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
  };

  const handleAdvanceStage = async (order: ServiceOrder, currentStageIndex: number) => {
    if (currentStageIndex >= ASSISTANCE_STAGES.length - 1) return;
    const nextStage = ASSISTANCE_STAGES[currentStageIndex + 1];
    setUpdatingId(order.id);
    try {
      await onUpdateStatus(order.id, nextStage.targetStatus, `Avançado para ${nextStage.label} via Kanban CRM`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* BARRA DE FILTROS E BUSCA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 16px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              padding: '6px 12px',
              flex: 1,
              maxWidth: 420,
            }}
          >
            <Search size={15} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Buscar por cliente, OS, aparelho ou IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.8125rem',
                width: '100%',
                color: '#111827',
              }}
            />
          </div>

          {/* Filtro por Técnico */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color="#6B7280" />
            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: '0.8125rem',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                outline: 'none',
              }}
            >
              <option value="all">Todos os técnicos ({serviceOrders.length})</option>
              {technicians.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: '#6B7280' }}>
          <span>Total de Ordens Ativas: <strong>{filteredOrders.length}</strong></span>
        </div>
      </div>

      {/* QUADRO KANBAN (6 COLUNAS REQUERIDAS PELO PRD) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(220px, 1fr))',
          gap: 12,
          alignItems: 'start',
          overflowX: 'auto',
          paddingBottom: 16,
        }}
      >
        {ASSISTANCE_STAGES.map((stage, stageIndex) => {
          const stageOrders = filteredOrders.filter(os => stage.statuses.includes(os.status));
          const totalValueStage = stageOrders.reduce((sum, os) => sum + Number(os.finalValue || os.estimatedValue || 0), 0);

          return (
            <div
              key={stage.id}
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minHeight: 520,
              }}
            >
              {/* CABEÇALHO DA COLUNA */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 8,
                  borderBottom: `2px solid ${stage.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: stage.color }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827' }}>{stage.label}</span>
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    backgroundColor: stage.bgBadge,
                    color: stage.color,
                    padding: '2px 7px',
                    borderRadius: 10,
                  }}
                >
                  {stageOrders.length}
                </span>
              </div>

              {totalValueStage > 0 && (
                <div style={{ fontSize: '0.6875rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Previsto:</span>
                  <strong style={{ color: '#111827' }}>
                    R$ {totalValueStage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              )}

              {/* LISTA DE CARTÕES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {stageOrders.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 12px',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      color: '#9CA3AF',
                      border: '1px dashed #E5E7EB',
                      borderRadius: 6,
                    }}
                  >
                    Nenhuma OS nesta etapa
                  </div>
                ) : (
                  stageOrders.map(order => {
                    const val = Number(order.finalValue || order.estimatedValue || 0);
                    const isUpdating = updatingId === order.id;

                    return (
                      <div
                        key={order.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: 6,
                          padding: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'all 0.15s ease',
                          opacity: isUpdating ? 0.6 : 1,
                        }}
                      >
                        {/* Linha 1: Cliente e Número da OS */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                            {order.customerName}
                          </span>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              color: '#2563EB',
                              backgroundColor: '#EFF6FF',
                              padding: '1px 5px',
                              borderRadius: 4,
                            }}
                          >
                            {order.osNumber}
                          </span>
                        </div>

                        {/* Aparelho */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#374151', fontWeight: 600 }}>
                          <Smartphone size={13} color="#6B7280" />
                          <span>{order.deviceModel}</span>
                        </div>

                        {/* Defeito Relatado */}
                        <div
                          style={{
                            fontSize: '0.6875rem',
                            color: '#6B7280',
                            backgroundColor: '#F9FAFB',
                            padding: '4px 6px',
                            borderRadius: 4,
                            lineHeight: 1.25,
                            maxHeight: 34,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {order.reportedIssue || 'Sem defeito relatado'}
                        </div>

                        {/* Técnico e Prazo */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', color: '#6B7280', marginTop: 2 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <User size={11} />
                            {(order.technician || (order as any).technicianName || 'Técnico').split(' ')[0]}
                          </span>
                          {order.estimatedDeliveryDate && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={11} />
                              {order.estimatedDeliveryDate}
                            </span>
                          )}
                        </div>

                        {/* Valor & Ações de Comunicação */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: 6,
                            marginTop: 4,
                            borderTop: '1px solid #F3F4F6',
                          }}
                        >
                          <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#111827' }}>
                            R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {/* Botão WhatsApp Oficial */}
                            <button
                              onClick={() => handleOpenWhatsApp(order)}
                              title="Abrir WhatsApp com mensagem automática de status"
                              style={{
                                background: '#DCFCE7',
                                border: '1px solid #86EFAC',
                                color: '#16A34A',
                                borderRadius: 4,
                                padding: '4px 6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                              }}
                            >
                              <MessageSquare size={12} />
                              <span>Zap</span>
                            </button>

                            {/* Botão de Ver Detalhes */}
                            <button
                              onClick={() => {
                                if (onOpenOrderDetail) {
                                  onOpenOrderDetail(order);
                                } else {
                                  setSelectedOrder(order);
                                }
                              }}
                              title="Ver ficha completa da OS"
                              style={{
                                background: '#F3F4F6',
                                border: '1px solid #E5E7EB',
                                color: '#374151',
                                borderRadius: 4,
                                padding: '4px 6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Eye size={12} />
                            </button>

                            {/* Botão de Avançar Etapa */}
                            {stageIndex < ASSISTANCE_STAGES.length - 1 && (
                              <button
                                onClick={() => handleAdvanceStage(order, stageIndex)}
                                disabled={isUpdating}
                                title={`Avançar para ${ASSISTANCE_STAGES[stageIndex + 1].label}`}
                                style={{
                                  background: stage.color,
                                  border: 'none',
                                  color: '#FFFFFF',
                                  borderRadius: 4,
                                  padding: '4px 6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <ChevronRight size={12} />
                              </button>
                            )}
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

      {/* MODAL DE RESUMO RÁPIDO DA OS */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              width: '100%',
              maxWidth: 500,
              padding: 20,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: 10 }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', fontFamily: 'monospace' }}>
                  {selectedOrder.osNumber}
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {selectedOrder.customerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '0.6875rem' }}>Aparelho:</span>
                <div style={{ fontWeight: 600, color: '#111827' }}>{selectedOrder.deviceModel}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '0.6875rem' }}>IMEI:</span>
                <div style={{ fontWeight: 600, color: '#111827' }}>{selectedOrder.imei || 'Não informado'}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '0.6875rem' }}>Telefone:</span>
                <div style={{ fontWeight: 600, color: '#111827' }}>{selectedOrder.customerPhone}</div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '0.6875rem' }}>Técnico:</span>
                <div style={{ fontWeight: 600, color: '#111827' }}>{selectedOrder.technician || (selectedOrder as any).technicianName || 'Não atribuído'}</div>
              </div>
            </div>

            <div>
              <span style={{ color: '#6B7280', fontSize: '0.6875rem' }}>Defeito Reclamado:</span>
              <div style={{ backgroundColor: '#F9FAFB', padding: 8, borderRadius: 6, fontSize: '0.75rem', color: '#374151', marginTop: 2 }}>
                {selectedOrder.reportedIssue || 'Sem observações'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EFF6FF', padding: '10px 14px', borderRadius: 6 }}>
              <span style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 600 }}>Valor Total:</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1E40AF' }}>
                R$ {Number(selectedOrder.finalValue || selectedOrder.estimatedValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => handleOpenWhatsApp(selectedOrder)}
                style={{
                  flex: 1,
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <MessageSquare size={15} />
                <span>Conversar no WhatsApp</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  padding: '10px 16px',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
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
