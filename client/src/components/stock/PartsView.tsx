import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowUpDown,
  X,
} from 'lucide-react';
import type { Part } from '../../types.js';

interface PartsViewProps {
  parts: Part[];
  onCreatePart: (part: Omit<Part, 'id' | 'createdAt'>) => void;
  onUpdatePart: (id: string, updates: Partial<Part>) => void;
  onAdjustStock: (id: string, delta: number, reason: string) => void;
  onDeletePart: (id: string) => void;
}

export const PartsView: React.FC<PartsViewProps> = ({
  parts,
  onCreatePart,
  onUpdatePart,
  onAdjustStock,
  onDeletePart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [adjustingPart, setAdjustingPart] = useState<Part | null>(null);

  // Estados do formulário
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<'Display' | 'Bateria' | 'Conector' | 'Câmera' | 'Carcaça' | 'Flex' | 'Outros'>('Display');
  const [manufacturer, setManufacturer] = useState('Foxconn OEM');
  const [compatibleModelsStr, setCompatibleModelsStr] = useState('iPhone 13, iPhone 13 Pro');
  const [costPrice, setCostPrice] = useState(240);
  const [sellPrice, setSellPrice] = useState(650);
  const [currentStock, setCurrentStock] = useState(6);
  const [minStock, setMinStock] = useState(2);
  const [location, setLocation] = useState('Bancada Gaveta 1');

  // Ajuste de estoque
  const [adjustDelta, setAdjustDelta] = useState(1);
  const [adjustType, setAdjustType] = useState<'add' | 'sub'>('add');
  const [adjustReason, setAdjustReason] = useState('Consumo em Ordem de Serviço');

  const resetForm = () => {
    setName('');
    setCode('');
    setCategory('Display');
    setManufacturer('Foxconn OEM');
    setCompatibleModelsStr('iPhone 13, iPhone 13 Pro');
    setCostPrice(240);
    setSellPrice(650);
    setCurrentStock(6);
    setMinStock(2);
    setLocation('Bancada Gaveta 1');
    setEditingPart(null);
  };

  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const compatibleModels = compatibleModelsStr
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    if (editingPart) {
      onUpdatePart(editingPart.id, {
        name,
        code,
        category,
        manufacturer,
        compatibleModels,
        costPrice: Number(costPrice),
        sellPrice: Number(sellPrice),
        minStock: Number(minStock),
        location: location.trim() || undefined,
      });
    } else {
      onCreatePart({
        name,
        code,
        sku: code,
        category,
        manufacturer,
        compatibleModels,
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

  const handleOpenEdit = (p: Part) => {
    setEditingPart(p);
    setName(p.name);
    setCode(p.code);
    setCategory(p.category);
    setManufacturer(p.manufacturer);
    setCompatibleModelsStr(p.compatibleModels.join(', '));
    setCostPrice(p.costPrice);
    setSellPrice(p.sellPrice);
    setCurrentStock(p.currentStock);
    setMinStock(p.minStock);
    setLocation(p.location || 'Bancada Gaveta 1');
    setShowAddModal(true);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingPart) return;

    const delta = adjustType === 'add' ? Math.abs(adjustDelta) : -Math.abs(adjustDelta);
    onAdjustStock(adjustingPart.id, delta, adjustReason);
    setAdjustingPart(null);
  };

  const filteredParts = parts.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q) ||
      p.compatibleModels.some(m => m.toLowerCase().includes(q));

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ASSISTÊNCIA & BANCADA
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Peças de Reparo & Componentes
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Estoque técnico para ordens de serviço. Telas OLED, baterias homologadas e conectores compatíveis por modelo.
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
            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            color: '#fff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: 8,
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)',
          }}
        >
          <Plus size={16} />
          <span>+ Nova Peça</span>
        </button>
      </div>

      {/* FILTROS E PESQUISA */}
      <div className="glass-panel" style={{ padding: 16, borderRadius: 12, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="Buscar por código, descrição, fabricante ou modelo compatível (ex: iPhone 13)..."
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
          <option value="all">Todas as Peças</option>
          <option value="Display">Displays / Telas</option>
          <option value="Bateria">Baterias</option>
          <option value="Conector">Conectores de Carga</option>
          <option value="Câmera">Câmeras</option>
          <option value="Carcaça">Carcaças / Tampas</option>
          <option value="Flex">Flex / Face ID</option>
          <option value="Outros">Outros Componentes</option>
        </select>
      </div>

      {/* TABELA DE PEÇAS */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Código / Peça</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Tipo & Fabricante</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Modelos Compatíveis</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Estoque</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Custo Peça</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Preço c/ Mão de Obra</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredParts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
                  Nenhuma peça de bancada cadastrada.
                </td>
              </tr>
            ) : (
              filteredParts.map((p) => {
                const isOutOfStock = p.currentStock === 0;
                const isLowStock = p.currentStock <= p.minStock && !isOutOfStock;

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800 }}>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>
                        Código: <span style={{ color: '#a855f7', fontFamily: 'monospace' }}>{p.code}</span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#cbd5e1' }}>{p.category}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{p.manufacturer}</div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {p.compatibleModels.map((m, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#94a3b8',
                              fontSize: '0.68rem',
                              padding: '1px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
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
                        {p.currentStock} unid.
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                      R$ {p.costPrice.toFixed(2)}
                    </td>

                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#f97316' }}>
                      R$ {p.sellPrice.toFixed(2)}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          onClick={() => {
                            setAdjustingPart(p);
                            setAdjustDelta(1);
                            setAdjustType('sub');
                            setAdjustReason('Consumo em Ordem de Serviço');
                          }}
                          title="Ajustar / Baixar Peça"
                          style={{
                            background: 'rgba(168, 85, 247, 0.12)',
                            border: '1px solid rgba(168, 85, 247, 0.25)',
                            color: '#c084fc',
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
                            if (confirm(`Deseja desativar a peça ${p.name}?`)) {
                              onDeletePart(p.id);
                            }
                          }}
                          title="Excluir Peça"
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

      {/* MODAL DE CADASTRO / EDIÇÃO */}
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
                {editingPart ? 'Editar Peça de Bancada' : 'Cadastrar Nova Peça'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePart} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Nome / Descrição da Peça *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Tela Frontal OLED iPhone 13 (True Tone)"
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Código Interno *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="PEC-DISP-13"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#a855f7', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Tipo / Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    style={{ width: '100%', background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 10px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  >
                    <option value="Display">Display / Tela</option>
                    <option value="Bateria">Bateria</option>
                    <option value="Conector">Conector</option>
                    <option value="Câmera">Câmera</option>
                    <option value="Carcaça">Carcaça</option>
                    <option value="Flex">Flex / Face ID</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Fabricante</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="Foxconn OEM"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Modelos Compatíveis (separados por vírgula)</label>
                <input
                  type="text"
                  value={compatibleModelsStr}
                  onChange={(e) => setCompatibleModelsStr(e.target.value)}
                  placeholder="iPhone 13, iPhone 13 Pro"
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Custo da Peça (R$)</label>
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
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Preço c/ Mão de Obra (R$)</label>
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
                    placeholder="Bancada Gaveta 1"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
              </div>

              {!editingPart && (
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
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', border: 'none', color: '#fff', padding: '9px 24px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  {editingPart ? 'Salvar Alterações' : 'Cadastrar Peça'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE AJUSTE / CONSUMO */}
      {adjustingPart && (
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
                Ajuste / Baixa de Peça • {adjustingPart.name}
              </h2>
              <button
                onClick={() => setAdjustingPart(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 14 }}>
              Estoque atual de bancada: <strong style={{ color: '#a855f7' }}>{adjustingPart.currentStock} unidades</strong>
            </div>

            <form onSubmit={handleConfirmAdjust} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Operação</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
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
                    - Consumo / Baixa O.S.
                  </button>
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
                    + Entrada / Reposição
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Quantidade</label>
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
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Justificativa / Nº O.S. *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="ex: Aplicado na O.S. #OS-1049"
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setAdjustingPart(null)}
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '8px 16px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ background: adjustType === 'add' ? '#10b981' : '#ef4444', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
