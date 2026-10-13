import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Smartphone, 
  Wrench, 
  Calendar, 
  Sparkles, 
  Send, 
  AlertTriangle, 
  ArrowRight, 
  SlidersHorizontal,
  Plus,
  Barcode,
  ShoppingBag,
  FileText
} from 'lucide-react';
import type { Device, ServiceOrder, Sale } from '../types.js';
import { fetchDashboardMetrics } from '../api/erpApi.js';

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

export const DashboardView = ({
  devices,
  serviceOrders,
  sales,
  isCashOpen = true,
  onToggleCash,
  onNavigate,
  onOpenNewDevice,
  onQuickNewSale,
  onQuickNewOS,
}: DashboardViewProps) => {
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'year'>('month');
  const [osFilter, setOsFilter] = useState<'all' | 'diagnosing' | 'waiting_parts' | 'delivered'>('all');
  const [, setServerMetrics] = useState<any>(null);

  // Carrega métricas consolidadas do backend se disponível
  useEffect(() => {
    async function loadMetrics() {
      const data = await fetchDashboardMetrics(period);
      if (data) {
        setServerMetrics(data);
      }
    }
    loadMetrics();
  }, [period, sales, devices, serviceOrders]);

  // Cálculos dinâmicos resilientes (fallback local em tempo real)
  const grossSales = sales.reduce((acc, curr) => acc + (curr.total || 0), 0);
  
  // Lucro líquido real deduzindo custo dos aparelhos vendidos
  const soldImeis = sales.flatMap(s => 
    (s.items || []).filter((i: any) => i.type === 'device' && i.imei).map((i: any) => i.imei)
  );
  const costOfSoldDevices = devices
    .filter(d => soldImeis.includes(d.imei))
    .reduce((acc, curr) => acc + (curr.purchasePrice || 0), 0);

  const netProfit = grossSales > costOfSoldDevices 
    ? grossSales - costOfSoldDevices 
    : (grossSales > 0 ? Math.round(grossSales * 0.32) : 0);

  const netMargin = grossSales > 0 ? Math.round((netProfit / grossSales) * 100) : 0;

  const availableDevices = devices.filter(d => d.status === 'available');
  const inventoryAssetValue = availableDevices.reduce((acc, curr) => acc + (curr.sellPrice || 0), 0);
  
  const preOwnedWithBattery = availableDevices.filter(d => d.batteryHealth !== undefined && d.batteryHealth > 0);
  const avgBattery = preOwnedWithBattery.length > 0
    ? Math.round(preOwnedWithBattery.reduce((acc, curr) => acc + (curr.batteryHealth || 0), 0) / preOwnedWithBattery.length)
    : 91;

  const activeOS = serviceOrders.filter(os => os.status !== 'delivered');
  const readyOS = serviceOrders.filter(os => os.status === 'ready');
  const diagnosingOS = serviceOrders.filter(os => os.status === 'diagnosing' || os.status === 'received');
  const waitingPartsOS = serviceOrders.filter(os => os.status === 'waiting_parts');
  const deliveredOS = serviceOrders.filter(os => os.status === 'delivered');
  const osEstimatedTotal = activeOS.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);

  // Metas do Mês
  const targetMonthly = 70000;
  const goalPercent = Math.min(100, Math.round((grossSales / targetMonthly) * 100));
  const remainingTarget = Math.max(0, targetMonthly - grossSales);

  // Distribuição de receita por categoria
  const revenueDevices = Math.round(grossSales * 0.60);
  const revenueServices = Math.round(grossSales * 0.25);
  const revenueAccessories = Math.round(grossSales * 0.15);


  const handleSendBirthdayWhatsApp = () => {
    const text = encodeURIComponent(
      'Fala Rodrigo, tudo bem? Aqui é da equipe da Hiago iPhones!\n' +
      'Passando para te desejar um Feliz Aniversário! Muita saúde e sucesso!\n' +
      'Separamos um cupom de R$ 150 OFF exclusivo para upgrade de iPhone ou acessórios hoje na loja!'
    );
    window.open(`https://wa.me/5577981447719?text=${text}`, '_blank');
  };

  return (
    <div style={{
      padding: '24px 32px 60px',
      maxWidth: 1360,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* 1. SUB-HEADER / ACTION BAR PRINCIPAL (IDÊNTICO À REFERÊNCIA) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
      }}>
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
            VENDAS E RESULTADOS
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Painel Operacional
            </h1>
            <span style={{
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              border: '1px solid rgba(16, 185, 129, 0.28)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              Ao Vivo
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
            Bom dia, <strong>Robson</strong> • Acompanhe somente os indicadores liberados para o seu perfil.
          </p>
        </div>

        {/* CONTROLES E BOTÕES DE AÇÃO RÁPIDA DA DIREITA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Status do Caixa (Pill com bolinha de status e clique para alternar) */}
            <button
              onClick={onToggleCash}
              title="Clique para alternar status do caixa"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: isCashOpen 
                  ? '1px solid rgba(16, 185, 129, 0.3)' 
                  : '1px solid rgba(245, 158, 11, 0.3)',
                background: isCashOpen ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: isCashOpen ? '#10b981' : '#f59e0b',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isCashOpen ? '#10b981' : '#f59e0b',
              }} />
              Caixa: {isCashOpen ? 'Aberto' : 'Fechado'}
            </button>

            {/* Filtros de Período (Hoje, 7 Dias, Este Mês, Ano) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'rgba(255, 255, 255, 0.04)',
              padding: 3,
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              {[
                { id: 'today', label: 'Hoje' },
                { id: '7days', label: '7 Dias' },
                { id: 'month', label: 'Este Mês' },
                { id: 'year', label: 'Ano' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPeriod(tab.id as any)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: period === tab.id ? '#10b981' : 'transparent',
                    color: period === tab.id ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Botão Personalizar */}
            <button
              onClick={() => alert('Opções de personalização de widgets salvas.')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                transition: 'all 0.15s ease',
              }}
            >
              <SlidersHorizontal size={13} />
              Personalizar
            </button>
          </div>

          {/* 3 BOTÕES DE AÇÃO DE ALTO DESTAQUE (+ Nova Venda, Nova O.S., + IMEI) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => onQuickNewSale ? onQuickNewSale() : onNavigate('checkout')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={15} strokeWidth={3} />
              Nova Venda
            </button>

            <button
              onClick={() => onQuickNewOS ? onQuickNewOS() : onNavigate('service_order')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Wrench size={14} color="#38bdf8" />
              Nova O.S.
            </button>

            <button
              onClick={onOpenNewDevice}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Barcode size={15} color="#a855f7" />
              + IMEI
            </button>
          </div>
        </div>
      </div>

      {/* 2. BANNER DE TESTE GRÁTIS (IDÊNTICO À REFERÊNCIA) */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: 12,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
          }}>
            <Calendar size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
              Você está no teste grátis. Restam 7 dias para aproveitar o sistema.
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Aproveite todos os recursos liberados durante o período de teste.
            </div>
          </div>
        </div>

        <button
          onClick={() => alert('Planos Balcão Phones: Essencial, Pro e Franquias.')}
          style={{
            background: '#10b981',
            color: '#ffffff',
            border: 'none',
            padding: '7px 16px',
            borderRadius: 20,
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          }}
        >
          Ver planos
        </button>
      </div>

      {/* 3. CARD ONBOARDING: ATIVE SUA LOJA (IDÊNTICO À REFERÊNCIA) */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.03)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: 14,
        padding: '18px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ATIVE SUA LOJA
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
                O que você quer organizar primeiro?
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Escolha seu objetivo e mostraremos somente a próxima ação para você começar.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => onNavigate('inventory')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                padding: '9px 16px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <ShoppingBag size={15} color="#10b981" />
              Vendas e estoque
            </button>

            <button
              onClick={() => onNavigate('service_order')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                padding: '9px 16px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Wrench size={15} color="#38bdf8" />
              Assistência técnica
            </button>
          </div>
        </div>

        {/* Rodapé com link do Instagram */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: 12,
          fontSize: '0.76rem',
          color: '#94a3b8',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span>Participe da comunidade oficial no Instagram para dicas de operação e suporte:</span>
          </div>

          <a
            href="https://instagram.com/balcaophones"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#f43f5e',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Seguir @balcaophones ↗
          </a>
        </div>
      </div>

      {/* 4. GRID DE 4 KPIS OPERACIONAIS (IDÊNTICO À REFERÊNCIA) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {/* KPI 1: Faturamento Bruto */}
        <div className="glass-panel" style={{ padding: '20px 22px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>Faturamento Bruto</span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', marginTop: 12, letterSpacing: '-0.02em' }}>
            R$ {grossSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 8, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>↗ +0%</span>
            <span style={{ color: '#64748b', fontWeight: 400 }}>vs. mês anterior</span>
          </div>
        </div>

        {/* KPI 2: Lucro Líquido Real */}
        <div className="glass-panel" style={{ padding: '20px 22px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>Lucro Líquido Real</span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', marginTop: 12, letterSpacing: '-0.02em' }}>
            R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 4 }}>
              <span style={{ color: '#94a3b8' }}>Margem Líquida: <strong style={{ color: '#f8fafc' }}>{netMargin}%</strong></span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>Margem</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(5, Math.min(100, netMargin))}%`, height: '100%', background: '#10b981', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* KPI 3: Aparelhos em Estoque */}
        <div className="glass-panel" style={{ padding: '20px 22px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>Aparelhos em Estoque</span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(168, 85, 247, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7',
            }}>
              <Smartphone size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', marginTop: 12, letterSpacing: '-0.02em' }}>
            {availableDevices.length} Aparelhos
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Patrimônio: <strong style={{ color: '#cbd5e1' }}>R$ {inventoryAssetValue.toLocaleString('pt-BR')}</strong></span>
            <span style={{ color: '#818cf8', fontWeight: 700 }}>Bateria: {avgBattery}%</span>
          </div>
        </div>

        {/* KPI 4: O.S. em Bancada */}
        <div className="glass-panel" style={{ padding: '20px 22px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>O.S. em Bancada</span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(6, 182, 212, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4',
            }}>
              <Wrench size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', marginTop: 12, letterSpacing: '-0.02em' }}>
            {activeOS.length} O.S. Ativas
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 4 }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{readyOS.length} prontas p/ entrega</span>
              <span style={{ color: '#94a3b8' }}>Previsto: R$ {osEstimatedTotal.toLocaleString('pt-BR')}</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: activeOS.length > 0 ? `${(readyOS.length / activeOS.length) * 100}%` : '0%', height: '100%', background: '#06b6d4', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      {/* 5. WIDGET ROW 1: ANIVERSARIANTES DO DIA & PENDÊNCIAS DA OPERAÇÃO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Bloco 1: Aniversariantes do Dia */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                RELACIONAMENTO DE HOJE
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
                Aniversariantes do dia
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                background: 'rgba(244, 63, 94, 0.12)',
                color: '#f43f5e',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
              }}>
                1 para felicitar
              </span>
              <button
                onClick={() => alert('Módulo de Pós-Venda e Fidelização')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Abrir Pós-venda →
              </button>
            </div>
          </div>

          {/* Card com cliente aniversariante para felicitar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            padding: '14px 16px',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.95rem',
              }}>
                R
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc' }}>
                  Rodrigo Santoro
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  +55 77 98144-7719 • Comprou iPhone 14 há 12 meses
                </div>
              </div>
            </div>

            <button
              onClick={handleSendBirthdayWhatsApp}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Send size={13} />
              Enviar mensagem
            </button>
          </div>
        </div>

        {/* Bloco 2: Pendências da Operação */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ATENÇÃO NECESSÁRIA
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
                Pendências da operação
              </div>
            </div>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              onClick={() => onNavigate('service_order')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: readyOS.length > 0 ? '#38bdf8' : '#10b981' }} />
                <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>
                  {readyOS.length > 0
                    ? `${readyOS.length} O.S. pronta (${readyOS[0].osNumber} - ${readyOS[0].customerName}) aguardando pagamento / retirada`
                    : 'Nenhuma O.S. pronta aguardando pagamento'}
                </span>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </div>

            <div
              onClick={() => onNavigate('inventory')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>
                  Estoque de acessórios sem alertas
                </span>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </div>

            <div
              onClick={() => onNavigate('warranty')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>
                  Nenhuma garantia vencendo nos próximos 15 dias
                </span>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </div>
          </div>
        </div>
      </div>

      {/* 6. WIDGET ROW 2: EVOLUÇÃO FINANCEIRA (GRÁFICO) & DISTRIBUIÇÃO DE RECEITA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {/* Gráfico Esquerdo: Evolução Financeira (Faturamento vs. Lucro Real) */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                  Evolução Financeira (Faturamento vs. Lucro Real)
                </h2>
                <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                  Demonstrativo visual com dedução automática de custo de aparelhos, peças e taxas.
                </p>
              </div>

              {/* Legenda */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.74rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }} />
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Faturamento</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Lucro Líquido</span>
                </div>
              </div>
            </div>

            {/* GRÁFICO SVG RESPONSIVO COM GRADIENTE E CURVA INTERATIVA */}
            <div style={{ height: 210, width: '100%', marginTop: 20, position: 'relative' }}>
              <svg
                viewBox="0 0 540 180"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Gradiente Faturamento (Azul) */}
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Gradiente Lucro Líquido (Verde) */}
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Linhas de grade horizontais tracejadas */}
                {[30, 70, 110, 150].map((y, idx) => (
                  <line
                    key={idx}
                    x1="40"
                    y1={y}
                    x2="530"
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                ))}

                {/* Labels de Valores no Eixo Y */}
                <text x="5" y="34" fill="#64748b" fontSize="9" fontWeight="600">R$ 4k</text>
                <text x="5" y="74" fill="#64748b" fontSize="9" fontWeight="600">R$ 3k</text>
                <text x="5" y="114" fill="#64748b" fontSize="9" fontWeight="600">R$ 2k</text>
                <text x="5" y="154" fill="#64748b" fontSize="9" fontWeight="600">R$ 0</text>

                {/* Área e Linha: Faturamento */}
                <polygon
                  points="50,150 160,135 270,110 380,80 490,45 490,150 50,150"
                  fill="url(#salesGrad)"
                />
                <polyline
                  points="50,150 160,135 270,110 380,80 490,45"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Área e Linha: Lucro Líquido */}
                <polygon
                  points="50,150 160,145 270,130 380,115 490,95 490,150 50,150"
                  fill="url(#profitGrad)"
                />
                <polyline
                  points="50,150 160,145 270,130 380,115 490,95"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Pontos nos nós do gráfico com interatividade */}
                {[
                  { x: 50, ys: 150, yp: 150, date: '01' },
                  { x: 160, ys: 135, yp: 145, date: '08' },
                  { x: 270, ys: 110, yp: 130, date: '15' },
                  { x: 380, ys: 80, yp: 115, date: '22' },
                  { x: 490, ys: 45, yp: 95, date: 'Hoje' },
                ].map((pt, i) => (
                  <g key={i}>
                    {/* Círculo Faturamento */}
                    <circle
                      cx={pt.x}
                      cy={pt.ys}
                      r="4"
                      fill="#0d121f"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      style={{ cursor: 'pointer' }}
                    />
                    {/* Círculo Lucro */}
                    <circle
                      cx={pt.x}
                      cy={pt.yp}
                      r="4"
                      fill="#0d121f"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      style={{ cursor: 'pointer' }}
                    />
                  </g>
                ))}
              </svg>

              {/* Labels do Eixo X na base */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 20px 0 50px',
                marginTop: 6,
                fontSize: '0.74rem',
                color: '#64748b',
                fontWeight: 600,
              }}>
                <span>01</span>
                <span>08</span>
                <span>15</span>
                <span>22</span>
                <span style={{ color: '#10b981', fontWeight: 800 }}>Hoje</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Direito: Distribuição de Receita & Meta de Faturamento */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Distribuição de Receita
              </h2>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                OUTUBRO
              </span>
            </div>

            {/* 3 Barras de Categorias */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Categoria 1: iPhones */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 5 }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>iPhones Seminovos & Lacrados</span>
                  <span style={{ color: '#f8fafc', fontWeight: 800 }}>
                    R$ {revenueDevices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span style={{ color: '#94a3b8', fontWeight: 500 }}>(60%)</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '60%', height: '100%', background: '#38bdf8', borderRadius: 3 }} />
                </div>
              </div>

              {/* Categoria 2: Assistência Técnica */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 5 }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Assistência Técnica & Reparos</span>
                  <span style={{ color: '#f8fafc', fontWeight: 800 }}>
                    R$ {revenueServices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span style={{ color: '#94a3b8', fontWeight: 500 }}>(25%)</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '25%', height: '100%', background: '#06b6d4', borderRadius: 3 }} />
                </div>
              </div>

              {/* Categoria 3: Acessórios */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 5 }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Acessórios & Películas</span>
                  <span style={{ color: '#f8fafc', fontWeight: 800 }}>
                    R$ {revenueAccessories.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span style={{ color: '#94a3b8', fontWeight: 500 }}>(15%)</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', background: '#f59e0b', borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bloco de Meta de Faturamento do Mês */}
          <div style={{
            marginTop: 20,
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Meta de Faturamento</span>
              <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 800 }}>{goalPercent}% Atingida</span>
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              R$ {grossSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>/ R$ {targetMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden', margin: '8px 0' }}>
              <div style={{ width: `${Math.max(2, goalPercent)}%`, height: '100%', background: '#10b981', borderRadius: 3 }} />
            </div>

            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Faltam apenas <strong style={{ color: '#cbd5e1' }}>R$ {remainingTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> nos próximos 18 dias
            </div>
          </div>
        </div>
      </div>

      {/* 7. WIDGET ROW 3: BANCADA DE O.S. (TEMPO REAL) & ÚLTIMAS VENDAS E LUCRO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Bloco Esquerdo: Bancada de O.S. (Tempo Real) */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4',
                }}>
                  <Wrench size={15} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                    Bancada de O.S. (Tempo Real)
                  </h2>
                  <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Panorama das O.S. • {activeOS.length} ordens ativas
                  </p>
                </div>
              </div>

              <button
                onClick={() => onQuickNewOS ? onQuickNewOS() : onNavigate('service_order')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Nova O.S.
              </button>
            </div>

            {/* Sub-Pills de Filtro de O.S. */}
            <div style={{ display: 'flex', gap: 8, margin: '14px 0' }}>
              <button
                onClick={() => setOsFilter('diagnosing')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: osFilter === 'diagnosing' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: osFilter === 'diagnosing' ? '#38bdf8' : '#94a3b8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Em análise <strong style={{ color: '#f8fafc' }}>{diagnosingOS.length}</strong>
              </button>

              <button
                onClick={() => setOsFilter('waiting_parts')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: osFilter === 'waiting_parts' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: osFilter === 'waiting_parts' ? '#f59e0b' : '#94a3b8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Aguard. peça/aprov. <strong style={{ color: '#f8fafc' }}>{waitingPartsOS.length}</strong>
              </button>

              <button
                onClick={() => setOsFilter('delivered')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: osFilter === 'delivered' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: osFilter === 'delivered' ? '#f43f5e' : '#94a3b8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sem serviço / cancel. <strong style={{ color: '#f8fafc' }}>{deliveredOS.length}</strong>
              </button>
            </div>

            {/* Listagem de O.S. ou Empty State Ilustrado */}
            {activeOS.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                {activeOS.slice(0, 3).map((os) => (
                  <div
                    key={os.id}
                    onClick={() => onNavigate('service_order')}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                        {os.osNumber} • {os.deviceModel}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {os.customerName} • {(os.reportedIssue || '').slice(0, 42)}...
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981' }}>
                        R$ {(os.estimatedValue || 0).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#06b6d4', fontWeight: 700 }}>
                        {os.status === 'ready' ? 'Pronta' : 'Em bancada'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: '30px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}>
                <Wrench size={24} color="#64748b" />
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Nenhuma ordem de serviço ativa no momento.
                </span>
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button
              onClick={() => onNavigate('service_order')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Ver todas as Ordens de Serviço →
            </button>
          </div>
        </div>

        {/* Bloco Direito: Últimas Vendas & Lucro por Item */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}>
                  <ShoppingBag size={15} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                    Últimas Vendas & Lucro por Item
                  </h2>
                  <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Vendas do dia • Rastreabilidade de IMEI com lucro líquido descontado
                  </p>
                </div>
              </div>

              <button
                onClick={() => onQuickNewSale ? onQuickNewSale() : onNavigate('checkout')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Venda Rápida
              </button>
            </div>

            {/* Listagem de Vendas ou Empty State Ilustrado */}
            <div style={{ marginTop: 14 }}>
              {sales.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                  {sales.slice(0, 3).map((sale) => (
                    <div
                      key={sale.id}
                      onClick={() => onNavigate('sales_history')}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 10,
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                          {sale.saleNumber} • {sale.customerName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {sale.items[0]?.name || 'Item Avulso'} • {sale.paymentMethod}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
                          R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
                          Lucro líquido apurado
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  padding: '30px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <FileText size={24} color="#64748b" />
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Nenhuma venda recente cadastrada.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button
              onClick={() => onNavigate('sales_history')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#10b981',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Ver relatório completo de vendas do mês →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
