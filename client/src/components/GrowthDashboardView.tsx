import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Target,
  Percent,
  ArrowUpRight,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import type { Device, ServiceOrder, Sale } from '../types.js';

type PeriodOption = 'today' | '7d' | '30d' | 'month' | 'custom';
type MetricView = 'revenue' | 'customers' | 'conversion';

interface GrowthDashboardViewProps {
  devices: Device[];
  serviceOrders: ServiceOrder[];
  sales: Sale[];
  onNavigate: (tab: any) => void;
}

export const GrowthDashboardView: React.FC<GrowthDashboardViewProps> = ({
  onNavigate,
}) => {
  const [period, setPeriod] = useState<PeriodOption>('30d');
  const [metricView, setMetricView] = useState<MetricView>('revenue');
  const [hasData, setHasData] = useState<boolean>(true);

  const periodLabels: Record<PeriodOption, string> = {
    today: 'Hoje',
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    month: 'Este mês',
    custom: 'Personalizado',
  };

  const metrics = {
    revenue: {
      value: 'R$ 14.850,00',
      change: '+22.4%',
      periodLabel: 'vs. 30 dias anteriores',
      attributedSales: 38,
      criterion: 'Atribuição em janela de 7 dias pós-interação no CRM/WhatsApp',
    },
    reactivated: {
      value: '47',
      change: '+18.2%',
      periodLabel: 'vs. 30 dias anteriores',
      criterion: 'Clientes inativos (>60 dias sem compra) que efetuaram nova compra',
    },
    opportunities: {
      value: '83',
      pipelineValue: 'R$ 41.200,00',
      urgentCount: 14,
      periodLabel: '14 sem contato há mais de 48h',
    },
    conversion: {
      value: '16.8%',
      change: '+3.1 p.p.',
      periodLabel: 'vs. taxa média anterior',
      criterion: '47 conversões confirmadas / 280 contatos abordados em campanhas',
    },
  };

  const chartData = [
    { period: 'Sem 1', revenue: 2400, customers: 8, conversion: 14.2 },
    { period: 'Sem 2', revenue: 3850, customers: 12, conversion: 15.8 },
    { period: 'Sem 3', revenue: 4100, customers: 13, conversion: 16.5 },
    { period: 'Sem 4', revenue: 4500, customers: 14, conversion: 17.4 },
  ];

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* CABEÇALHO DO DASHBOARD DE CRESCIMENTO */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        paddingBottom: 16,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#38bdf8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
            CRESCIMENTO COMERCIAL & CRM INTELIGENTE
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Inteligência de Vendas & Retenção
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Recuperação de clientes inativos, oportunidades de recompra e campanhas automáticas no WhatsApp.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Seletor de Período */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: 'rgba(255, 255, 255, 0.04)',
            padding: 3,
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            {(['today', '7d', '30d', 'month', 'custom'] as PeriodOption[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: period === p ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: period === p ? '#38bdf8' : '#94a3b8',
                  transition: 'all 0.15s ease',
                }}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setHasData(!hasData)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} color="#38bdf8" />
            <span>{hasData ? 'Ver Estado Inicial' : 'Ver Dados Exemplo'}</span>
          </button>
        </div>
      </div>

      {/* 4 CARDS PRIORITÁRIOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {/* CARD 1 — RECEITA RECUPERADA */}
        <div style={{
          background: '#0d121f',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 20,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Receita Recuperada
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 12 }}>
            {hasData ? metrics.revenue.value : 'R$ 0,00'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem' }}>
            <span style={{ color: '#10b981', fontWeight: 800, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowUpRight size={12} />
              {metrics.revenue.change}
            </span>
            <span style={{ color: '#94a3b8' }}>{metrics.revenue.periodLabel}</span>
          </div>
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', marginTop: 12, paddingTop: 10, fontSize: '0.72rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
            <span>Vendas atribuídas:</span>
            <strong style={{ color: '#f8fafc' }}>{metrics.revenue.attributedSales} pedidos</strong>
          </div>
        </div>

        {/* CARD 2 — CLIENTES REATIVADOS */}
        <div style={{
          background: '#0d121f',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Clientes Reativados
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 12 }}>
            {hasData ? metrics.reactivated.value : '0'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem' }}>
            <span style={{ color: '#10b981', fontWeight: 800, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowUpRight size={12} />
              {metrics.reactivated.change}
            </span>
            <span style={{ color: '#94a3b8' }}>{metrics.reactivated.periodLabel}</span>
          </div>
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', marginTop: 12, paddingTop: 10, fontSize: '0.72rem', color: '#94a3b8' }}>
            Critério: inativos há &gt;60 dias que voltaram
          </div>
        </div>

        {/* CARD 3 — OPORTUNIDADES ABERTAS */}
        <div style={{
          background: '#0d121f',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Oportunidades Abertas
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
              <Target size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 12 }}>
            {hasData ? metrics.opportunities.value : '0'}
          </div>
          <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#94a3b8' }}>
            Pipeline potencial: <strong style={{ color: '#a855f7' }}>{metrics.opportunities.pipelineValue}</strong>
          </div>
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', marginTop: 12, paddingTop: 10, fontSize: '0.72rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            <span>{metrics.opportunities.urgentCount} exigem acompanhamento urgente</span>
          </div>
        </div>

        {/* CARD 4 — CONVERSÃO COMERCIAL */}
        <div style={{
          background: '#0d121f',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Conversão Comercial
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(20, 184, 166, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14b8a6' }}>
              <Percent size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 12 }}>
            {hasData ? metrics.conversion.value : '0.0%'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem' }}>
            <span style={{ color: '#10b981', fontWeight: 800, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowUpRight size={12} />
              {metrics.conversion.change}
            </span>
            <span style={{ color: '#94a3b8' }}>{metrics.conversion.periodLabel}</span>
          </div>
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', marginTop: 12, paddingTop: 10, fontSize: '0.72rem', color: '#94a3b8' }}>
            Base: 47 vendas / 280 contatos abordados
          </div>
        </div>
      </div>

      {/* GRÁFICO: EVOLUÇÃO COMERCIAL */}
      <div style={{
        background: '#0d121f',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="#38bdf8" />
              Evolução Comercial
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
              Receita recuperada, clientes reativados e conversões ao longo do tempo.
            </p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', padding: 3, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => setMetricView('revenue')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: '0.74rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: metricView === 'revenue' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: metricView === 'revenue' ? '#38bdf8' : '#94a3b8',
              }}
            >
              Receita (R$)
            </button>
            <button
              onClick={() => setMetricView('customers')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: '0.74rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: metricView === 'customers' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: metricView === 'customers' ? '#38bdf8' : '#94a3b8',
              }}
            >
              Reativados
            </button>
            <button
              onClick={() => setMetricView('conversion')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: '0.74rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: metricView === 'conversion' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: metricView === 'conversion' ? '#38bdf8' : '#94a3b8',
              }}
            >
              Conversão (%)
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, height: 200, alignItems: 'flex-end', paddingTop: 24 }}>
          {chartData.map((item) => {
            const heightPercent =
              metricView === 'revenue'
                ? Math.round((item.revenue / maxRevenue) * 100)
                : metricView === 'customers'
                ? Math.round((item.customers / 15) * 100)
                : Math.round((item.conversion / 20) * 100);

            const displayValue =
              metricView === 'revenue'
                ? `R$ ${item.revenue.toLocaleString('pt-BR')}`
                : metricView === 'customers'
                ? `${item.customers} clientes`
                : `${item.conversion}%`;

            return (
              <div key={item.period} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 8 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>
                  {displayValue}
                </span>
                <div style={{ width: '100%', maxWidth: 70, height: '100%', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'flex-end' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
                      borderRadius: '8px 8px 0 0',
                      boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>
                  {item.period}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO DUPLA: OPORTUNIDADES URGENTES & INSIGHTS DE IA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* OPORTUNIDADES QUE EXIGEM ATENÇÃO */}
        <div style={{
          background: '#0d121f',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} color="#f59e0b" />
                Oportunidades que Exigem Atenção
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                Clientes com risco de perda ou orçamentos travados.
              </p>
            </div>
            <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
              14 pendentes
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                client: 'Rodrigo M. (iPhone 11 128GB)',
                trigger: 'Troca de tela feita há 340 dias',
                reason: 'Bateria provável < 80%. Ofertar troca de bateria ou Trade-in de seminovo.',
                action: 'WhatsApp: Ofertar Bateria',
              },
              {
                client: 'Amanda K. (O.S. #1042)',
                trigger: 'Orçamento enviado há 48h sem resposta',
                reason: 'Troca de display iPhone 13 (R$ 680,00 parado em bancada).',
                action: 'Relembrar Cliente',
              },
              {
                client: 'Gabriel P. (iPhone 14 Pro)',
                trigger: 'Comprou há 14 dias sem proteção',
                reason: 'Janela ótima para venda de capinha MagSafe e película 3D.',
                action: 'Enviar Cupom Acessórios',
              },
            ].map((op, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#f8fafc' }}>{op.client}</strong>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>{op.trigger}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{op.reason}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    onClick={() => alert(`Ação disparada para ${op.client}`)}
                    style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <MessageSquare size={12} />
                    {op.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INSIGHTS DE IA & CAMPANHAS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* INSIGHTS DE IA */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(13, 18, 31, 1) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c084fc', fontWeight: 800, fontSize: '0.86rem' }}>
                <Sparkles size={16} />
                <span>Insights de IA</span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 20 }}>
                IA Ativa
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              💡 <strong>Oportunidade de Recompra detectada:</strong> 34 clientes que compraram iPhone 12/13 nos últimos 18 meses atingiram o ciclo médio de troca da sua loja. Disparar a régua de Trade-in pode gerar até <strong style={{ color: '#10b981' }}>R$ 22.000 em faturamento</strong> este mês.
            </p>
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => onNavigate('after_sales')}
                style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  color: '#e9d5ff',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Abrir Régua Pós-Venda →
              </button>
            </div>
          </div>

          {/* DESEMPENHO DAS CAMPANHAS */}
          <div style={{
            background: '#0d121f',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.86rem', color: '#f8fafc' }}>Campanhas no WhatsApp</strong>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>3 ativas</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'Reativação de Bateria (Seminovos)', sent: 120, delivered: '96%', revenue: 'R$ 6.120' },
                { name: 'Upgrade para iPhone 15/16', sent: 85, delivered: '98%', revenue: 'R$ 7.410' },
                { name: 'Pós-Venda 30 Dias (NPS & Acessórios)', sent: 64, delivered: '95%', revenue: 'R$ 1.320' },
              ].map((c, i) => (
                <div key={i} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>{c.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>{c.sent} envios • {c.delivered} entregues</div>
                  </div>
                  <strong style={{ fontSize: '0.82rem', color: '#10b981' }}>{c.revenue}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
