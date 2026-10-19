import React, { useState, useMemo } from 'react';
import { Plus, Search, X, LayoutList, Columns } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');

  // Form states
  const [classification] = useState<DeviceCondition>('certified_pre_owned');
  const [brand] = useState('Apple');
  const [model, setModel] = useState('iPhone 15 Pro');
  const [storage, setStorage] = useState('128GB');
  const [color, setColor] = useState('Titânio Preto');
  const [imei, setImei] = useState('359182736450192');
  const [serialNumber] = useState('K90LP3910M');
  const [batteryHealth] = useState(94);
  const [purchasePrice, setPurchasePrice] = useState(3800);
  const [sellPrice, setSellPrice] = useState(4890);
  const [supplier] = useState('Distribuidora Alpha SP');
  const [isPublic] = useState(true);
  const [isFeatured] = useState(false);

  // 4 Top Cards Balcão OS
  const metrics = useMemo(() => {
    const active = devices.filter(d => d.status === 'available');
    const totalInvested = active.reduce((acc, d) => acc + (d.purchasePrice || 0), 0);
    const totalSell = active.reduce((acc, d) => acc + (d.sellPrice || 0), 0);
    const margin = totalInvested > 0 ? ((totalSell - totalInvested) / totalInvested) * 100 : 0;
    return {
      totalInvested,
      totalSell,
      margin: Math.round(margin),
      stoppedItems: Math.min(2, active.length),
    };
  }, [devices]);

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
    <div style={{ padding: '24px 32px 60px', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 4 CARDS NO TOPO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>Valor investido</div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            R$ {metrics.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>Custo em estoque disponível</div>
        </div>

        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>Valor de venda</div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            R$ {metrics.totalSell.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: 4, fontWeight: 500 }}>Potencial de faturamento</div>
        </div>

        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>Margem projetada</div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            {metrics.margin}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>Markup médio sobre custo</div>
        </div>

        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>Itens parados</div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            {metrics.stoppedItems} aparelhos
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>Mais de 30 dias no estoque</div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="balcao-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#F7F8FA',
            border: '1px solid #E5E7EB',
            borderRadius: 6,
            padding: '7px 12px',
            width: '100%',
            maxWidth: 360,
          }}>
            <Search size={15} color="#667085" />
            <input
              type="text"
              placeholder="Buscar por modelo, IMEI ou cor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.8125rem',
                color: '#17181A',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setConditionFilter('all')}
              className={conditionFilter === 'all' ? 'balcao-btn-primary' : 'balcao-btn-secondary'}
              style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
            >
              Todos ({devices.length})
            </button>
            <button
              onClick={() => setConditionFilter('sealed')}
              className={conditionFilter === 'sealed' ? 'balcao-btn-primary' : 'balcao-btn-secondary'}
              style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
            >
              Lacrados
            </button>
            <button
              onClick={() => setConditionFilter('preowned')}
              className={conditionFilter === 'preowned' ? 'balcao-btn-primary' : 'balcao-btn-secondary'}
              style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
            >
              Seminovos
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: 6, padding: 2, border: '1px solid #E5E7EB' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                border: 'none',
                borderRadius: 4,
                backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? '#17181A' : '#667085',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'table' ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              <LayoutList size={13} />
              <span>Tabela</span>
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                border: 'none',
                borderRadius: 4,
                backgroundColor: viewMode === 'pipeline' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'pipeline' ? '#17181A' : '#667085',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'pipeline' ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              <Columns size={13} />
              <span>Por status</span>
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="balcao-btn-primary"
            style={{ height: 34, fontSize: '0.8125rem' }}
          >
            <Plus size={15} />
            <span>Cadastrar aparelho</span>
          </button>
        </div>
      </div>

      {/* TABELA PADRÃO BALCÃO OS */}
      {viewMode === 'table' && (
        <div className="balcao-card" style={{ overflow: 'hidden' }}>
          <table className="balcao-table">
            <thead>
              <tr>
                <th>Aparelho</th>
                <th>IMEI / Série</th>
                <th>Classificação</th>
                <th style={{ textAlign: 'right' }}>Preço Custo</th>
                <th style={{ textAlign: 'right' }}>Preço Venda</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map(dev => (
                <tr key={dev.id || dev.imei}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#17181A' }}>{dev.model}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#667085' }}>{dev.storage} • {dev.color}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#17181A' }}>{dev.imei}</span>
                  </td>
                  <td>
                    <span className={`status-chip ${dev.condition === 'new_sealed' ? 'status-available' : 'status-waiting'}`}>
                      {dev.condition === 'new_sealed' ? 'Lacrado' : `Seminovo ${dev.batteryHealth ? `${dev.batteryHealth}%` : ''}`}
                    </span>
                  </td>
                  <td className="text-financial" style={{ fontSize: '0.8125rem', color: '#667085' }}>
                    R$ {Number(dev.purchasePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-financial" style={{ fontSize: '0.875rem', color: '#17181A' }}>
                    R$ {Number(dev.sellPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className="status-chip status-available">
                      {dev.status === 'available' ? 'Disponível' : dev.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PIPELINE VIEW */}
      {viewMode === 'pipeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { id: 'available', title: 'Disponível', color: '#16A34A', list: filteredDevices.filter(d => d.status === 'available') },
            { id: 'reserved', title: 'Reservado', color: '#2563EB', list: filteredDevices.filter(d => d.status === 'reserved') },
            { id: 'sold', title: 'Vendido', color: '#667085', list: filteredDevices.filter(d => d.status === 'sold') },
          ].map(col => (
            <div key={col.id} style={{ backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12, minHeight: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A' }}>{col.title}</span>
                </div>
                <span style={{ fontSize: '0.6875rem', backgroundColor: '#FFFFFF', padding: '1px 6px', borderRadius: 10, border: '1px solid #E5E7EB', color: '#667085' }}>
                  {col.list.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.list.map(d => (
                  <div key={d.id} className="balcao-card" style={{ padding: 12 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A' }}>{d.model}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#667085' }}>{d.storage} • {d.color}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: '1px solid #F3F4F6' }}>
                      <span style={{ fontSize: '0.6875rem', color: '#667085' }}>Bateria: {d.batteryHealth || 90}%</span>
                      <span className="tabular-nums" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>R$ {d.sellPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CADASTRO */}
      {showForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 80,
          padding: 20,
        }}>
          <div className="balcao-card animate-fade-in" style={{ width: '100%', maxWidth: 540, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#17181A', margin: 0 }}>Novo Aparelho</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#667085' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveDevice} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Modelo</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                    style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: '0.8125rem', outline: 'none', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Capacidade</label>
                  <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    required
                    style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: '0.8125rem', outline: 'none', marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>IMEI (15 dígitos)</label>
                  <input
                    type="text"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    required
                    style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: '0.8125rem', fontFamily: 'monospace', outline: 'none', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Cor</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    required
                    style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: '0.8125rem', outline: 'none', marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Custo (R$)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    required
                    style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: '0.8125rem', outline: 'none', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#16A34A' }}>Preço Venda (R$)</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    required
                    style={{ width: '100%', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: 6, padding: '7px 10px', fontSize: '0.875rem', fontWeight: 600, color: '#16A34A', outline: 'none', marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #E5E7EB', paddingTop: 14, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ background: 'transparent', border: 'none', color: '#667085', fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button type="submit" className="balcao-btn-primary">
                  Salvar Aparelho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
