import React, { useState, useMemo } from 'react';
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
  PhoneIncoming,
  Package,
  Truck,
  Cog,
  BarChart3,
  Sliders,
  LifeBuoy,
  Database,
  Target,
  Search,
  CheckCircle2,
  Palette,
} from 'lucide-react';

export type ERPNavTab =
  | 'dashboard'
  // Operação
  | 'checkout'
  | 'sales_history'
  | 'cash'
  | 'customers'
  | 'after_sales'
  | 'crm_customers'
  // Estoque
  | 'stock_dashboard'
  | 'inventory'
  | 'phone_purchases'
  | 'products'
  | 'parts'
  | 'suppliers'
  | 'showcase'
  | 'labels'
  // Assistência
  | 'assistance_dashboard'
  | 'service_order'
  | 'services'
  | 'warranty'
  // Administração
  | 'financial_intelligence'
  | 'financial'
  | 'subscription'
  | 'support'
  | 'migration'
  // Rodapé
  | 'profile'
  | 'reports'
  | 'commissions'
  | 'timecard'
  | 'users'
  | 'settings';

interface SidebarProps {
  activeTab: ERPNavTab;
  setActiveTab: (tab: ERPNavTab) => void;
  isCashOpen?: boolean;
  cashBalance?: number;
  onToggleCash?: () => void;
  onQuickNewSale?: () => void;
  onQuickNewOS?: () => void;
  onQuickNewDevice?: () => void;
}

interface NavItem {
  id: ERPNavTab;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}

interface NavGroup {
  key: string;
  label: string;
  children: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  // 5 Grupos Principais conforme especificação Balcão OS
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    visao_geral: true,
    operacao: true,
    estoque: true,
    assistencia: true,
    administracao: false,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const navGroups: NavGroup[] = [
    {
      key: 'visao_geral',
      label: 'Visão geral',
      children: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      key: 'operacao',
      label: 'Operação',
      children: [
        { id: 'checkout', label: 'PDV / Nova venda', icon: ShoppingCart },
        { id: 'sales_history', label: 'Caixa e vendas', icon: Receipt },
        { id: 'cash', label: 'Fluxo de caixa', icon: Wallet },
        { id: 'customers', label: 'Clientes', icon: Users },
        { id: 'after_sales', label: 'Pós-venda', icon: Sparkles },
        { id: 'crm_customers', label: 'Prospecção (WhatsApp)', icon: Target },
      ],
    },
    {
      key: 'estoque',
      label: 'Estoque',
      children: [
        { id: 'stock_dashboard', label: 'Painel de estoque', icon: BarChart3 },
        { id: 'inventory', label: 'Celulares por IMEI', icon: Smartphone },
        { id: 'phone_purchases', label: 'Compras / Trade-in', icon: PhoneIncoming },
        { id: 'products', label: 'Produtos e peças', icon: Package },
        { id: 'suppliers', label: 'Fornecedores', icon: Truck },
        { id: 'showcase', label: 'Vitrine', icon: Globe },
        { id: 'labels', label: 'Etiquetas', icon: Barcode },
      ],
    },
    {
      key: 'assistencia',
      label: 'Assistência',
      children: [
        { id: 'assistance_dashboard', label: 'Painel de assistência', icon: BarChart3 },
        { id: 'service_order', label: 'Ordens de serviço', icon: Wrench },
        { id: 'services', label: 'Serviços', icon: Cog },
        { id: 'warranty', label: 'Garantias', icon: ShieldCheck },
      ],
    },
    {
      key: 'administracao',
      label: 'Administração',
      children: [
        { id: 'settings', label: 'Aparência & Loja', icon: Palette },
        { id: 'financial_intelligence', label: 'Gestão da loja', icon: Sliders },
        { id: 'subscription', label: 'Assinatura', icon: CheckCircle2 },
        { id: 'support', label: 'Suporte', icon: LifeBuoy },
        { id: 'migration', label: 'Migração de dados', icon: Database },
      ],
    },
  ];

  // Filtragem rápida de itens pelo search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return navGroups;
    const query = searchQuery.toLowerCase().trim();

    return navGroups
      .map(group => ({
        ...group,
        children: group.children.filter(item =>
          item.label.toLowerCase().includes(query)
        ),
      }))
      .filter(group => group.children.length > 0);
  }, [searchQuery, navGroups]);

  return (
    <aside
      style={{
        width: collapsed ? 72 : 250,
        minWidth: collapsed ? 72 : 250,
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: 'var(--border-width) solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--animation-duration) ease, background-color var(--animation-duration) ease, border-color var(--animation-duration) ease',
        zIndex: 50,
        color: 'var(--sidebar-text)',
        userSelect: 'none',
      }}
    >
      {/* 1. TOPO: LOGO & SELETOR DE LOJA */}
      <div
        style={{
          padding: collapsed ? '16px 12px' : '16px 16px 12px',
          borderBottom: 'var(--border-width) solid var(--sidebar-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          {/* Ícone Oficial da Marca */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            H
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--text-main, #FFFFFF)',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                Hiago iPhones
              </div>

              {/* Seletor Sóbrio de Unidade */}
              <button
                onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  marginTop: 1,
                }}
              >
                <span>Matriz Centro</span>
                <ChevronDown size={12} color="#6b7280" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            width: 24,
            height: 24,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={collapsed ? 'Expandir navegação' : 'Recolher navegação'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* 2. CAMPO DE BUSCA NO SISTEMA (ESTILO CLOSE CRM) */}
      {!collapsed && (
        <div style={{ padding: '12px 14px 6px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'var(--surface-bg)',
              border: 'var(--border-width) solid var(--sidebar-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontSize: '0.8125rem',
              color: 'var(--sidebar-text)',
            }}
          >
            <Search size={14} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Buscar no sistema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '0.8125rem',
                width: '100%',
              }}
            />
          </div>
        </div>
      )}

      {/* 3. NAVEGAÇÃO DOS 5 GRUPOS PRINCIPAIS */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: collapsed ? '12px 8px' : '10px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {filteredGroups.map((group) => {
          const isOpen = searchQuery.trim() ? true : !!openGroups[group.key];
          const hasActiveChild = group.children.some(child => child.id === activeTab);

          return (
            <div key={group.key} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Título do Grupo com Chevron */}
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '6px 8px',
                    background: 'transparent',
                    border: 'none',
                    color: hasActiveChild ? 'var(--text-main)' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    size={13}
                    style={{
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.15s ease',
                      color: 'var(--text-secondary)',
                    }}
                  />
                </button>
              )}

              {/* Itens do Grupo */}
              {(isOpen || collapsed) && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    marginTop: collapsed ? 0 : 2,
                    paddingLeft: collapsed ? 0 : 2,
                  }}
                >
                  {group.children.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: collapsed ? '9px 0' : '8px 10px',
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          borderRadius: 'var(--radius-sm)',
                          border: isActive ? 'var(--border-width) solid var(--color-primary)' : '1px solid transparent',
                          backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                          color: isActive ? '#FFFFFF' : 'var(--sidebar-text)',
                          fontSize: '0.8125rem',
                          fontWeight: isActive ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all var(--animation-duration) ease',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                            e.currentTarget.style.color = 'var(--text-main)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--sidebar-text)';
                          }
                        }}
                        title={item.label}
                      >
                        <ItemIcon
                          size={16}
                          color={isActive ? '#FFFFFF' : 'var(--sidebar-text)'}
                          strokeWidth={1.75}
                        />
                        {!collapsed && (
                          <span
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 4. RODAPÉ: PERFIL, STATUS DA LICENÇA E CONFIGURAÇÕES */}
      <div
        style={{
          borderTop: 'var(--border-width) solid var(--sidebar-border)',
          padding: collapsed ? '12px 8px' : '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          backgroundColor: 'var(--sidebar-bg)',
          transition: 'background-color var(--animation-duration) ease, border-color var(--animation-duration) ease',
        }}
      >
        {!collapsed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.6875rem',
              color: 'var(--sidebar-text)',
              padding: '0 2px',
            }}
          >
            <span>Balcão OS • v2.4</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--status-success)',
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: 'var(--status-success)',
                }}
              />
              Licença Ativa
            </span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: 8,
          }}
        >
          {/* Perfil do Operador */}
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              color: 'var(--sidebar-text)',
              textAlign: 'left',
              flex: 1,
              overflow: 'hidden',
            }}
            title="Meu Perfil"
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              RH
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-main, #FFFFFF)',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  Robson H.
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--sidebar-text)' }}>
                  Gerente Balcão
                </div>
              </div>
            )}
          </button>

          {/* Configurações */}
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              background: activeTab === 'settings' ? 'var(--color-primary)' : 'transparent',
              border: 'none',
              color: activeTab === 'settings' ? '#FFFFFF' : 'var(--sidebar-text)',
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all var(--animation-duration) ease',
            }}
            title="Configurações e Designer do Sistema"
          >
            <Cog size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
};
