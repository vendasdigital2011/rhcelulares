import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowUpDown,
  X,
  MapPin,
} from 'lucide-react';
import type { Product } from '../../types.js';

interface ProductsViewProps {
  products: Product[];
  onCreateProduct: (prod: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onAdjustStock: (id: string, delta: number, reason: string) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onCreateProduct,
  onUpdateProduct,
  onAdjustStock,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  // Estados do formulário de produto
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('Hiago Tech');
  const [category, setCategory] = useState('Capa');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState(20);
  const [sellPrice, setSellPrice] = useState(60);
  const [currentStock, setCurrentStock] = useState(15);
  const [minStock, setMinStock] = useState(5);
  const [location, setLocation] = useState('Gaveta Balcão A');

  // Estados de ajuste de estoque
  const [adjustDelta, setAdjustDelta] = useState(1);
  const [adjustType, setAdjustType] = useState<'add' | 'sub'>('add');
  const [adjustReason, setAdjustReason] = useState('Reposição de estoque semanal');

  const resetForm = () => {
    setName('');
    setSku('');
    setBarcode('');
    setBrand('Hiago Tech');
    setCategory('Capa');
    setDescription('');
    setCostPrice(20);
    setSellPrice(60);
    setCurrentStock(15);
    setMinStock(5);
    setLocation('Gaveta Balcão A');
    setEditingProduct(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, {
        name,
        sku,
        barcode: barcode.trim() || undefined,
        brand,
        category,
        description: description.trim() || undefined,
        costPrice: Number(costPrice),
        sellPrice: Number(sellPrice),
        minStock: Number(minStock),
        location: location.trim() || undefined,
      });
    } else {
      onCreateProduct({
        name,
        sku,
        barcode: barcode.trim() || undefined,
        brand,
        category,
        description: description.trim() || undefined,
        unit: 'un',
        costPrice: Number(costPrice),
        sellPrice: Number(sellPrice),
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        reservedStock: 0,
        location: location.trim() || undefined,
        status: 'active',
      });
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku);
    setBarcode(prod.barcode || '');
    setBrand(prod.brand);
    setCategory(prod.category);
    setDescription(prod.description || '');
    setCostPrice(prod.costPrice);
    setSellPrice(prod.sellPrice);
    setCurrentStock(prod.currentStock);
    setMinStock(prod.minStock);
    setLocation(prod.location || 'Gaveta Balcão A');
    setShowAddModal(true);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const delta = adjustType === 'add' ? Math.abs(adjustDelta) : -Math.abs(adjustDelta);
    onAdjustStock(adjustingProduct.id, delta, adjustReason);
    setAdjustingProduct(null);
  };

  const filteredProducts = products.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q)) ||
      p.brand.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            MERCADORIAS & ACESSÓRIOS
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Produtos & Acessórios
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Controle de estoque de capas, películas, carregadores homologados, caixas e periféricos.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: 8,
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
          }}
        >
          <Plus size={16} />
          <span>+ Novo Produto</span>
        </button>
      </div>

      {/* FILTROS E PESQUISA */}
      <div className="glass-panel" style={{ padding: 16, borderRadius: 12, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="Buscar por nome, SKU, código de barras ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '9px 12px 9px 36px',
                borderRadius: 8,
                color: '#f8fafc',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            background: '#0d121f',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#f8fafc',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >
          <option value="all">Todas as Categorias</option>
          <option value="Capa">Capas</option>
          <option value="Película">Películas</option>
          <option value="Carregador">Carregadores / Fontes</option>
          <option value="Fone">Fones de Ouvido</option>
          <option value="Outros">Outros</option>
        </select>
      </div>

      {/* TABELA DE PRODUTOS */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Produto / SKU</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Categoria</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Localização</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Estoque Atual</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Custo / Venda</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Margem de Lucro</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const profit = p.sellPrice - p.costPrice;
                const margin = p.sellPrice > 0 ? Math.round((profit / p.sellPrice) * 100) : 0;
                const isOutOfStock = p.currentStock === 0;
                const isLowStock = p.currentStock <= p.minStock && !isOutOfStock;

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800 }}>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>
                        SKU: <span style={{ color: '#38bdf8' }}>{p.sku}</span> {p.barcode && `• EAN: ${p.barcode}`}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', color: '#cbd5e1' }}>
                        {p.category}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: '0.74rem' }}>
                        <MapPin size={12} color="#f97316" />
                        <span>{p.location || 'Balcão'}</span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 800,
                          fontSize: '0.76rem',
                          background: isOutOfStock 
                            ? 'rgba(239, 68, 68, 0.15)' 
                            : isLowStock 
                              ? 'rgba(234, 179, 8, 0.15)' 
                              : 'rgba(16, 185, 129, 0.15)',
                          color: isOutOfStock ? '#ef4444' : isLowStock ? '#eab308' : '#10b981',
                        }}>
                          {p.currentStock} {p.unit}
                        </span>
                        {isLowStock && <span style={{ fontSize: '0.68rem', color: '#eab308' }}>Mín: {p.minStock}</span>}
                        {isOutOfStock && <span style={{ fontSize: '0.68rem', color: '#ef4444' }}>ZERADO</span>}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#f97316' }}>R$ {p.sellPrice.toFixed(2)}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Custo: R$ {p.costPrice.toFixed(2)}</div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.75rem' }}>
                        +R$ {profit.toFixed(2)} ({margin}%)
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          onClick={() => {
                            setAdjustingProduct(p);
                            setAdjustDelta(1);
                            setAdjustType('add');
                            setAdjustReason('Reposição de estoque semanal');
                          }}
                          title="Ajustar Quantidade em Estoque"
                          style={{
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            color: '#38bdf8',
                            padding: '5px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          <ArrowUpDown size={12} /> Ajustar
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Editar Cadastro"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#cbd5e1',
                            padding: '5px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Deseja desativar o produto ${p.name}?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          title="Excluir Produto"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#ef4444',
                            padding: '5px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO DE PRODUTO */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20,
        }}>
          <div className="glass-panel" style={{
            background: '#0d121f',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 16,
            maxWidth: 620,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                {editingProduct ? 'Editar Produto / Acessório' : 'Cadastrar Novo Produto'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Capa Silicone MagSafe iPhone 13"
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>SKU / Código Único *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="CAP-MAG-13"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#38bdf8', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Código de Barras (EAN)</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="789..."
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 10px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  >
                    <option value="Capa">Capa</option>
                    <option value="Película">Película</option>
                    <option value="Carregador">Carregador</option>
                    <option value="Fone">Fone</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f97316', fontWeight: 800, padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Localização</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Gaveta Balcão A"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
              </div>

              {!editingProduct && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Estoque Inicial (unid.)</label>
                    <input
                      type="number"
                      min={0}
                      value={currentStock}
                      onChange={(e) => setCurrentStock(Number(e.target.value))}
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Estoque Mínimo de Alerta</label>
                    <input
                      type="number"
                      min={1}
                      value={minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '9px 18px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff', padding: '9px 24px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE AJUSTE DE ESTOQUE */}
      {adjustingProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20,
        }}>
          <div className="glass-panel" style={{
            background: '#0d121f',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 16,
            maxWidth: 480,
            width: '100%',
            padding: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                Ajuste de Estoque • {adjustingProduct.name}
              </h2>
              <button
                onClick={() => setAdjustingProduct(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 14 }}>
              Estoque atual em sistema: <strong style={{ color: '#10b981' }}>{adjustingProduct.currentStock} unidades</strong>
            </div>

            <form onSubmit={handleConfirmAdjust} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Operação</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: adjustType === 'add' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: adjustType === 'add' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      color: adjustType === 'add' ? '#10b981' : '#cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    + Entrada / Compra
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('sub')}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: adjustType === 'sub' ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: adjustType === 'sub' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                      color: adjustType === 'sub' ? '#ef4444' : '#cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    - Saída / Perda
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Quantidade a Movimentar</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 800, marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Motivo / Justificativa *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="ex: Contagem física de inventário ou avaria"
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '8px 16px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ background: adjustType === 'add' ? '#10b981' : '#ef4444', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Gravar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
