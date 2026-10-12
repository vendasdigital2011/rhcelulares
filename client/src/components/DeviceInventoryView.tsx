import { useState } from 'react';
import { Smartphone, Plus, Search, Shield, X } from 'lucide-react';
import type { Device, DeviceCondition } from '../types.js';

interface DeviceInventoryViewProps {
  devices: Device[];
  onAddDevice: (device: Device) => void;
}

export const DeviceInventoryView = ({
  devices,
  onAddDevice,
}: DeviceInventoryViewProps) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'sealed' | 'preowned'>('all');

  // Form states
  const [classification, setClassification] = useState<DeviceCondition>('certified_pre_owned');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('iPhone 15 Pro');
  const [storage, setStorage] = useState('128GB');
  const [color, setColor] = useState('Titânio Preto');
  const [imei, setImei] = useState('359182736450192');
  const [serialNumber, setSerialNumber] = useState('K90LP3910M');
  const [batteryHealth, setBatteryHealth] = useState(94);
  const [purchasePrice, setPurchasePrice] = useState(3800);
  const [sellPrice, setSellPrice] = useState(4890);
  const [supplier, setSupplier] = useState('Distribuidora Alpha SP');
  const [isPublic, setIsPublic] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const handleSaveDevice = (e: React.FormEvent) => {
    e.preventDefault();

    const newDev: Device = {
      id: `dev-${Date.now()}`,
      imei,
      serialNumber,
      brand,
      model,
      storage,
      color,
      condition: classification,
      batteryHealth: classification === 'certified_pre_owned' ? batteryHealth : undefined,
      purchasePrice,
      sellPrice,
      supplier,
      status: 'available',
      isShowcasePublic: isPublic,
      isShowcaseFeatured: isFeatured,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddDevice(newDev);
    setShowForm(false);
  };

  const filteredDevices = devices.filter(d => {
    const matchesSearch = !searchTerm || 
      d.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.imei?.includes(searchTerm) ||
      d.color.toLowerCase().includes(searchTerm.toLowerCase());

    if (conditionFilter === 'sealed') return matchesSearch && d.condition === 'new_sealed';
    if (conditionFilter === 'preowned') return matchesSearch && d.condition === 'certified_pre_owned';
    return matchesSearch;
  });

  return (
    <div style={{
      padding: '24px 32px',
      maxWidth: 1280,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#f97316',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            ESTOQUE E PROCEDÊNCIA
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Estoque por IMEI & Bateria
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Controle individual de cada iPhone com rastreabilidade de IMEI, bateria de seminovos e vitrine.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: showForm ? 'rgba(255, 255, 255, 0.1)' : '#f97316',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: showForm ? 'none' : '0 2px 10px rgba(249, 115, 22, 0.4)',
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Fechar Cadastro' : '+ Cadastrar Aparelho'}
        </button>
      </div>

      {/* FORMULÁRIO DE CADASTRO IDÊNTICO AOS PRINTS */}
      {showForm && (
        <form onSubmit={handleSaveDevice} className="glass-panel animate-fade-in" style={{ padding: 24, borderRadius: 16 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
            Novo aparelho
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 20 }}>
            Cadastre as informações comerciais e técnicas do aparelho.
          </p>

          {/* 1. CLASSIFICAÇÃO DO APARELHO (SEMINOVO VS LACRADO) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              CLASSIFICAÇÃO DO APARELHO
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 8 }}>
              {/* Seminovo / Usado */}
              <div
                onClick={() => setClassification('certified_pre_owned')}
                style={{
                  padding: '14px 18px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: classification === 'certified_pre_owned' ? '2px solid #f97316' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: classification === 'certified_pre_owned' ? 'rgba(249, 115, 22, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(249, 115, 22, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f97316',
                }}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc' }}>Seminovo / Usado</span>
                    {classification === 'certified_pre_owned' && (
                      <span style={{ fontSize: '0.65rem', background: '#f97316', color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                        SELECIONADO
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                    Permite registrar saúde da bateria, grau estético e checklist de testes.
                  </div>
                </div>
              </div>

              {/* Lacrado (Novo) */}
              <div
                onClick={() => setClassification('new_sealed')}
                style={{
                  padding: '14px 18px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: classification === 'new_sealed' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: classification === 'new_sealed' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc' }}>Lacrado (Novo)</span>
                    {classification === 'new_sealed' && (
                      <span style={{ fontSize: '0.65rem', background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                        SELECIONADO
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                    Novo de fábrica na caixa lacrada com 1 ano de garantia mundial Apple.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CAMPOS DO APARELHO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>IMEI (15 dígitos)</label>
              <input
                type="text"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Número de série</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Marca</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Modelo *</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Armazenamento</label>
              <input
                type="text"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Cor</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            {/* Saúde da bateria aparece apenas para seminovos */}
            {classification === 'certified_pre_owned' && (
              <div>
                <label style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                  Saúde da bateria (%) *
                </label>
                <input
                  type="number"
                  value={batteryHealth}
                  onChange={(e) => setBatteryHealth(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: '#10b981',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Preço de compra (R$)</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Preço de venda (R$) *</label>
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#10b981',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Fornecedor</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Opções de Vitrine */}
          <div style={{ display: 'flex', gap: 20, marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.82rem', color: '#f8fafc' }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ accentColor: '#f97316' }}
              />
              Exibir na vitrine pública da loja
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.82rem', color: '#f8fafc' }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ accentColor: '#f97316' }}
              />
              Destacar na vitrine
            </label>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                background: '#f97316',
                color: '#fff',
                border: 'none',
                padding: '9px 24px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Salvar aparelho
            </button>
          </div>
        </form>
      )}

      {/* TABELA DE APARELHOS NO ESTOQUE */}
      <div className="glass-panel" style={{ padding: 20, borderRadius: 16 }}>
        {/* Barra de Busca e Filtros */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 340 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              width: '100%',
            }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Buscar por modelo, IMEI ou cor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setConditionFilter('all')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: conditionFilter === 'all' ? '#f97316' : 'rgba(255, 255, 255, 0.04)',
                color: conditionFilter === 'all' ? '#fff' : '#94a3b8',
              }}
            >
              Todos ({devices.length})
            </button>
            <button
              onClick={() => setConditionFilter('sealed')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: conditionFilter === 'sealed' ? '#10b981' : 'rgba(255, 255, 255, 0.04)',
                color: conditionFilter === 'sealed' ? '#fff' : '#94a3b8',
              }}
            >
              Lacrados
            </button>
            <button
              onClick={() => setConditionFilter('preowned')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: conditionFilter === 'preowned' ? '#818cf8' : 'rgba(255, 255, 255, 0.04)',
                color: conditionFilter === 'preowned' ? '#fff' : '#94a3b8',
              }}
            >
              Seminovos (Bateria)
            </button>
          </div>
        </div>

        {/* Tabela */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 12px' }}>Aparelho</th>
              <th style={{ padding: '10px 12px' }}>IMEI / Série</th>
              <th style={{ padding: '10px 12px' }}>Classificação</th>
              <th style={{ padding: '10px 12px' }}>Preço Custo</th>
              <th style={{ padding: '10px 12px' }}>Preço Venda</th>
              <th style={{ padding: '10px 12px' }}>Fornecedor</th>
              <th style={{ padding: '10px 12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((dev) => (
              <tr key={dev.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '12px', fontWeight: 700, color: '#f8fafc' }}>
                  {dev.model} {dev.storage} ({dev.color})
                </td>
                <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.8rem' }}>
                  {dev.imei || dev.serialNumber || '—'}
                </td>
                <td style={{ padding: '12px' }}>
                  {dev.condition === 'new_sealed' ? (
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                      Lacrado (Novo)
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c', padding: '3px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                      Seminovo ({dev.batteryHealth}% bateria)
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px', color: '#94a3b8' }}>
                  R$ {dev.purchasePrice.toLocaleString('pt-BR')}
                </td>
                <td style={{ padding: '12px', fontWeight: 800, color: '#10b981' }}>
                  R$ {dev.sellPrice.toLocaleString('pt-BR')}
                </td>
                <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.78rem' }}>
                  {dev.supplier}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: dev.status === 'available' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(100, 116, 139, 0.2)',
                    color: dev.status === 'available' ? '#38bdf8' : '#94a3b8',
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}>
                    {dev.status === 'available' ? 'Disponível' : 'Vendido'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
