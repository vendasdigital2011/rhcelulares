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
  ChevronDown,
  CircleDot,
  CheckCircle2,
  Store,
  Plus,
  PhoneIncoming,
  Package,
  Cpu,
  Truck,
  Cog,
  TrendingUp,
  User,
  BarChart3,
  Percent,
  Clock,
  Sliders,
  CreditCard,
  LifeBuoy,
  Database,
} from 'lucide-react';

export type ERPNavTab =
  | 'dashboard'
  // Vendas
  | 'checkout'
  | 'cash'
  | 'sales_history'
  | 'customers'
  | 'after_sales'
  // Estoque e vitrine
  | 'inventory'
  | 'phone_purchases'
  | 'products'
  | 'parts'
  | 'suppliers'
  | 'showcase'
  // Etiquetas
  | 'labels'
  // Assistência técnica
  | 'service_order'
  | 'services'
  | 'warranty'
  // Gestão
  | 'financial'
  | 'profile'
  | 'reports'
  | 'commissions'
  | 'timecard'
  | 'users'
  // Sistema e Suporte
  | 'subscription'
  | 'support'
  | 'migration';

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

interface NavItem {
  id: ERPNavTab;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

interface NavCategory {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  children: NavItem[];
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

  // Controle de expansão de cada categoria Pai (abertas por padrão)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    vendas: true,
    estoque: true,
    assistencia: true,
    gestao: false,
  });

  const toggleCategory = (key: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Estrutura Completa de Menus: Pais e Filhos
  const categories: NavCategory[] = [
    {
      key: 'vendas',
      label: 'Vendas',
      icon: ShoppingCart,
      children: [
        { id: 'checkout', label: 'PDV - Nova venda', icon: ShoppingCart },
        { id: 'cash', label: 'Fluxo de Caixa', icon: Wallet },
        { id: 'sales_history', label: 'Caixa e vendas', icon: Receipt },
        { id: 'customers', label: 'Clientes', icon: Users },
        { id: 'after_sales', label: 'Pós-venda', icon: Sparkles },
      ],
    },
    {
      key: 'estoque',
      label: 'Estoque e vitrine',
      icon: Smartphone,
      children: [
        { id: 'inventory', label: 'Estoque Celulares', icon: Smartphone },
        { id: 'phone_purchases', label: 'Compra de Telefone', icon: PhoneIncoming },
        { id: 'products', label: 'Produtos', icon: Package },
        { id: 'parts', label: 'Peças', icon: Cpu },
        { id: 'suppliers', label: 'Fornecedores', icon: Truck },
        { id: 'showcase', label: 'Vitrine', icon: Globe },
      ],
    },
    {
      key: 'assistencia',
      label: 'Assistência técnica',
      icon: Wrench,
      children: [
        { id: 'service_order', label: 'Ordens de serviço', icon: Wrench },
        { id: 'services', label: 'Serviços', icon: Cog },
        { id: 'warranty', label: 'Garantias', icon: ShieldCheck },
      ],
    },
    {
      key: 'gestao',
      label: 'Gestão',
      icon: Sliders,
      children: [
        { id: 'financial', label: 'Financeiro', icon: TrendingUp },
        { id: 'profile', label: 'Meu Perfil', icon: User },
        { id: 'reports', label: 'Relatórios', icon: BarChart3 },
        { id: 'commissions', label: 'Comissões', icon: Percent },
        { id: 'timecard', label: 'Ponto', icon: Clock },
        { id: 'users', label: 'Usuários', icon: Users },
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

      {/* NAVEGAÇÃO VERTICAL EM ÁRVORE (PAI E FILHOS) */}
      <nav style={{ flex: 1, padding: collapsed ? '10px 8px' : '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* ITEM RAIZ: PAINEL OPERACIONAL / DASHBOARD */}
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: collapsed ? '10px 0' : '9px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'dashboard' ? 'rgba(249, 115, 22, 0.14)' : 'transparent',
              color: activeTab === 'dashboard' ? '#f97316' : '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'dashboard' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              borderLeft: activeTab === 'dashboard' ? '3px solid #f97316' : '3px solid transparent',
            }}
            title="Dashboard"
          >
            <LayoutDashboard size={16} color={activeTab === 'dashboard' ? '#f97316' : '#94a3b8'} />
            {!collapsed && <span>Dashboard</span>}
          </button>
        </div>

        {/* 1. CATEGORIA PAI: VENDAS */}
        {categories.map((cat, idx) => {
          const ParentIcon = cat.icon;
          const isCategoryOpen = !!openCategories[cat.key];
          const hasActiveChild = cat.children.some(child => child.id === activeTab);

          return (
            <React.Fragment key={cat.key}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* BOTÃO DA CATEGORIA PAI */}
                <button
                  onClick={() => {
                    if (collapsed) {
                      setCollapsed(false);
                      setOpenCategories(prev => ({ ...prev, [cat.key]: true }));
                    } else {
                      toggleCategory(cat.key);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    width: '100%',
                    padding: collapsed ? '10px 0' : '9px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: hasActiveChild && !isCategoryOpen ? 'rgba(249, 115, 22, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    color: hasActiveChild ? '#f8fafc' : '#94a3b8',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title={cat.label}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ParentIcon size={16} color={hasActiveChild ? '#f97316' : '#64748b'} />
                    {!collapsed && (
                      <span style={{ color: hasActiveChild ? '#f8fafc' : '#cbd5e1' }}>
                        {cat.label}
                      </span>
                    )}
                  </div>

                  {!collapsed && (
                    <div
                      style={{
                        transform: isCategoryOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s ease',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <ChevronDown size={14} />
                    </div>
                  )}
                </button>

                {/* LISTA DE FILHOS (SUBMENU COM LINHA GUIA VERTICAL) */}
                {(!collapsed && isCategoryOpen) && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      marginLeft: 14,
                      paddingLeft: 10,
                      borderLeft: '1.5px solid rgba(255, 255, 255, 0.08)',
                      marginTop: 2,
                      marginBottom: 4,
                    }}
                  >
                    {cat.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = activeTab === child.id;

                      return (
                        <button
                          key={child.id}
                          onClick={() => setActiveTab(child.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            width: '100%',
                            padding: '7px 10px',
                            borderRadius: 6,
                            border: 'none',
                            background: isChildActive ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                            color: isChildActive ? '#f97316' : '#94a3b8',
                            fontSize: '0.78rem',
                            fontWeight: isChildActive ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'left',
                            position: 'relative',
                          }}
                          title={child.label}
                        >
                          <ChildIcon size={14} color={isChildActive ? '#f97316' : '#64748b'} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {child.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ITEM DIRETO: ETIQUETAS (fica entre Estoque e Assistência no Balcão Phones) */}
              {idx === 1 && (
                <div>
                  <button
                    onClick={() => setActiveTab('labels')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: collapsed ? '10px 0' : '9px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 8,
                      border: 'none',
                      background: activeTab === 'labels' ? 'rgba(249, 115, 22, 0.14)' : 'transparent',
                      color: activeTab === 'labels' ? '#f97316' : '#94a3b8',
                      fontSize: '0.82rem',
                      fontWeight: activeTab === 'labels' ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      borderLeft: activeTab === 'labels' ? '3px solid #f97316' : '3px solid transparent',
                    }}
                    title="Etiquetas"
                  >
                    <Barcode size={16} color={activeTab === 'labels' ? '#f97316' : '#64748b'} />
                    {!collapsed && <span>Etiquetas</span>}
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* ITENS DE SISTEMA & SUPORTE */}
        <div
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <button
            onClick={() => setActiveTab('subscription')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: collapsed ? '9px 0' : '8px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 7,
              border: 'none',
              background: activeTab === 'subscription' ? 'rgba(249, 115, 22, 0.14)' : 'transparent',
              color: activeTab === 'subscription' ? '#f97316' : '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'subscription' ? 700 : 500,
              cursor: 'pointer',
              borderLeft: activeTab === 'subscription' ? '3px solid #f97316' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}
            title="Assinatura"
          >
            <CreditCard size={15} color={activeTab === 'subscription' ? '#f97316' : '#64748b'} />
            {!collapsed && <span>Assinatura</span>}
          </button>

          <button
            onClick={() => setActiveTab('support')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: collapsed ? '9px 0' : '8px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 7,
              border: 'none',
              background: activeTab === 'support' ? 'rgba(249, 115, 22, 0.14)' : 'transparent',
              color: activeTab === 'support' ? '#f97316' : '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'support' ? 700 : 500,
              cursor: 'pointer',
              borderLeft: activeTab === 'support' ? '3px solid #f97316' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}
            title="Suporte"
          >
            <LifeBuoy size={15} color={activeTab === 'support' ? '#f97316' : '#64748b'} />
            {!collapsed && <span>Suporte</span>}
          </button>

          <button
            onClick={() => setActiveTab('migration')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: collapsed ? '9px 0' : '8px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 7,
              border: 'none',
              background: activeTab === 'migration' ? 'rgba(249, 115, 22, 0.14)' : 'transparent',
              color: activeTab === 'migration' ? '#f97316' : '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'migration' ? 700 : 500,
              cursor: 'pointer',
              borderLeft: activeTab === 'migration' ? '3px solid #f97316' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}
            title="Migração de Dados"
          >
            <Database size={15} color={activeTab === 'migration' ? '#f97316' : '#64748b'} />
            {!collapsed && <span>Migração de Dados</span>}
          </button>
        </div>
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
