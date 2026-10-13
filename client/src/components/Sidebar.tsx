import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Smartphone,
  Wrench,
  Wallet,
  Globe,
  Barcode,
  ShieldCheck,
  Receipt,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  CheckCircle2,
  Store,
  Plus,
} from 'lucide-react';

export type ERPNavTab =
  | 'dashboard'
  | 'checkout'
  | 'sales_history'
  | 'cash'
  | 'customers'
  | 'after_sales'
  | 'inventory'
  | 'labels'
  | 'service_order'
  | 'showcase'
  | 'warranty';

interface SidebarProps {
  activeTab: ERPNavTab;
  setActiveTab: (tab: ERPNavTab) => void;
  isCashOpen: boolean;
  cashBalance: number;
  onToggleCash: () => void;
  onQuickNewSale: () => void;
  onQuickNewOS: () => void;
  onQuickNewDevice: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCashOpen,
  cashBalance,
  onToggleCash,
  onQuickNewSale,
  onQuickNewOS,
  onQuickNewDevice,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const navGroups = [
    {
      group: 'OPERAÇÃO',
      items: [
        { id: 'dashboard' as ERPNavTab, label: 'Painel Operacional', icon: LayoutDashboard },
      ],
    },
    {
      group: 'VENDAS',
      items: [
        { id: 'checkout' as ERPNavTab, label: 'PDV - Nova Venda', icon: ShoppingCart },
        { id: 'sales_history' as ERPNavTab, label: 'Caixa e Vendas', icon: Receipt },
        { id: 'cash' as ERPNavTab, label: 'Fluxo de Caixa', icon: Wallet },
        { id: 'customers' as ERPNavTab, label: 'Clientes', icon: Users },
        { id: 'after_sales' as ERPNavTab, label: 'Pós-Venda', icon: Sparkles },
      ],
    },
    {
      group: 'ESTOQUE & VITRINE',
      items: [
        { id: 'inventory' as ERPNavTab, label: 'Aparelhos (IMEI)', icon: Smartphone },
        { id: 'labels' as ERPNavTab, label: 'Etiquetas & Barcode', icon: Barcode },
        { id: 'showcase' as ERPNavTab, label: 'Vitrine Online', icon: Globe },
      ],
    },
    {
      group: 'ASSISTÊNCIA TÉCNICA',
      items: [
        { id: 'service_order' as ERPNavTab, label: 'Ordens de Serviço (O.S.)', icon: Wrench },
      ],
    },
    {
      group: 'JURÍDICO & DOCUMENTOS',
      items: [
        { id: 'warranty' as ERPNavTab, label: 'Termos de Garantia', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: collapsed ? 80 : 265,
        minWidth: collapsed ? 80 : 265,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#090d16',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* CABEÇALHO DA LOJA */}
      <div
        style={{
          padding: collapsed ? '18px 12px' : '18px 18px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
              flexShrink: 0,
            }}
          >
            H
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#f8fafc',
                  letterSpacing: '-0.3px',
                  whiteSpace: 'nowrap',
                }}
              >
                Hiago iPhones
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                <Store size={10} color="#f97316" />
                <span>Balcão Phones • Centro</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: 6,
            color: '#94a3b8',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={collapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* BOTÕES DE AÇÃO RÁPIDA (BALCÃO) */}
      <div style={{ padding: collapsed ? '12px 10px' : '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={onQuickNewSale}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#ffffff',
            border: 'none',
            padding: collapsed ? '10px 0' : '9px 12px',
            borderRadius: 8,
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            boxShadow: '0 3px 10px rgba(249, 115, 22, 0.3)',
            transition: 'transform 0.15s ease',
          }}
          title="Nova Venda (PDV)"
        >
          <ShoppingCart size={15} />
          {!collapsed && <span>+ Nova Venda</span>}
        </button>

        {!collapsed && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              onClick={onQuickNewOS}
              style={{
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '7px 8px',
                borderRadius: 7,
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
              title="Nova Ordem de Serviço"
            >
              <Wrench size={12} />
              <span>+ O.S.</span>
            </button>

            <button
              onClick={onQuickNewDevice}
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '7px 8px',
                borderRadius: 7,
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
              title="Cadastrar Aparelho / IMEI"
            >
              <Plus size={12} />
              <span>+ IMEI</span>
            </button>
          </div>
        )}

        {/* STATUS DO CAIXA */}
        <div
          onClick={onToggleCash}
          style={{
            background: isCashOpen ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${isCashOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            borderRadius: 7,
            padding: collapsed ? '8px 0' : '7px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            cursor: 'pointer',
            marginTop: 2,
          }}
          title={isCashOpen ? 'Caixa Aberto (clique para alternar)' : 'Caixa Fechado (clique para abrir)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CircleDot size={10} color={isCashOpen ? '#10b981' : '#ef4444'} />
            {!collapsed && (
              <span style={{ fontSize: '0.72rem', color: isCashOpen ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                {isCashOpen ? 'Caixa Aberto' : 'Caixa Fechado'}
              </span>
            )}
          </div>
          {!collapsed && isCashOpen && (
            <span style={{ fontSize: '0.72rem', color: '#f8fafc', fontWeight: 800 }}>
              R$ {cashBalance.toLocaleString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* NAVEGAÇÃO VERTICAL POR GRUPOS */}
      <nav style={{ flex: 1, padding: collapsed ? '10px 8px' : '10px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {navGroups.map((grp) => (
          <div key={grp.group}>
            {!collapsed && (
              <div
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.6px',
                  padding: '0 8px 6px',
                  textTransform: 'uppercase',
                }}
              >
                {grp.group}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: collapsed ? '10px 0' : '9px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 8,
                      border: 'none',
                      background: isActive ? 'rgba(249, 115, 22, 0.14)' : 'transparent',
                      color: isActive ? '#f97316' : '#94a3b8',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      borderLeft: isActive ? '3px solid #f97316' : '3px solid transparent',
                    }}
                    title={item.label}
                  >
                    <Icon size={16} color={isActive ? '#f97316' : '#94a3b8'} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* RODAPÉ DO MENU COM USUÁRIO E VERSÃO */}
      <div
        style={{
          padding: collapsed ? '12px 8px' : '12px 14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#f8fafc',
            flexShrink: 0,
          }}
        >
          HM
        </div>

        {!collapsed && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>
              Hiago Macedo
            </div>
            <div style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={10} />
              <span>Dono • Licença Ativa</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
