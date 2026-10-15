import {
  Smartphone,
  Package,
  Cpu,
  Truck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import type { Device, Product, Part, Supplier, PhonePurchase, InventoryMovement } from '../../types.js';

interface StockDashboardViewProps {
  devices: Device[];
  products: Product[];
  parts: Part[];
  suppliers: Supplier[];
  purchases: PhonePurchase[];
  movements: InventoryMovement[];
  onNavigateSubmodule: (submodule: 'inventory' | 'phone_purchases' | 'products' | 'parts' | 'suppliers' | 'showcase') => void;
  onQuickNewDevice: () => void;
  onQuickNewPurchase: () => void;
  onQuickNewProduct: () => void;
}

export const StockDashboardView: React.FC<StockDashboardViewProps> = ({
  devices,
  products,
  parts,
  suppliers,
  purchases,
  movements,
  onNavigateSubmodule,
  onQuickNewDevice,
  onQuickNewPurchase,
  onQuickNewProduct,
}) => {
  // 1. Métricas de Celulares
  const totalDevices = devices.length;
  const availableDevices = devices.filter(d => d.status === 'available');
  const reservedDevices = devices.filter(d => d.status === 'reserved');
  const showcaseDevices = devices.filter(d => d.status === 'showcase' || (d.status === 'available' && d.isShowcasePublic));

  // 2. Valoração Financeira Real do Estoque
  const devicesCostValuation = availableDevices.reduce((sum, d) => sum + (d.purchasePrice || 0), 0);
  const devicesPotentialRevenue = availableDevices.reduce((sum, d) => sum + (d.sellPrice || 0), 0);

  const productsCostValuation = products.reduce((sum, p) => sum + (p.costPrice * p.currentStock), 0);
  const productsPotentialRevenue = products.reduce((sum, p) => sum + (p.sellPrice * p.currentStock), 0);

  const partsCostValuation = parts.reduce((sum, p) => sum + (p.costPrice * p.currentStock), 0);
  const partsPotentialRevenue = parts.reduce((sum, p) => sum + (p.sellPrice * p.currentStock), 0);

  const totalCostValuation = devicesCostValuation + productsCostValuation + partsCostValuation;
  const totalPotentialRevenue = devicesPotentialRevenue + productsPotentialRevenue + partsPotentialRevenue;
  const projectedGrossProfit = totalPotentialRevenue - totalCostValuation;
  const projectedProfitMargin = totalPotentialRevenue > 0 
    ? Math.round((projectedGrossProfit / totalPotentialRevenue) * 100) 
    : 0;

  // 3. Alertas Operacionais de Estoque Mínimo e Ruptura
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStock && p.currentStock > 0);
  const outOfStockProducts = products.filter(p => p.currentStock === 0);
  const lowStockParts = parts.filter(p => p.currentStock <= p.minStock && p.currentStock > 0);
  const outOfStockParts = parts.filter(p => p.currentStock === 0);

  const totalCriticalAlerts = lowStockProducts.length + lowStockParts.length;
  const totalRuptureAlerts = outOfStockProducts.length + outOfStockParts.length;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* CABEÇALHO COM BOTÕES DE AÇÃO RÁPIDA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ESTOQUE E VITRINE • PAINEL OPERACIONAL
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f8fafc', marginTop: 4, letterSpacing: '-0.02em' }}>
            Controle Geral de Estoque & Vitrine
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 3 }}>
            Visão consolidada de celulares rastreados por IMEI, acessórios, peças técnicas e valoração patrimonial.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={onQuickNewPurchase}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '9px 16px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ShoppingBag size={14} color="#f97316" />
            <span>+ Compra de Aparelho</span>
          </button>

          <button
            onClick={onQuickNewProduct}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '9px 16px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Package size={14} color="#10b981" />
            <span>+ Produto / Acessório</span>
          </button>

          <button
            onClick={onQuickNewDevice}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
            }}
          >
            <Plus size={15} />
            <span>+ Cadastrar Aparelho</span>
          </button>
        </div>
      </div>

      {/* BLOCO 1: VALORAÇÃO FINANCEIRA DO ESTOQUE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {/* Custo Total em Estoque */}
        <div className="glass-panel" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>Custo Total de Aquisição</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Layers size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#f8fafc', marginTop: 8 }}>
            R$ {totalCostValuation.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4, display: 'flex', gap: 6 }}>
            <span>Celulares: R$ {devicesCostValuation.toFixed(0)}</span>
            <span>•</span>
            <span>Prod/Peças: R$ {(productsCostValuation + partsCostValuation).toFixed(0)}</span>
          </div>
        </div>

        {/* Faturamento Potencial */}
        <div className="glass-panel" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>Potencial de Faturamento</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <TrendingUp size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#10b981', marginTop: 8 }}>
            R$ {totalPotentialRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 4 }}>
            Valor de venda dos itens prontos para faturamento
          </div>
        </div>

        {/* Lucro Bruto Projetado */}
        <div className="glass-panel" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>Lucro Bruto Projetado</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', padding: '2px 8px', borderRadius: 12 }}>
              Margem {projectedProfitMargin}%
            </span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#f97316', marginTop: 8 }}>
            R$ {projectedGrossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
            Spread estimado entre custo e preço de venda
          </div>
        </div>

        {/* Alertas de Ruptura e Reposição */}
        <div className="glass-panel" style={{ padding: 20, borderRadius: 14, border: totalRuptureAlerts > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>Alertas de Estoque</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: totalRuptureAlerts > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: totalRuptureAlerts > 0 ? '#ef4444' : '#eab308' }}>
              <AlertTriangle size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: totalRuptureAlerts > 0 ? '#ef4444' : (totalCriticalAlerts > 0 ? '#eab308' : '#10b981'), marginTop: 8 }}>
            {totalRuptureAlerts > 0 ? `${totalRuptureAlerts} Rupturas` : (totalCriticalAlerts > 0 ? `${totalCriticalAlerts} Baixo Estoque` : 'Estoque 100% OK')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
            {totalRuptureAlerts > 0 ? 'Itens zerados precisam de pedido imediato' : 'Nenhuma ruptura crítica identificada'}
          </div>
        </div>
      </div>

      {/* BLOCO 2: CARDS DOS 6 SUBMÓDULOS COM NAVEGAÇÃO DIRETA */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Submódulos Especializados de Estoque</span>
          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>(Clique para abrir)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {/* 1. Celulares */}
          <div
            onClick={() => onNavigateSubmodule('inventory')}
            className="glass-panel"
            style={{
              padding: 16,
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(249, 115, 22, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                <Smartphone size={18} />
              </div>
              <ArrowUpRight size={14} color="#64748b" />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginTop: 12 }}>
              Estoque Celulares
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f97316', marginTop: 4 }}>
              {availableDevices.length} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>de {totalDevices}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
              {reservedDevices.length} reservados • {showcaseDevices.length} na vitrine
            </div>
          </div>

          {/* 2. Compra de Telefone */}
          <div
            onClick={() => onNavigateSubmodule('phone_purchases')}
            className="glass-panel"
            style={{
              padding: 16,
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <ShoppingBag size={18} />
              </div>
              <ArrowUpRight size={14} color="#64748b" />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginTop: 12 }}>
              Compra de Telefone
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', marginTop: 4 }}>
              {purchases.length} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>compras</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
              Trade-in balcão e lotes de atacado
            </div>
          </div>

          {/* 3. Produtos */}
          <div
            onClick={() => onNavigateSubmodule('products')}
            className="glass-panel"
            style={{
              padding: 16,
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Package size={18} />
              </div>
              <ArrowUpRight size={14} color="#64748b" />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginTop: 12 }}>
              Produtos
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', marginTop: 4 }}>
              {products.reduce((acc, p) => acc + p.currentStock, 0)} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>unid.</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
              {products.length} SKUs de acessórios ativos
            </div>
          </div>

          {/* 4. Peças */}
          <div
            onClick={() => onNavigateSubmodule('parts')}
            className="glass-panel"
            style={{
              padding: 16,
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                <Cpu size={18} />
              </div>
              <ArrowUpRight size={14} color="#64748b" />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginTop: 12 }}>
              Peças de Bancada
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#a855f7', marginTop: 4 }}>
              {parts.reduce((acc, p) => acc + p.currentStock, 0)} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>unid.</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
              Telas, baterias e módulos de reparo
            </div>
          </div>

          {/* 5. Fornecedores */}
          <div
            onClick={() => onNavigateSubmodule('suppliers')}
            className="glass-panel"
            style={{
              padding: 16,
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(234, 179, 8, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
                <Truck size={18} />
              </div>
              <ArrowUpRight size={14} color="#64748b" />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginTop: 12 }}>
              Fornecedores
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#eab308', marginTop: 4 }}>
              {suppliers.length} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>parceiros</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
              SP Import, Miami Tech e Peças
            </div>
          </div>

          {/* 6. Vitrine */}
          <div
            onClick={() => onNavigateSubmodule('showcase')}
            className="glass-panel"
            style={{
              padding: 16,
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(236, 72, 153, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                <Layers size={18} />
              </div>
              <ArrowUpRight size={14} color="#64748b" />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginTop: 12 }}>
              Vitrine Online
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ec4899', marginTop: 4 }}>
              {showcaseDevices.length} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>publicados</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
              Link de vendas Instagram/WhatsApp
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO 3: DUAS COLUNAS: COMPRAS RECENTES & HISTÓRICO DE MOVIMENTAÇÕES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* COMPRAS RECENTES */}
        <div className="glass-panel" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={16} color="#38bdf8" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>Compras Recentes de Aparelhos</h3>
            </div>
            <button
              onClick={() => onNavigateSubmodule('phone_purchases')}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Ver Todas <ArrowUpRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {purchases.slice(0, 4).map((cp) => (
              <div
                key={cp.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>{cp.purchaseNumber}</span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: cp.status === 'confirmed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: cp.status === 'confirmed' ? '#10b981' : '#f59e0b',
                    }}>
                      {cp.status === 'confirmed' ? 'CONFIRMADA' : 'RASCUNHO'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 3 }}>
                    Origem: {cp.customer} • {cp.items.length} item(ns)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                    R$ {cp.totalAmount.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                    {cp.date} • {cp.paymentMethod}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOVIMENTAÇÕES RECENTES */}
        <div className="glass-panel" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={16} color="#10b981" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>Rastreabilidade & Movimentações</h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Últimas entradas/saídas</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {movements.slice(0, 4).map((m) => {
              const isEntry = m.movementType.includes('inflow');
              return (
                <div
                  key={m.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      background: isEntry ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isEntry ? '#10b981' : '#ef4444',
                    }}>
                      {isEntry ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                        {m.itemName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                        {m.reason}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isEntry ? '#10b981' : '#f87171' }}>
                      {isEntry ? `+${m.quantity}` : `-${m.quantity}`} unid.
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                      {m.createdAt} • {m.operatorName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
