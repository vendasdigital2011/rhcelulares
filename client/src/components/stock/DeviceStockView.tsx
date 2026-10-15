import { useState } from 'react';
import {
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  MapPin,
} from 'lucide-react';
import type { Device, DeviceCondition, DeviceStatus } from '../../types.js';
import { validateIMEI } from '../../utils/validators.js';

interface DeviceStockViewProps {
  devices: Device[];
  onAddDevice: (device: Device) => void;
  onUpdateDevice: (imei: string, updates: Partial<Device>) => void;
  onDeleteDevice: (imei: string) => void;
}

export const DeviceStockView: React.FC<DeviceStockViewProps> = ({
  devices,
  onAddDevice,
  onUpdateDevice,
  onDeleteDevice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DeviceStatus>('all');
  const [conditionFilter, setConditionFilter] = useState<'all' | DeviceCondition>('all');
  const [storageFilter, setStorageFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Estados do formulário de cadastro/edição
  const [brand] = useState('Apple');
  const [model, setModel] = useState('iPhone 13');
  const [storage, setStorage] = useState('128GB');
  const [color, setColor] = useState('Meia-noite');
  const [condition, setCondition] = useState<DeviceCondition>('certified_pre_owned');
  const [batteryHealth, setBatteryHealth] = useState(88);
  const [imei, setImei] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(2100);
  const [sellPrice, setSellPrice] = useState(2890);
  const [supplier, setSupplier] = useState('Distribuidora Alpha SP');
  const [location, setLocation] = useState('Vitrine Principal');
  const [notes, setNotes] = useState('');
  const [isShowcasePublic, setIsShowcasePublic] = useState(true);
  const [isShowcaseFeatured, setIsShowcaseFeatured] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setModel('iPhone 13');
    setStorage('128GB');
    setColor('Meia-noite');
    setCondition('certified_pre_owned');
    setBatteryHealth(88);
    setImei('');
    setSerialNumber('');
    setInternalCode('');
    setPurchasePrice(2100);
    setSellPrice(2890);
    setSupplier('Distribuidora Alpha SP');
    setLocation('Vitrine Principal');
    setNotes('');
    setIsShowcasePublic(true);
    setIsShowcaseFeatured(false);
    setFormError(null);
  };

  const handleSaveDevice = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanImei = imei.replace(/\D/g, '');
    if (!cleanImei || cleanImei.length !== 15) {
      setFormError('O IMEI deve conter exatamente 15 dígitos numéricos.');
      return;
    }

    if (!validateIMEI(cleanImei)) {
      setFormError('IMEI inválido pelo algoritmo de Luhn da Anatel/GSMA. Verifique o número digitado.');
      return;
    }

    // Verifica duplicação no cadastro novo
    if (!editingDevice && devices.some(d => d.imei?.replace(/\D/g, '') === cleanImei)) {
      setFormError(`Já existe um aparelho cadastrado no estoque com o IMEI ${cleanImei}.`);
      return;
    }

    if (editingDevice) {
      onUpdateDevice(editingDevice.imei || cleanImei, {
        model,
        storage,
        color,
        condition,
        batteryHealth: condition === 'certified_pre_owned' ? batteryHealth : undefined,
        purchasePrice,
        sellPrice,
        supplier,
        location,
        notes,
        isShowcasePublic,
        isShowcaseFeatured,
      });
      setEditingDevice(null);
    } else {
      const newDev: Device = {
        id: `dev-${Date.now()}`,
        imei: cleanImei,
        serialNumber: serialNumber.trim() || undefined,
        internalCode: internalCode.trim() || `AP-${devices.length + 101}`,
        brand,
        model,
        storage,
        color,
        condition,
        batteryHealth: condition === 'certified_pre_owned' ? batteryHealth : undefined,
        purchasePrice,
        sellPrice,
        supplier,
        status: 'available',
        location,
        notes: notes.trim() || undefined,
        isShowcasePublic,
        isShowcaseFeatured,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddDevice(newDev);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleOpenEdit = (dev: Device) => {
    setEditingDevice(dev);
    setModel(dev.model);
    setStorage(dev.storage);
    setColor(dev.color);
    setCondition(dev.condition);
    setBatteryHealth(dev.batteryHealth || 85);
    setImei(dev.imei || '');
    setSerialNumber(dev.serialNumber || '');
    setInternalCode(dev.internalCode || '');
    setPurchasePrice(dev.purchasePrice);
    setSellPrice(dev.sellPrice);
    setSupplier(dev.supplier);
    setLocation(dev.location || 'Vitrine Principal');
    setNotes(dev.notes || '');
    setIsShowcasePublic(dev.isShowcasePublic ?? true);
    setIsShowcaseFeatured(dev.isShowcaseFeatured ?? false);
    setShowAddModal(true);
  };

  const handleQuickStatusChange = (dev: Device, newStatus: DeviceStatus) => {
    if (!dev.imei) return;
    onUpdateDevice(dev.imei, { status: newStatus });
  };

  const filteredDevices = devices.filter(d => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      d.model.toLowerCase().includes(q) ||
      (d.imei && d.imei.includes(q)) ||
      (d.serialNumber && d.serialNumber.toLowerCase().includes(q)) ||
      (d.color && d.color.toLowerCase().includes(q)) ||
      (d.supplier && d.supplier.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesCondition = conditionFilter === 'all' || d.condition === conditionFilter;
    const matchesStorage = storageFilter === 'all' || d.storage === storageFilter;

    return matchesSearch && matchesStatus && matchesCondition && matchesStorage;
  });

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'available':
        return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800 }}>DISPONÍVEL</span>;
      case 'reserved':
        return <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800 }}>RESERVADO</span>;
      case 'showcase':
        return <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800 }}>VITRINE</span>;
      case 'sold':
        return <span style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800 }}>VENDIDO</span>;
      case 'in_technical_service':
      case 'warranty':
        return <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800 }}>ASSISTÊNCIA</span>;
      case 'returned_to_supplier':
        return <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800 }}>DEVOLVIDO</span>;
      default:
        return <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#f8fafc', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800 }}>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ESTOQUE E PROCEDÊNCIA
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Estoque Celulares por IMEI
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Rastreabilidade individual de cada iPhone com número de série, bateria, custo, margem e localização física.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setEditingDevice(null);
            setShowAddModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
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
          <Plus size={16} />
          <span>+ Cadastrar Aparelho</span>
        </button>
      </div>

      {/* BARRA DE FILTROS E PESQUISA */}
      <div className="glass-panel" style={{ padding: 16, borderRadius: 12, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="Buscar por IMEI (15 dígitos), modelo, cor, série ou fornecedor..."
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

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Filtro de Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
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
            <option value="all">Todos os Status ({devices.length})</option>
            <option value="available">Apenas Disponíveis</option>
            <option value="reserved">Reservados</option>
            <option value="showcase">Expostos na Vitrine</option>
            <option value="sold">Vendidos</option>
            <option value="in_technical_service">Em Assistência Técnica</option>
            <option value="returned_to_supplier">Devolvidos ao Fornecedor</option>
          </select>

          {/* Filtro de Classificação */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value as any)}
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
            <option value="all">Todas as Condições</option>
            <option value="certified_pre_owned">Seminovo / Usado</option>
            <option value="new_sealed">Novo Lacrado</option>
          </select>

          {/* Filtro de Armazenamento */}
          <select
            value={storageFilter}
            onChange={(e) => setStorageFilter(e.target.value)}
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
            <option value="all">Capacidade</option>
            <option value="64GB">64GB</option>
            <option value="128GB">128GB</option>
            <option value="256GB">256GB</option>
            <option value="512GB">512GB</option>
            <option value="1TB">1TB</option>
          </select>
        </div>
      </div>

      {/* TABELA DE APARELHOS */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Aparelho / Modelo</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>IMEI & Serial</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Saúde Bateria</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Localização</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Custo / Venda</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Ações Rápidas</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
                  Nenhum aparelho encontrado com os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredDevices.map((dev) => {
                const profit = dev.sellPrice - dev.purchasePrice;
                const margin = dev.sellPrice > 0 ? Math.round((profit / dev.sellPrice) * 100) : 0;

                return (
                  <tr key={dev.id || dev.imei} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                    {/* Modelo */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>{dev.model}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: 6, marginTop: 2 }}>
                        <span>{dev.storage}</span>
                        <span>•</span>
                        <span>{dev.color}</span>
                        <span>•</span>
                        <span style={{ color: dev.condition === 'new_sealed' ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                          {dev.condition === 'new_sealed' ? 'Lacrado' : 'Seminovo'}
                        </span>
                      </div>
                    </td>

                    {/* IMEI */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#38bdf8' }}>
                        {dev.imei || 'SEM IMEI'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 1 }}>
                        Série: {dev.serialNumber || 'N/A'} • {dev.internalCode || 'AP'}
                      </div>
                    </td>

                    {/* Bateria */}
                    <td style={{ padding: '12px 16px' }}>
                      {dev.condition === 'new_sealed' ? (
                        <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem' }}>100% (Novo)</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            color: (dev.batteryHealth || 0) >= 85 ? '#10b981' : (dev.batteryHealth || 0) >= 80 ? '#f59e0b' : '#ef4444',
                          }}>
                            {dev.batteryHealth ? `${dev.batteryHealth}%` : 'Não informada'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Localização */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <MapPin size={12} color="#f97316" />
                        <span>{dev.location || 'Vitrine Principal'}</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        Origem: {dev.supplier}
                      </div>
                    </td>

                    {/* Custo e Venda */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#f97316' }}>
                        R$ {dev.sellPrice.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        Custo: R$ {dev.purchasePrice.toFixed(2)} (+{margin}%)
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(dev.status)}
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        {/* Seletor rápido de status */}
                        <select
                          value={dev.status}
                          onChange={(e) => handleQuickStatusChange(dev, e.target.value as DeviceStatus)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#f8fafc',
                            fontSize: '0.72rem',
                            borderRadius: 6,
                            padding: '4px 6px',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="available">Disponível</option>
                          <option value="reserved">Reservado</option>
                          <option value="showcase">Vitrine</option>
                          <option value="sold">Vendido</option>
                          <option value="in_technical_service">Assistência</option>
                          <option value="returned_to_supplier">Devolver</option>
                        </select>

                        <button
                          onClick={() => handleOpenEdit(dev)}
                          title="Editar Aparelho"
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

                        {dev.status !== 'sold' && (
                          <button
                            onClick={() => {
                              if (confirm(`Deseja remover o iPhone ${dev.model} (${dev.imei}) do estoque?`)) {
                                if (dev.imei) onDeleteDevice(dev.imei);
                              }
                            }}
                            title="Excluir Aparelho"
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
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO DE APARELHO */}
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
            maxWidth: 680,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                  {editingDevice ? 'Editar Aparelho no Estoque' : 'Cadastrar Novo Aparelho'}
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                  Validação estrita de IMEI com conferência na Anatel e GSMA.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <AlertTriangle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDevice} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Condição */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Condição do Aparelho</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setCondition('certified_pre_owned')}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: condition === 'certified_pre_owned' ? '2px solid #f97316' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: condition === 'certified_pre_owned' ? 'rgba(249, 115, 22, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      color: '#f8fafc',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    Seminovo / Usado
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('new_sealed')}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: condition === 'new_sealed' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: condition === 'new_sealed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      color: '#f8fafc',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    Novo Lacrado
                  </button>
                </div>
              </div>

              {/* Modelo e Armazenamento */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Modelo</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="ex: iPhone 13 Pro"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Armazenamento</label>
                  <select
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    style={{ width: '100%', background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 10px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  >
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Cor</label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="ex: Azul"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
              </div>

              {/* IMEI e Serial */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>
                    IMEI Principal (15 dígitos) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={imei}
                    disabled={!!editingDevice}
                    onChange={(e) => setImei(e.target.value.replace(/\D/g, ''))}
                    placeholder="359182736450192"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#38bdf8', fontFamily: 'monospace', padding: '8px 12px', borderRadius: 8, fontSize: '0.85rem', marginTop: 4 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Número de Série</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="K90LP3910M"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
              </div>

              {/* Bateria e Localização */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {condition === 'certified_pre_owned' ? (
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Saúde da Bateria (%)</label>
                    <input
                      type="number"
                      min={40}
                      max={100}
                      value={batteryHealth}
                      onChange={(e) => setBatteryHealth(Number(e.target.value))}
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                    />
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Saúde da Bateria</label>
                    <input
                      type="text"
                      disabled
                      value="100% (Lacrado de Fábrica)"
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#10b981', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Localização Física</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Gaveta 1, Vitrine Central..."
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
              </div>

              {/* Preço de Custo e Preço de Venda */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
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
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Fornecedor / Origem</label>
                  <input
                    type="text"
                    required
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Distribuidora ou Cliente Trade-in"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
              </div>

              {/* Vitrine Toggles */}
              <div style={{ display: 'flex', gap: 20, padding: '10px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#f8fafc', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isShowcasePublic}
                    onChange={(e) => setIsShowcasePublic(e.target.checked)}
                  />
                  <span>Publicar na Vitrine Online</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#f8fafc', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isShowcaseFeatured}
                    onChange={(e) => setIsShowcaseFeatured(e.target.checked)}
                  />
                  <span>Destacar no Topo da Vitrine</span>
                </label>
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                    padding: '9px 18px',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    border: 'none',
                    color: '#fff',
                    padding: '9px 24px',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {editingDevice ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
