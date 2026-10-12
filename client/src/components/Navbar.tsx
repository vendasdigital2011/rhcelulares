import { ShoppingCart, Wrench, Barcode, Lock, Unlock } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'checkout' | 'inventory' | 'service_order' | 'cash' | 'showcase';
  setActiveTab: (tab: 'dashboard' | 'checkout' | 'inventory' | 'service_order' | 'cash' | 'showcase') => void;
  isCashOpen: boolean;
  onToggleCash: () => void;
  onQuickNewSale: () => void;
  onQuickNewOS: () => void;
  onQuickNewDevice: () => void;
}

export const Navbar = ({
  activeTab,
  setActiveTab,
  isCashOpen,
  onToggleCash,
  onQuickNewSale,
  onQuickNewOS,
  onQuickNewDevice,
}: NavbarProps) => {
  return (
    <header style={{
      background: '#0d121f',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Barra Superior com Ações Rápidas Oficiais */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        {/* Identificação da Loja */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 2px 10px rgba(249, 115, 22, 0.35)',
          }}>
            H
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Hiago iPhones
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(249, 115, 22, 0.15)',
                color: '#fb923c',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                textTransform: 'uppercase',
              }}>
                ERP Vertical
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Boa tarde, <strong>Hiago</strong></span>
              <span>•</span>
              <span style={{ color: '#10b981' }}>Estoque por IMEI & Bateria</span>
            </div>
          </div>
        </div>

        {/* Botões Rápidos dos Prints (Nova Venda, Nova O.S., + IMEI, Caixa) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Status do Caixa */}
          <button
            onClick={onToggleCash}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: isCashOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: isCashOpen ? '#10b981' : '#f59e0b',
              transition: 'all 0.2s',
            }}
          >
            {isCashOpen ? <Unlock size={14} /> : <Lock size={14} />}
            Caixa: {isCashOpen ? 'Aberto' : 'Fechado'}
          </button>

          {/* + Cadastrar IMEI */}
          <button
            onClick={onQuickNewDevice}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#f8fafc',
            }}
          >
            <Barcode size={14} />
            + IMEI
          </button>

          {/* Nova O.S. */}
          <button
            onClick={onQuickNewOS}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)',
            }}
          >
            <Wrench size={14} />
            Nova O.S.
          </button>

          {/* + Nova Venda */}
          <button
            onClick={onQuickNewSale}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 16px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)',
            }}
          >
            <ShoppingCart size={15} />
            + Nova Venda
          </button>
        </div>
      </div>

      {/* Abas Principais de Navegação do ERP */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '0 20px',
        overflowX: 'auto',
      }}>
        {[
          { id: 'dashboard', label: '📊 Painel Operacional', tag: 'Ao Vivo' },
          { id: 'checkout', label: '🛒 Nova Venda (PDV)', tag: undefined },
          { id: 'inventory', label: '📱 Estoque por IMEI', tag: undefined },
          { id: 'service_order', label: '🔧 Assistência Técnica (O.S.)', tag: undefined },
          { id: 'cash', label: '💵 Controle de Caixa', tag: undefined },
          { id: 'showcase', label: '🌐 Vitrine Online', tag: undefined },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #f97316' : '3px solid transparent',
                color: isActive ? '#f8fafc' : '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.label}</span>
              {tab.tag && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                }}>
                  {tab.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
