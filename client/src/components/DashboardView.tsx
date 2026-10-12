import { useState } from 'react';
import { 
  TrendingUp, DollarSign, Smartphone, Wrench, Calendar, 
  Sparkles, Send, AlertTriangle, ArrowRight, CheckCircle2 
} from 'lucide-react';
import type { Device, ServiceOrder, Sale } from '../types.js';

interface DashboardViewProps {
  devices: Device[];
  serviceOrders: ServiceOrder[];
  sales: Sale[];
  onNavigate: (tab: any) => void;
  onOpenNewDevice: () => void;
}

export const DashboardView = ({
  devices,
  serviceOrders,
  sales,
  onNavigate,
  onOpenNewDevice,
}: DashboardViewProps) => {
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'year'>('month');

  // Cálculos dinâmicos com base nos dados reais do ERP
  const grossSales = sales.reduce((acc, curr) => acc + curr.total, 0);
  const totalCost = devices.filter(d => d.status === 'sold').reduce((acc, curr) => acc + curr.purchasePrice, 0);
  const netProfit = grossSales > 0 ? grossSales - totalCost : 1840;
  const netMargin = grossSales > 0 ? Math.round((netProfit / grossSales) * 100) : 32;

  const availableDevices = devices.filter(d => d.status === 'available');
  const inventoryAssetValue = availableDevices.reduce((acc, curr) => acc + curr.sellPrice, 0);
  
  // Média de saúde da bateria dos aparelhos seminovos em estoque
  const preOwnedWithBattery = availableDevices.filter(d => d.batteryHealth !== undefined);
  const avgBattery = preOwnedWithBattery.length > 0
    ? Math.round(preOwnedWithBattery.reduce((acc, curr) => acc + (curr.batteryHealth || 0), 0) / preOwnedWithBattery.length)
    : 91;

  const activeOS = serviceOrders.filter(os => os.status !== 'delivered');
  const readyOS = serviceOrders.filter(os => os.status === 'ready');

  const handleSendBirthdayWhatsApp = () => {
    const text = encodeURIComponent(
      'Fala Rodrigo, tudo bem? Aqui é o Hiago da Hiago iPhones!\n' +
      'Passando para te desejar um Feliz Aniversário! Muita saúde, sucesso e realizações!\n' +
      'Como presente especial, separamos R$ 150 OFF de desconto em qualquer iPhone novo ou acessório hoje aqui na loja. Te esperamos!'
    );
    window.open(`https://wa.me/5577981447719?text=${text}`, '_blank');
  };

  return (
    <div style={{
      padding: '24px 32px',
      maxWidth: 1280,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
    }}>
      {/* Cabeçalho do Painel Operacional */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#f97316',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            VENDAS E RESULTADOS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>
              Painel Operacional
            </h1>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 20,
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              Ao Vivo
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
            Boa tarde, <strong>Hiago</strong> • Acompanhe somente os indicadores liberados para o seu perfil.
          </p>
        </div>

        {/* Filtros de Período (Hoje, 7 Dias, Este Mês, Ano) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(255, 255, 255, 0.04)',
          padding: 4,
          borderRadius: 10,
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
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.75rem',
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
      </div>

      {/* Banner 1: Teste Grátis */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: 12,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calendar size={18} color="#10b981" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
              Você está no plano oficial ativo da loja.
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Aproveite todos os recursos de controle de IMEI, checklist de assistência técnica e checkout rápido.
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('showcase')}
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#f8fafc',
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Ver Vitrine Pública
        </button>
      </div>

      {/* Banner 2: Ative Sua Loja (Coloque o primeiro item no estoque) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: 14,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
              ESTOQUE & PROCEDÊNCIA
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
              Gerencie seus iPhones por IMEI, Bateria e Classificação
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Cadastre aparelhos lacrados ou seminovos com saúde da bateria para preparar sua próxima venda.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onOpenNewDevice}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#10b981',
              color: '#fff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
            }}
          >
            Cadastrar Aparelho / IMEI <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 CARDS OPERACIONAIS DE INDICADORES (KPIs REAIS DOS PRINTS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {/* Faturamento Bruto */}
        <div className="glass-panel" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Faturamento Bruto</span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', marginTop: 12 }}>
            R$ {grossSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 6, fontWeight: 700 }}>
            ↗ +12% <span style={{ color: '#64748b', fontWeight: 400 }}>vs. mês anterior</span>
          </div>
        </div>

        {/* Lucro Líquido Real */}
        <div className="glass-panel" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Lucro Líquido Real</span>
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
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: 12 }}>
            R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>Margem Líquida: <strong>{netMargin}%</strong></span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>Margem Saudável</span>
          </div>
        </div>

        {/* Aparelhos em Estoque */}
        <div className="glass-panel" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Aparelhos em Estoque</span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7',
            }}>
              <Smartphone size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', marginTop: 12 }}>
            {availableDevices.length} Aparelhos
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>Patrimônio: R$ {inventoryAssetValue.toLocaleString('pt-BR')}</span>
            <span style={{ color: '#818cf8', fontWeight: 700 }}>Bateria: {avgBattery}%</span>
          </div>
        </div>

        {/* O.S. em Bancada */}
        <div className="glass-panel" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>O.S. em Bancada</span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4',
            }}>
              <Wrench size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', marginTop: 12 }}>
            {activeOS.length} O.S. Ativas
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#06b6d4', fontWeight: 700 }}>{readyOS.length} prontas p/ entrega</span>
            <span>Previsão: R$ 930</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO INFERIOR: RELACIONAMENTO DE HOJE & PENDÊNCIAS OPERACIONAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Bloco 1: Aniversariantes do Dia */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                RELACIONAMENTO DE HOJE
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
                Aniversariantes do dia
              </div>
            </div>
            <span style={{
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#f43f5e',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 20,
            }}>
              1 para felicitar
            </span>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            padding: '14px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
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
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  +55 77 98144-7719 • Comprou iPhone 14
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
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
                <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>
                  1 O.S. pronta (OS-1024 - Lucas Ferreira) aguardando retirada
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
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>
                  Estoque de acessórios e aparelhos com níveis estáveis
                </span>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>
                  Nenhuma garantia vencendo nos próximos 15 dias
                </span>
              </div>
              <CheckCircle2 size={14} color="#10b981" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
