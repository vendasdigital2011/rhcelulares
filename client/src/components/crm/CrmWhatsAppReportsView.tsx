import React, { useMemo } from 'react';
import {
  TrendingUp,
  MessageSquare,
  Clock,
  DollarSign,
  ShoppingBag,
  Zap,
  BarChart3,
  Users
} from 'lucide-react';
import type { WhatsAppChat, Sale, ServiceOrder } from '../../types.js';
import { calculateWhatsAppMetrics } from '../../repositories/whatsappRepository.js';

interface CrmWhatsAppReportsViewProps {
  chats: WhatsAppChat[];
  sales: Sale[];
  serviceOrders: ServiceOrder[];
}

export const CrmWhatsAppReportsView: React.FC<CrmWhatsAppReportsViewProps> = ({
  chats,
  sales,
  serviceOrders,
}) => {
  const metrics = useMemo(() => {
    return calculateWhatsAppMetrics(chats, sales, serviceOrders);
  }, [chats, sales, serviceOrders]);

  // Desempenho por Atendente
  const attendantStats = useMemo(() => {
    const map: Record<string, { total: number; resolved: number; salesTotal: number }> = {};
    for (const chat of chats) {
      const user = chat.assignedUserName || 'Não Atribuído';
      if (!map[user]) {
        map[user] = { total: 0, resolved: 0, salesTotal: 0 };
      }
      map[user].total += 1;
      if (['resolved', 'closed'].includes(chat.status)) {
        map[user].resolved += 1;
      }
    }
    return Object.entries(map).map(([name, data]) => ({
      name,
      total: data.total,
      resolved: data.resolved,
      resolutionRate: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0,
    }));
  }, [chats]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO DO RELATÓRIO */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: 8,
          border: '1px solid #E5E7EB',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={20} color="#16A34A" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Relatório Comercial & Métricas WhatsApp 360° (RF07)
            </h2>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '4px 0 0 0' }}>
            Acompanhe o tempo de resposta, taxa de conversão em vendas de balcão e receita atribuída ao canal WhatsApp.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#15803D',
              backgroundColor: '#DCFCE7',
              border: '1px solid #86EFAC',
              padding: '6px 12px',
              borderRadius: 20,
            }}
          >
            <Zap size={14} />
            <span>SLA Meta Cloud Ativo</span>
          </span>
        </div>
      </div>

      {/* CARDS DE KPI (4 COLUNAS) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {/* KPI 1: Total de Atendimentos */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Atendimentos WhatsApp
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={16} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>
            {metrics.totalChats}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#4B5563' }}>
            <strong style={{ color: '#15803D' }}>{metrics.resolvedChats} concluídos</strong> • {metrics.openChats} em andamento
          </div>
        </div>

        {/* KPI 2: Tempo Médio de Primeira Resposta (TMR) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Tempo Médio de Resposta (TMR)
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>
            {metrics.firstResponseTimeMin} min
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#15803D', fontWeight: 600 }}>
            ⚡ Dentro do limite ideal (Meta SLA &lt; 15 min)
          </div>
        </div>

        {/* KPI 3: Taxa de Conversão */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Conversão Comercial
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#16A34A" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16A34A' }}>
            {metrics.conversionRatePercent}%
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#4B5563' }}>
            <strong>{metrics.leadsConvertedCount} conversões</strong> geradas no período
          </div>
        </div>

        {/* KPI 4: Receita Originada */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Receita Originada no WhatsApp
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} color="#7C3AED" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>
            R$ {metrics.revenueOriginated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#6B7280' }}>
            Vendas no PDV + OS de assistência concluídas
          </div>
        </div>
      </div>

      {/* SEÇÃO DE DISTRIBUIÇÃO E ATENDENTES (2 COLUNAS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Coluna 1: Distribuição Departamental */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShoppingBag size={18} color="#2563EB" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              Volume por Departamento
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Vendas */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Vendas (iPhones & Acessórios)</span>
                <span style={{ fontWeight: 700, color: '#16A34A' }}>{metrics.departmentCounts.vendas} atendimentos</span>
              </div>
              <div style={{ height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#16A34A',
                    width: `${metrics.totalChats > 0 ? (metrics.departmentCounts.vendas / metrics.totalChats) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Assistência */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Assistência Técnica (Ordens de Serviço)</span>
                <span style={{ fontWeight: 700, color: '#DC2626' }}>{metrics.departmentCounts.assistencia} atendimentos</span>
              </div>
              <div style={{ height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#DC2626',
                    width: `${metrics.totalChats > 0 ? (metrics.departmentCounts.assistencia / metrics.totalChats) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Financeiro */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Financeiro (Comprovantes & Cobrança)</span>
                <span style={{ fontWeight: 700, color: '#D97706' }}>{metrics.departmentCounts.financeiro} atendimentos</span>
              </div>
              <div style={{ height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#D97706',
                    width: `${metrics.totalChats > 0 ? (metrics.departmentCounts.financeiro / metrics.totalChats) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2: Desempenho por Atendente */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={18} color="#7C3AED" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              Desempenho por Operador
            </h3>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', textAlign: 'left' }}>
                <th style={{ padding: '6px 4px', fontWeight: 700 }}>Atendente</th>
                <th style={{ padding: '6px 4px', fontWeight: 700, textAlign: 'center' }}>Total Atendidos</th>
                <th style={{ padding: '6px 4px', fontWeight: 700, textAlign: 'center' }}>Concluídos</th>
                <th style={{ padding: '6px 4px', fontWeight: 700, textAlign: 'right' }}>Taxa Resolução</th>
              </tr>
            </thead>
            <tbody>
              {attendantStats.map((stat, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 600, color: '#111827' }}>{stat.name}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', color: '#4B5563' }}>{stat.total}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', color: '#15803D', fontWeight: 700 }}>{stat.resolved}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: stat.resolutionRate >= 70 ? '#DCFCE7' : '#FEF3C7',
                        color: stat.resolutionRate >= 70 ? '#15803D' : '#D97706',
                      }}
                    >
                      {stat.resolutionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
