import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Search, 
  MessageSquare
} from 'lucide-react';
import type { AfterSalesTrigger } from '../types.js';

interface AfterSalesViewProps {
  triggers: AfterSalesTrigger[];
  onTriggerAction?: (id: string, newStatus: 'sent' | 'converted') => void;
}

export const AfterSalesView: React.FC<AfterSalesViewProps> = ({
  triggers: initialTriggers,
  onTriggerAction,
}) => {
  const [triggers, setTriggers] = useState<AfterSalesTrigger[]>(initialTriggers);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'birthday' | 'upgrade_d360' | 'checkup_d180' | 'accessory_d15' | 'referral'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'converted'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    if (initialTriggers && initialTriggers.length > 0) {
      setTriggers(initialTriggers);
    }
  }, [initialTriggers]);

  const filteredTriggers = triggers.filter(t => {
    const matchesFilter = selectedFilter === 'all' || t.type === selectedFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.customerPhone.includes(searchTerm);
    return matchesFilter && matchesStatus && matchesSearch;
  });

  const pendingCount = triggers.filter(t => t.status === 'pending').length;
  const sentCount = triggers.filter(t => t.status === 'sent').length;
  const convertedCount = triggers.filter(t => t.status === 'converted').length;

  const handleSendWhatsApp = (trigger: AfterSalesTrigger) => {
    const cleanPhone = trigger.customerPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(trigger.suggestedMessage);
    window.open(`https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`}?text=${encoded}`, '_blank');

    setTriggers(prev => prev.map(t => t.id === trigger.id ? { ...t, status: 'sent' } : t));
    if (onTriggerAction) onTriggerAction(trigger.id, 'sent');
  };

  const handleMarkConverted = (triggerId: string) => {
    setTriggers(prev => prev.map(t => t.id === triggerId ? { ...t, status: 'converted' } : t));
    if (onTriggerAction) onTriggerAction(triggerId, 'converted');
  };

  const getRuleLabel = (type: string) => {
    switch (type) {
      case 'birthday': return 'Aniversário';
      case 'upgrade_d360': return 'Upgrade D+360';
      case 'checkup_d180': return 'Revisão D+180';
      case 'accessory_d15': return 'Acessórios D+15';
      case 'referral': return 'Indicação';
      default: return type;
    }
  };

  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 3 CARDS DE IMPACTO COMERCIAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
            Oportunidades pendentes hoje
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: pendingCount > 0 ? '#D97706' : '#17181A', marginTop: 6 }}>
            {pendingCount} contatos
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>
            Clientes prontos para envio de mensagem no WhatsApp
          </div>
        </div>

        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
            Receita potencial estimada
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: pendingCount > 0 ? '#16A34A' : '#17181A', marginTop: 6 }}>
            R$ {(pendingCount * 1490).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>
            Upgrade de aparelhos + vendas cruzadas de acessórios
          </div>
        </div>

        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
            Conversões concluídas
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563EB', marginTop: 6 }}>
            {convertedCount} vendas
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>
            Clientes fidelizados sem custo de aquisição (CAC zero)
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS & BUSCA */}
      <div className="balcao-card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          {/* Campo de Busca */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#F7F8FA',
            border: '1px solid #E5E7EB',
            borderRadius: 6,
            padding: '7px 12px',
            flex: 1,
            maxWidth: 380,
          }}>
            <Search size={15} color="#667085" />
            <input
              type="text"
              placeholder="Buscar por cliente, aparelho ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.8125rem',
                color: '#17181A',
                width: '100%',
              }}
            />
          </div>

          {/* Filtros de Status */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' ? 'balcao-btn-primary' : 'balcao-btn-secondary'}
              style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
            >
              Todos ({triggers.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={statusFilter === 'pending' ? 'balcao-btn-primary' : 'balcao-btn-secondary'}
              style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('sent')}
              className={statusFilter === 'sent' ? 'balcao-btn-primary' : 'balcao-btn-secondary'}
              style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
            >
              Enviados ({sentCount})
            </button>
            <button
              onClick={() => setStatusFilter('converted')}
              className={statusFilter === 'converted' ? 'balcao-btn-primary' : 'balcao-btn-secondary'}
              style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
            >
              Convertidos ({convertedCount})
            </button>
          </div>
        </div>

        {/* Abas por tipo de régua */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid #F3F4F6', paddingTop: 10 }}>
          {[
            { id: 'all', label: 'Todas as réguas' },
            { id: 'upgrade_d360', label: 'Upgrade D+360' },
            { id: 'checkup_d180', label: 'Revisão D+180' },
            { id: 'accessory_d15', label: 'Acessórios D+15' },
            { id: 'birthday', label: 'Aniversariantes' },
            { id: 'referral', label: 'Indicação' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: selectedFilter === tab.id ? '#2563EB' : '#E5E7EB',
                backgroundColor: selectedFilter === tab.id ? '#EFF6FF' : '#FFFFFF',
                color: selectedFilter === tab.id ? '#2563EB' : '#667085',
                fontSize: '0.75rem',
                fontWeight: selectedFilter === tab.id ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA DE GATILHOS DE PÓS-VENDA */}
      <div className="balcao-card" style={{ overflow: 'hidden' }}>
        <table className="balcao-table">
          <thead>
            <tr>
              <th>Cliente & Telefone</th>
              <th>Aparelho Adquirido</th>
              <th>Régua</th>
              <th>Mensagem Sugerida</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', width: 220 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTriggers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 36, textAlign: 'center', color: '#667085' }}>
                  Nenhum gatilho de pós-venda encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredTriggers.map(trig => (
                <tr key={trig.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#17181A' }}>{trig.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#667085' }}>{trig.customerPhone}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#17181A' }}>
                      {trig.deviceModel}
                    </div>
                  </td>
                  <td>
                    <span className="status-chip status-reserved" style={{ fontSize: '0.6875rem' }}>
                      {getRuleLabel(trig.type)}
                    </span>
                  </td>
                  <td style={{ maxWidth: 360 }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#475467',
                      lineHeight: 1.4,
                      backgroundColor: '#F9FAFB',
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #E5E7EB',
                    }}>
                      "{trig.suggestedMessage}"
                    </div>
                  </td>
                  <td>
                    {trig.status === 'pending' && <span className="status-chip status-maintenance">Pendente</span>}
                    {trig.status === 'sent' && <span className="status-chip status-reserved">Enviado</span>}
                    {trig.status === 'converted' && <span className="status-chip status-available">Convertido</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => handleSendWhatsApp(trig)}
                        className="balcao-btn-primary"
                        style={{ height: 30, padding: '0 10px', fontSize: '0.75rem', gap: 4 }}
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </button>

                      {trig.status !== 'converted' && (
                        <button
                          onClick={() => handleMarkConverted(trig.id)}
                          className="balcao-btn-secondary"
                          style={{ height: 30, padding: '0 8px', fontSize: '0.75rem', color: '#16A34A', gap: 4 }}
                          title="Marcar como Venda Convertida"
                        >
                          <CheckCircle2 size={13} />
                          <span>Converteu</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
