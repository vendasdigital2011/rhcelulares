import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  RefreshCw, 
  Wrench, 
  Headphones, 
  Share2, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Search, 
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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTriggers = triggers.filter(t => {
    const matchesFilter = selectedFilter === 'all' || t.type === selectedFilter;
    const matchesSearch = t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.customerPhone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const pendingCount = triggers.filter(t => t.status === 'pending').length;
  const sentCount = triggers.filter(t => t.status === 'sent').length;
  const convertedCount = triggers.filter(t => t.status === 'converted').length;

  const handleSendWhatsApp = (trigger: AfterSalesTrigger) => {
    const cleanPhone = trigger.customerPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(trigger.suggestedMessage);
    window.open(`https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`}?text=${encoded}`, '_blank');

    // Atualiza status para enviado
    setTriggers(prev => prev.map(t => t.id === trigger.id ? { ...t, status: 'sent' } : t));
    if (onTriggerAction) onTriggerAction(trigger.id, 'sent');
  };

  const handleMarkConverted = (triggerId: string) => {
    setTriggers(prev => prev.map(t => t.id === triggerId ? { ...t, status: 'converted' } : t));
    if (onTriggerAction) onTriggerAction(triggerId, 'converted');
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'birthday': return <span style={{ fontSize: '1.1rem' }}>🎂</span>;
      case 'upgrade_d360': return <RefreshCw size={16} color="#38bdf8" />;
      case 'checkup_d180': return <Wrench size={16} color="#10b981" />;
      case 'accessory_d15': return <Headphones size={16} color="#f59e0b" />;
      case 'referral': return <Share2 size={16} color="#a855f7" />;
      default: return <Sparkles size={16} color="#10b981" />;
    }
  };

  const getRuleBadgeColor = (type: string) => {
    switch (type) {
      case 'birthday': return { bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e', border: 'rgba(244, 63, 94, 0.3)' };
      case 'upgrade_d360': return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
      case 'checkup_d180': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'accessory_d15': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'referral': return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: '#f8fafc', border: 'rgba(255, 255, 255, 0.2)' };
    }
  };

  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#10b981',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            MOTOR DE REATIVAÇÃO & CICLO DO CLIENTE
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', marginTop: 4 }}>
            Central de Pós-Venda Preditivo
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
            Réguas inteligentes de contato no WhatsApp baseadas no tempo de compra e saúde da bateria.
          </p>
        </div>

        {/* STATUS GERAL DE DISPAROS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '8px 14px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: '0.78rem',
            fontWeight: 700,
          }}>
            <span style={{ color: '#f59e0b' }}>{pendingCount} Pendentes</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#38bdf8' }}>{sentCount} Enviados</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#10b981' }}>{convertedCount} Convertidos</span>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '8px 14px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#10b981',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}>
            <Sparkles size={15} />
            <span>5 Réguas Nativas Ativas</span>
          </div>
        </div>
      </div>

      {/* 3 CARDS DE IMPACTO COMERCIAL (ROI) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>Oportunidades Pendentes Hoje</span>
            <Clock size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#f8fafc', marginTop: 8 }}>
            {pendingCount} Disparos
          </div>
          <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: 4, fontWeight: 600 }}>
            Clientes quentes para abordagem no WhatsApp
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>Receita Potencial Estimada</span>
            <DollarSign size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#10b981', marginTop: 8 }}>
            R$ 8.940,00
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
            Upgrades D+360 + Acessórios D+15 somados
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>Conversões Realizadas</span>
            <TrendingUp size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#38bdf8', marginTop: 8 }}>
            {convertedCount} Vendas Concluídas
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 4, fontWeight: 600 }}>
            Clientes reativados sem gasto de anúncio
          </div>
        </div>
      </div>

      {/* FILTROS DE RÉGUAS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255, 255, 255, 0.03)',
          padding: 4,
          borderRadius: 10,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
        }}>
          {[
            { id: 'all', label: 'Todas as Oportunidades' },
            { id: 'birthday', label: '🎂 Aniversariantes' },
            { id: 'upgrade_d360', label: '🔄 Upgrade D+360' },
            { id: 'checkup_d180', label: '🛠️ Checkup D+180' },
            { id: 'accessory_d15', label: '🎧 Acessórios D+15' },
            { id: 'referral', label: '🤝 Indicação' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: selectedFilter === tab.id ? '#10b981' : 'transparent',
                color: selectedFilter === tab.id ? '#ffffff' : '#94a3b8',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* BUSCA RÁPIDA */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 8,
          padding: '6px 12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: 260,
        }}>
          <Search size={14} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar oportunidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.78rem',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* LISTA DE CARDS DE OPORTUNIDADES DE PÓS-VENDA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredTriggers.length > 0 ? (
          filteredTriggers.map((trig) => {
            const badge = getRuleBadgeColor(trig.type);
            return (
              <div
                key={trig.id}
                className="glass-panel"
                style={{
                  padding: '20px 24px',
                  borderRadius: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  border: trig.status === 'converted' 
                    ? '1px solid rgba(16, 185, 129, 0.4)' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {getRuleIcon(trig.type)}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 20,
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          textTransform: 'uppercase',
                        }}>
                          {trig.title}
                        </span>

                        {trig.discountOffered && (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 20,
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#f8fafc',
                          }}>
                            🎁 {trig.discountOffered}
                          </span>
                        )}

                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          • {trig.date}
                        </span>
                      </div>

                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                        {trig.customerName} • <span style={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 500 }}>{trig.deviceModel}</span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                        {trig.description}
                      </div>
                    </div>
                  </div>

                  {/* STATUS & BOTÕES DE AÇÃO */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {trig.status === 'converted' ? (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        <CheckCircle2 size={13} />
                        Convertido em Venda
                      </span>
                    ) : (
                      <>
                        {trig.status === 'sent' && (
                          <button
                            onClick={() => handleMarkConverted(trig.id)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              color: '#cbd5e1',
                              padding: '8px 12px',
                              borderRadius: 8,
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Marcar como Fechado
                          </button>
                        )}

                        <button
                          onClick={() => handleSendWhatsApp(trig)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: 8,
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
                          }}
                        >
                          <Send size={13} />
                          {trig.status === 'sent' ? 'Reenviar no WhatsApp' : 'Disparar WhatsApp'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* PRÉVIA DA MENSAGEM SUGERIDA */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: '0.78rem',
                  color: '#cbd5e1',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line',
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', marginBottom: 4 }}>
                    MENSAGEM OFICIAL PRÉ-FORMATADA:
                  </div>
                  {trig.suggestedMessage}
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-panel" style={{ padding: 40, textAlign: 'center', borderRadius: 14, color: '#94a3b8' }}>
            Nenhuma oportunidade de reativação para o filtro selecionado.
          </div>
        )}
      </div>
    </div>
  );
};
