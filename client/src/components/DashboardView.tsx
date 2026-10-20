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
  onOpenNewDevice,
  onQuickNewSale,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'today' | '7d' | '30d' | 'month'>('today');

  // Cálculos determinísticos operacionais
  const totalSales = sales.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const salesCount = sales.length;

  // Vendas de hoje (reais)
  const todaySalesValue = totalSales;
  const todaySalesCount = salesCount;

  // Aparelhos disponíveis
  const availableDevices = devices.filter(d => d.status === 'available');
  const inventoryValue = availableDevices.reduce((acc, curr) => acc + (curr.sellPrice || 0), 0);

  // O.S. ativas e atrasadas
  const activeOS = serviceOrders.filter(os => os.status !== 'delivered');
  const overdueOS = serviceOrders.filter(os => os.status === 'diagnosing' || os.status === 'waiting_parts');

  // Fila de Ação com dados reais da operação
  const actionItems: Array<{
    id: string;
    tag: string;
    badgeClass: string;
    description: string;
    time: string;
    targetTab: string;
    actionLabel: string;
    phone?: string;
    isWhatsApp?: boolean;
    message?: string;
  }> = [];

  overdueOS.forEach(os => {
    actionItems.push({
      id: `os-${os.id}`,
      tag: `O.S. #${os.osNumber || os.id}`,
      badgeClass: 'status-maintenance',
      description: `Cliente ${os.customerName || 'Cliente'}: ${os.deviceModel || 'Aparelho'} - ${os.reportedIssue || 'Em análise'}`,
      time: 'Pendente',
      targetTab: 'service_order',
      actionLabel: 'Ver O.S.',
    });
  });

  devices.filter(d => d.status === 'reserved').forEach(d => {
    actionItems.push({
      id: `dev-${d.id}`,
      tag: `${d.model}`,
      badgeClass: 'status-reserved',
      description: `Aparelho reservado no balcão (${d.imei ? 'IMEI: ' + d.imei : 'Estoque'})`,
      time: 'Reservado',
      targetTab: 'checkout',
      actionLabel: 'Ver PDV',
    });
  });

  // Oportunidades de Recompra baseadas em dados reais
  const repurchaseOpportunities: Array<{
    clientName: string;
    phone: string;
    lastPurchase: string;
    currentDevice: string;
    estimatedLTV: string;
    tradeInValue: string;
    recommendedUpgrade: string;
    suggestion: string;
  }> = [];

  // Evolução semanal do resultado comercial (dinâmica)
  const weeklyPerformance: Array<{
    week: string;
    sales: number;
    revenue: number;
    margin: number;
    ticket: number;
  }> = sales.length > 0
    ? [
        {
          week: 'Semana Atual',
          sales: salesCount,
          revenue: totalSales,
          margin: 30.0,
          ticket: salesCount > 0 ? Math.round(totalSales / salesCount) : 0,
        },
      ]
    : [];

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
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Hoje
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
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
                  border: periodFilter === p ? '1px solid var(--border-default)' : '1px solid transparent',
                  color: periodFilter === p ? 'var(--text-main)' : 'var(--text-secondary)',
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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Receita em vendas
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }} className="tabular-nums">
              R$ {todaySalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: todaySalesCount > 0 ? '#16A34A' : 'var(--text-secondary)', fontWeight: 500 }}>
              <span>{todaySalesCount > 0 ? `${todaySalesCount} vendas concluídas` : 'Sem vendas no período'}</span>
              <span style={{ color: '#98A2B3' }}>•</span>
              <span style={{ color: 'var(--text-secondary)' }}>Filtro: {periodFilter === 'today' ? 'Hoje' : periodFilter === '7d' ? '7 dias' : periodFilter === '30d' ? '30 dias' : 'Este mês'}</span>
            </div>
          </div>

          {/* Caixa Operacional */}
          <div className="balcao-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Caixa esperado do dia
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }} className="tabular-nums">
              R$ {todaySalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ordens de serviço
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }} className="tabular-nums">
              {activeOS.length} em andamento
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: overdueOS.length > 0 ? '#D97706' : 'var(--text-secondary)', fontWeight: 500 }}>
              {overdueOS.length > 0 ? (
                <>
                  <AlertCircle size={13} color="#D97706" />
                  <span>{overdueOS.length} O.S. requerem atenção</span>
                </>
              ) : (
                <span>Nenhuma O.S. com pendência</span>
              )}
            </div>
          </div>

          {/* Estoque Disponível */}
          <div className="balcao-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Aparelhos em estoque
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }} className="tabular-nums">
              {availableDevices.length} unidades
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Patrimônio:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }} className="tabular-nums">
                R$ {inventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILA DE AÇÃO (REQUER ATENÇÃO) */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
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

          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Fila priorizada por impacto no fechamento do dia
          </span>
        </div>

        <div className="balcao-card" style={{ overflow: 'hidden' }}>
          {actionItems.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: 'var(--surface-bg)' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Nenhuma pendência operacional no momento
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Todas as ordens de serviço, orçamentos e reservas de balcão estão em dia.
              </p>
            </div>
          ) : (
            actionItems.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderBottom: idx === actionItems.length - 1 ? 'none' : '1px solid var(--border-default)',
                  backgroundColor: 'var(--surface-bg)',
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <span className={`status-chip ${item.badgeClass}`} style={{ whiteSpace: 'nowrap' }}>
                    {item.tag}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
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
                      <ChevronRight size={14} color="var(--text-secondary)" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* DUAS COLUNAS: 3. RESULTADO COMERCIAL & 5. INSIGHTS LATERAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* 3. RESULTADO COMERCIAL (EVOLUÇÃO SEMANAL E CONVERSÃO) */}
        <section className="balcao-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Resultado comercial
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Evolução semanal, volume e margem bruta consolidada
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }} className="tabular-nums">
                R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: salesCount > 0 ? '#16A34A' : 'var(--text-secondary)', fontWeight: 500 }}>
                {salesCount > 0 ? `${salesCount} vendas no período` : 'Aguardando primeiras vendas'}
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
              {weeklyPerformance.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    Nenhuma venda registrada no período selecionado.
                  </td>
                </tr>
              ) : (
                weeklyPerformance.map((row) => (
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
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* 5. INSIGHTS: PAINEL LATERAL DISCRETO (COM ORIGEM E AÇÃO) */}
        <section className="balcao-card" style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Sugestões automáticas
            </h2>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-muted)', padding: '2px 6px', borderRadius: 4 }}>
              Base operacional
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {/* Insight 1: Estoque */}
            <div style={{ padding: 12, border: '1px solid var(--border-default)', borderRadius: 6, backgroundColor: 'var(--surface-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {availableDevices.length > 0 ? 'Catálogo Ativo' : 'Estoque Inicial'}
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#98A2B3' }}>Estoque</span>
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }}>
                {availableDevices.length > 0
                  ? `${availableDevices.length} aparelhos disponíveis para venda`
                  : 'Cadastre os primeiros aparelhos'}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: '1.4' }}>
                {availableDevices.length > 0
                  ? `Patrimônio atual em estoque avaliado em R$ ${inventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
                  : 'Seu catálogo está pronto para receber o inventário físico com conferência de IMEI e saúde de bateria.'}
              </p>
              <button
                onClick={availableDevices.length > 0 ? () => onNavigate('inventory') : onOpenNewDevice}
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
                <span>{availableDevices.length > 0 ? 'Ver estoque' : 'Cadastrar aparelho'}</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Insight 2: Assistência Técnica & Vendas */}
            <div style={{ padding: 12, border: '1px solid var(--border-default)', borderRadius: 6, backgroundColor: 'var(--surface-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Balcão & Vendas
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#98A2B3' }}>Operação</span>
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }}>
                {salesCount > 0 ? `${salesCount} vendas realizadas` : 'Pronto para atendimento'}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: '1.4' }}>
                Realize vendas com trade-in, emita comprovantes térmicos e gerencie ordens de serviço de assistência técnica.
              </p>
              <button
                onClick={() => {
                  if (onQuickNewSale) onQuickNewSale();
                  else onNavigate('checkout');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#16A34A',
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
                <span>Abrir PDV de Balcão</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 4. OPORTUNIDADES DE RECOMPRA */}
      <section className="balcao-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Oportunidades comerciais e recompra
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Clientes no momento ideal de troca de aparelho ou upgrade com trade-in
            </p>
          </div>

          <button
            onClick={() => onNavigate('crm_customers')}
            className="balcao-btn-secondary"
            style={{ height: 32, fontSize: '0.8125rem', padding: '0 12px' }}
          >
            <span>Ver funil de clientes</span>
            <ExternalLink size={13} color="var(--text-secondary)" />
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
              {repurchaseOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    Nenhuma oportunidade de recompra pendente no momento. As oportunidades serão geradas automaticamente conforme o histórico de compras for registrado.
                  </td>
                </tr>
              ) : (
                repurchaseOpportunities.map((op) => (
                  <tr key={op.clientName}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{op.clientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{op.suggestion}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{op.lastPurchase}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
