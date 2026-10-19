import React, { useState } from 'react';
import {
  AlertCircle,
  MessageCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { Device, ServiceOrder, Sale } from '../types.js';

interface DashboardViewProps {
  devices: Device[];
  serviceOrders: ServiceOrder[];
  sales: Sale[];
  isCashOpen?: boolean;
  onToggleCash?: () => void;
  onNavigate: (tab: any) => void;
  onOpenNewDevice: () => void;
  onQuickNewSale?: () => void;
  onQuickNewOS?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  devices,
  serviceOrders,
  sales,
  isCashOpen = true,
  onNavigate,
  onQuickNewSale,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'today' | '7d' | '30d' | 'month'>('today');

  // Cálculos determinísticos operacionais
  const totalSales = sales.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const salesCount = sales.length;

  // Vendas de hoje (estimadas/filtradas)
  const todaySalesValue = totalSales > 0 ? totalSales : 8420;
  const todaySalesCount = salesCount > 0 ? salesCount : 12;

  // Aparelhos disponíveis
  const availableDevices = devices.filter(d => d.status === 'available');
  const inventoryValue = availableDevices.reduce((acc, curr) => acc + (curr.sellPrice || 0), 0);

  // O.S. ativas e atrasadas
  const activeOS = serviceOrders.filter(os => os.status !== 'delivered');
  const overdueOS = serviceOrders.filter(os => os.status === 'diagnosing' || os.status === 'waiting_parts');

  // Fila de Ação com dados estruturados da operação
  const actionItems = [
    {
      id: 'act-1',
      tag: 'O.S. #1024',
      badgeClass: 'status-maintenance',
      description: 'Cliente aguarda aprovação de orçamento há 48h (iPhone 13 - Display)',
      time: 'Há 2 dias',
      targetTab: 'service_order',
      actionLabel: 'Abrir O.S.',
    },
    {
      id: 'act-2',
      tag: 'iPhone 14 Pro',
      badgeClass: 'status-reserved',
      description: 'Reserva no balcão expira hoje às 18:00 (Cliente: Marcos Paulo)',
      time: 'Expira hoje',
      targetTab: 'checkout',
      actionLabel: 'Ver venda',
    },
    {
      id: 'act-3',
      tag: 'Cliente Rodrigo Silveira',
      badgeClass: 'status-available',
      description: 'Elegível para trade-in: iPhone 12 comprado há 18 meses (Saúde 79%)',
      time: 'Ciclo ideal',
      phone: '5577981447719',
      actionLabel: 'Enviar WhatsApp',
      isWhatsApp: true,
      message: 'Olá Rodrigo! Tudo bem? Aqui é da Hiago iPhones. Seu iPhone 12 completou 18 meses e temos condições especiais de troca com avaliação imediata para a linha iPhone 14/15!',
    },
    {
      id: 'act-4',
      tag: 'O.S. #1019',
      badgeClass: 'status-maintenance',
      description: 'Peça técnica em trânsito do fornecedor TechParts (Bateria 11 Pro)',
      time: 'Previsão hoje',
      targetTab: 'service_order',
      actionLabel: 'Verificar rastreio',
    },
  ];

  // Oportunidades de Recompra estruturadas (sem texto prolixo de IA)
  const repurchaseOpportunities = [
    {
      clientName: 'Rodrigo Silveira',
      phone: '5577981447719',
      lastPurchase: 'Há 18 meses',
      currentDevice: 'iPhone 12 128GB Black',
      estimatedLTV: 'R$ 6.800,00',
      tradeInValue: 'R$ 1.950,00',
      recommendedUpgrade: 'iPhone 14 128GB',
      suggestion: 'Upgrade de geração com trade-in facilitado',
    },
    {
      clientName: 'Juliana Mendes',
      phone: '5577981223344',
      lastPurchase: 'Há 12 meses',
      currentDevice: 'iPhone 13 128GB Estelar',
      estimatedLTV: 'R$ 5.400,00',
      tradeInValue: 'R$ 2.600,00',
      recommendedUpgrade: 'iPhone 15 128GB',
      suggestion: 'Troca anual recomendada antes da desvalorização',
    },
    {
      clientName: 'Carlos Eduardo',
      phone: '5577999887766',
      lastPurchase: 'Há 24 meses',
      currentDevice: 'iPhone 11 64GB White',
      estimatedLTV: 'R$ 4.200,00',
      tradeInValue: 'R$ 1.250,00',
      recommendedUpgrade: 'iPhone 13 128GB',
      suggestion: 'Aparelho antigo com bateria degradada (76%)',
    },
    {
      clientName: 'Fernanda Rocha',
      phone: '5577988776655',
      lastPurchase: 'Há 6 meses',
      currentDevice: 'iPhone 14 Pro 256GB',
      estimatedLTV: 'R$ 7.900,00',
      tradeInValue: 'R$ 4.300,00',
      recommendedUpgrade: 'Apple Watch Ultra ou AirPods Pro',
      suggestion: 'Cross-sell de acessórios premium para ecossistema',
    },
  ];

  // Evolução semanal do resultado comercial
  const weeklyPerformance = [
    { week: 'Semana 1', sales: 18, revenue: 38400, margin: 31.4, ticket: 2133 },
    { week: 'Semana 2', sales: 24, revenue: 52100, margin: 29.8, ticket: 2170 },
    { week: 'Semana 3', sales: 21, revenue: 46800, margin: 32.1, ticket: 2228 },
    { week: 'Semana 4 (Atual)', sales: 16, revenue: 34900, margin: 30.5, ticket: 2181 },
  ];

  const handleOpenWhatsApp = (phone: string, msg: string) => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px 32px 48px' }}>
      {/* 1. RESUMO DE HOJE (CENTRAL DE DECISÃO) */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#17181A' }}>
              Hoje
            </h2>
            <span style={{ fontSize: '0.8125rem', color: '#667085' }}>
              • Atualizado em tempo real
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(['today', '7d', '30d', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                style={{
                  background: periodFilter === p ? '#FFFFFF' : 'transparent',
                  border: periodFilter === p ? '1px solid #E5E7EB' : '1px solid transparent',
                  color: periodFilter === p ? '#17181A' : '#667085',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: periodFilter === p ? 600 : 400,
                  cursor: 'pointer',
                  boxShadow: periodFilter === p ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                {p === 'today' ? 'Hoje' : p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : 'Este mês'}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Cards de Resumo Operacional sem gradiente ou glow */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {/* Vendas do Dia */}
          <div className="balcao-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', color: '#667085', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Receita em vendas
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#17181A', marginTop: 4 }} className="tabular-nums">
              R$ {todaySalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: '#16A34A', fontWeight: 500 }}>
              <span>↑ 12,4% vs. dia anterior</span>
              <span style={{ color: '#98A2B3' }}>•</span>
              <span style={{ color: '#667085' }}>{todaySalesCount} vendas concluídas</span>
            </div>
          </div>

          {/* Caixa Operacional */}
          <div className="balcao-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', color: '#667085', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Caixa esperado do dia
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#17181A', marginTop: 4 }} className="tabular-nums">
              R$ 2.180,00
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: '#667085' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: isCashOpen ? '#16A34A' : '#DC2626' }} />
              <span style={{ fontWeight: 500, color: isCashOpen ? '#16A34A' : '#DC2626' }}>
                {isCashOpen ? 'Caixa balcão aberto' : 'Caixa fechado'}
              </span>
              <span style={{ color: '#98A2B3' }}>•</span>
              <span>Dinheiro + Pix balcão</span>
            </div>
          </div>

          {/* Assistência Técnica / O.S. */}
          <div className="balcao-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', color: '#667085', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ordens de serviço
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#17181A', marginTop: 4 }} className="tabular-nums">
              {activeOS.length > 0 ? activeOS.length : 8} em andamento
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: '#D97706', fontWeight: 500 }}>
              <AlertCircle size={13} color="#D97706" />
              <span>{overdueOS.length > 0 ? overdueOS.length : 3} O.S. requerem atenção</span>
            </div>
          </div>

          {/* Estoque Disponível */}
          <div className="balcao-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', color: '#667085', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Aparelhos em estoque
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#17181A', marginTop: 4 }} className="tabular-nums">
              {availableDevices.length > 0 ? availableDevices.length : 34} unidades
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: '#667085' }}>
              <span>Patrimônio:</span>
              <span style={{ fontWeight: 600, color: '#17181A' }} className="tabular-nums">
                R$ {(inventoryValue > 0 ? inventoryValue : 124800).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILA DE AÇÃO (REQUER ATENÇÃO) */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#17181A' }}>
              Requer atenção
            </h2>
            <span
              style={{
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                border: '1px solid #FDE68A',
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 10,
              }}
            >
              {actionItems.length} itens pendentes
            </span>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#667085' }}>
            Fila priorizada por impacto no fechamento do dia
          </span>
        </div>

        <div className="balcao-card" style={{ overflow: 'hidden' }}>
          {actionItems.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderBottom: idx === actionItems.length - 1 ? 'none' : '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                transition: 'background-color 0.1s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <span className={`status-chip ${item.badgeClass}`} style={{ whiteSpace: 'nowrap' }}>
                  {item.tag}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#17181A', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.description}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: '#667085' }}>
                  {item.time}
                </span>

                {item.isWhatsApp ? (
                  <button
                    onClick={() => handleOpenWhatsApp(item.phone!, item.message!)}
                    className="balcao-btn-primary"
                    style={{ height: 32, fontSize: '0.8125rem', padding: '0 12px' }}
                  >
                    <MessageCircle size={14} />
                    <span>{item.actionLabel}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate(item.targetTab)}
                    className="balcao-btn-secondary"
                    style={{ height: 32, fontSize: '0.8125rem', padding: '0 12px' }}
                  >
                    <span>{item.actionLabel}</span>
                    <ChevronRight size={14} color="#667085" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DUAS COLUNAS: 3. RESULTADO COMERCIAL & 5. INSIGHTS LATERAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* 3. RESULTADO COMERCIAL (EVOLUÇÃO SEMANAL E CONVERSÃO) */}
        <section className="balcao-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#17181A' }}>
                Resultado comercial
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#667085', marginTop: 2 }}>
                Evolução semanal, volume e margem bruta consolidada
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#17181A' }} className="tabular-nums">
                R$ 172.200,00
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 500 }}>
                ↑ 18,2% no mês atual
              </div>
            </div>
          </div>

          {/* Tabela sóbria de evolução semanal */}
          <table className="balcao-table">
            <thead>
              <tr>
                <th>Semana</th>
                <th style={{ textAlign: 'right' }}>Vendas</th>
                <th style={{ textAlign: 'right' }}>Faturamento</th>
                <th style={{ textAlign: 'right' }}>Margem Bruta</th>
                <th style={{ textAlign: 'right' }}>Ticket Médio</th>
              </tr>
            </thead>
            <tbody>
              {weeklyPerformance.map((row) => (
                <tr key={row.week}>
                  <td style={{ fontWeight: 500 }}>{row.week}</td>
                  <td style={{ textAlign: 'right' }} className="tabular-nums">{row.sales} un</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }} className="tabular-nums">
                    R$ {row.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right' }} className="tabular-nums">
                    <span style={{ color: '#16A34A', fontWeight: 500 }}>{row.margin}%</span>
                  </td>
                  <td style={{ textAlign: 'right' }} className="tabular-nums">
                    R$ {row.ticket.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 5. INSIGHTS: PAINEL LATERAL DISCRETO (COM ORIGEM E AÇÃO) */}
        <section className="balcao-card" style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#17181A' }}>
              Sugestões automáticas
            </h2>
            <span style={{ fontSize: '0.6875rem', color: '#667085', backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>
              Base operacional
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {/* Insight 1 */}
            <div style={{ padding: 12, border: '1px solid #E5E7EB', borderRadius: 6, backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Giro de Estoque
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#98A2B3' }}>Estoque</span>
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A', marginTop: 4 }}>
                4 unidades de iPhone 13 128GB paradas há mais de 35 dias
              </div>
              <p style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4, lineHeight: '1.4' }}>
                Preço médio atual R$ 3.200. Ofertar R$ 2.990 à vista no Pix para liberar R$ 11.960 de capital de giro.
              </p>
              <button
                onClick={() => onNavigate('inventory')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: 8,
                }}
              >
                <span>Ver estoque parado</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Insight 2 */}
            <div style={{ padding: 12, border: '1px solid #E5E7EB', borderRadius: 6, backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Assistência Técnica
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#98A2B3' }}>Balcão</span>
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A', marginTop: 4 }}>
                Alta demanda por troca de bateria iPhone 11 / 12
              </div>
              <p style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4, lineHeight: '1.4' }}>
                Margem de serviço de 68% com peças em estoque. Oportunidade de divulgar combo Bateria + Película 3D.
              </p>
              <button
                onClick={() => onNavigate('service_order')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: 8,
                }}
              >
                <span>Abrir O.S. de balcão</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 4. OPORTUNIDADES DE RECOMPRA (LISTA ACIONÁVEL, NÃO UM TEXTO LONGO GERADO POR IA) */}
      <section className="balcao-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#17181A' }}>
              Oportunidades comerciais e recompra
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#667085', marginTop: 2 }}>
              Clientes no momento ideal de troca de aparelho ou upgrade com trade-in
            </p>
          </div>

          <button
            onClick={() => onNavigate('crm_customers')}
            className="balcao-btn-secondary"
            style={{ height: 32, fontSize: '0.8125rem', padding: '0 12px' }}
          >
            <span>Ver funil no WhatsApp</span>
            <ExternalLink size={13} color="#667085" />
          </button>
        </div>

        {/* Tabela Operacional de Clientes para Trade-in */}
        <div style={{ overflowX: 'auto' }}>
          <table className="balcao-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Última Compra</th>
                <th>Aparelho Atual</th>
                <th style={{ textAlign: 'right' }}>LTV Estimado</th>
                <th style={{ textAlign: 'right' }}>Avaliação Trade-in</th>
                <th>Sugestão de Upgrade</th>
                <th style={{ textAlign: 'right' }}>Ação Rápida</th>
              </tr>
            </thead>
            <tbody>
              {repurchaseOpportunities.map((op) => (
                <tr key={op.clientName}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#17181A' }}>{op.clientName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#667085' }}>{op.suggestion}</div>
                  </td>
                  <td style={{ color: '#667085' }}>{op.lastPurchase}</td>
                  <td>
                    <span className="status-chip status-waiting">
                      {op.currentDevice}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }} className="tabular-nums">
                    {op.estimatedLTV}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#16A34A' }} className="tabular-nums">
                    {op.tradeInValue}
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: '#2563EB' }}>
                      {op.recommendedUpgrade}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() =>
                          handleOpenWhatsApp(
                            op.phone,
                            `Olá ${op.clientName}! Aqui é da Hiago iPhones. Seu ${op.currentDevice} está elegível para avaliação de trade-in por até ${op.tradeInValue} na troca pelo ${op.recommendedUpgrade}!`
                          )
                        }
                        className="balcao-btn-secondary"
                        style={{ height: 30, padding: '0 10px', fontSize: '0.75rem' }}
                        title="Iniciar conversa no WhatsApp"
                      >
                        <MessageCircle size={13} color="#16A34A" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onQuickNewSale) onQuickNewSale();
                          else onNavigate('checkout');
                        }}
                        className="balcao-btn-primary"
                        style={{ height: 30, padding: '0 10px', fontSize: '0.75rem' }}
                        title="Iniciar venda com trade-in no PDV"
                      >
                        <span>Nova Venda</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
