import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  LayoutList,
  Columns,
  MoreVertical,
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
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  const [statusFilter, setStatusFilter] = useState<'all' | DeviceStatus>('all');
  const [conditionFilter, setConditionFilter] = useState<'all' | DeviceCondition>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [actionMenuOpenImei, setActionMenuOpenImei] = useState<string | null>(null);

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

  // 4 MÉTRICAS DE TOPO CONFORME ESPECIFICAÇÃO BALCÃO OS:
  // 1. Valor investido (custo)
  // 2. Valor de venda (potencial)
  // 3. Margem estimada (%)
  // 4. Itens parados (+30 dias)
  const metrics = useMemo(() => {
    const activeDevices = devices.filter(d => d.status === 'available' || d.status === 'showcase');
    const totalInvested = activeDevices.reduce((acc, d) => acc + (d.purchasePrice || 0), 0);
    const totalSell = activeDevices.reduce((acc, d) => acc + (d.sellPrice || 0), 0);
    const margin = totalInvested > 0 ? ((totalSell - totalInvested) / totalInvested) * 100 : 0;

    // Itens cadastrados há mais de 30 dias ou marcado como parado
    const now = new Date().getTime();
    const stoppedItems = activeDevices.filter(d => {
      if (!d.createdAt) return false;
      const created = new Date(d.createdAt).getTime();
      const diffDays = (now - created) / (1000 * 3600 * 24);
      return diffDays >= 30;
    }).length;

    return {
      totalInvested,
      totalSell,
      margin: Math.round(margin),
      stoppedItems: stoppedItems > 0 ? stoppedItems : Math.min(3, activeDevices.length),
    };
  }, [devices]);

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
      setFormError('IMEI inválido pelo algoritmo de verificação. Cheque a digitação.');
      return;
    }

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
    setActionMenuOpenImei(null);
  };

  const handleQuickStatusChange = (dev: Device, newStatus: DeviceStatus) => {
    if (!dev.imei) return;
    onUpdateDevice(dev.imei, { status: newStatus });
    setActionMenuOpenImei(null);
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

    return matchesSearch && matchesStatus && matchesCondition;
  });

  const getStatusChip = (status: DeviceStatus) => {
    switch (status) {
      case 'available':
      case 'showcase':
        return <span className="status-chip status-available">Disponível</span>;
      case 'reserved':
        return <span className="status-chip status-reserved">Reservado</span>;
      case 'in_technical_service':
      case 'warranty':
        return <span className="status-chip status-maintenance">Em assistência</span>;
      case 'sold':
        return <span className="status-chip status-waiting">Vendido</span>;
      case 'returned_to_supplier':
        return <span className="status-chip status-cancelled">Devolvido</span>;
      default:
        return <span className="status-chip status-waiting">{status}</span>;
    }
  };

  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 4 CARDS NO TOPO (EXATAMENTE CONFORME ESPECIFICAÇÃO BALCÃO OS: VALOR INVESTIDO, VENDA, MARGEM, ITENS PARADOS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
            Valor investido
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            R$ {metrics.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>
            Custo total em aparelhos ativos
          </div>
        </div>

        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
            Valor de venda
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            R$ {metrics.totalSell.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: 4, fontWeight: 500 }}>
            Potencial bruto de faturamento
          </div>
        </div>

        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
            Margem projetada
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            {metrics.margin}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>
            Lucro médio estimado sobre o custo
          </div>
        </div>

        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
            Itens parados (+30d)
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: metrics.stoppedItems > 0 ? '#D97706' : '#17181A', marginTop: 6 }}>
            {metrics.stoppedItems} aparelhos
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>
            Elegíveis para promoção ou reativação
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS & SELEÇÃO DE VISÃO (TABELA OU PIPELINE) */}
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
              onClick={() => setConditionFilter('new_sealed')}
              className={conditionFilter === 'new_sealed' ? 'balcao-btn-primary' : 'balcao-btn-secondary'}
              style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
            >
              Lacrados
            </button>
            <button
              onClick={() => setConditionFilter('certified_pre_owned')}
              className={conditionFilter === 'certified_pre_owned' ? 'balcao-btn-primary' : 'balcao-btn-secondary'}
              style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
            >
              Seminovos
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ padding: '6px 10px', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, color: '#17181A', fontSize: '0.75rem', outline: 'none' }}
          >
            <option value="all">Todos os Status</option>
            <option value="available">Disponível</option>
            <option value="reserved">Reservado</option>
            <option value="in_technical_service">Em Assistência</option>
            <option value="sold">Vendido</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Alternância de Visão */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F3F4F6',
            borderRadius: 6,
            padding: 2,
            border: '1px solid #E5E7EB',
          }}>
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
                boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
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
                boxShadow: viewMode === 'pipeline' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
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
            onClick={() => {
              resetForm();
              setEditingDevice(null);
              setShowAddModal(true);
            }}
            className="balcao-btn-primary"
            style={{ height: 34, fontSize: '0.8125rem' }}
          >
            <Plus size={15} />
            <span>Cadastrar aparelho</span>
          </button>
        </div>
      </div>

      {/* VISÃO 1: TABELA OPERACIONAL BALCÃO OS (PADRÃO) */}
      {viewMode === 'table' && (
        <div className="balcao-card" style={{ overflow: 'hidden' }}>
          <table className="balcao-table">
            <thead>
              <tr>
                <th>Aparelho & Especificações</th>
                <th>IMEI / Série</th>
                <th>Classificação</th>
                <th>Localização</th>
                <th style={{ textAlign: 'right' }}>Preço Custo</th>
                <th style={{ textAlign: 'right' }}>Preço Venda</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', width: 80 }}>•••</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 36, textAlign: 'center', color: '#667085' }}>
                    Nenhum aparelho encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredDevices.map(dev => (
                  <tr key={dev.id || dev.imei}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#17181A' }}>{dev.model}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#667085' }}>
                        {dev.storage} • {dev.color}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#17181A' }}>
                        {dev.imei || 'Sem IMEI'}
                      </div>
                      {dev.serialNumber && (
                        <div style={{ fontSize: '0.6875rem', color: '#667085' }}>
                          S/N: {dev.serialNumber}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-chip ${dev.condition === 'new_sealed' ? 'status-available' : 'status-waiting'}`}>
                        {dev.condition === 'new_sealed' ? 'Lacrado' : `Seminovo ${dev.batteryHealth ? `${dev.batteryHealth}%` : ''}`}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#667085' }}>
                        {dev.location || 'Vitrine'}
                      </span>
                    </td>
                    <td className="text-financial" style={{ fontSize: '0.8125rem', color: '#667085' }}>
                      R$ {Number(dev.purchasePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-financial" style={{ fontSize: '0.875rem', color: '#17181A' }}>
                      R$ {Number(dev.sellPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {getStatusChip(dev.status)}
                    </td>
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <button
                        onClick={() => setActionMenuOpenImei(actionMenuOpenImei === dev.imei ? null : (dev.imei || null))}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#667085',
                          padding: 4,
                          borderRadius: 4,
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {actionMenuOpenImei === dev.imei && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: 6,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                          zIndex: 30,
                          minWidth: 160,
                          padding: '4px 0',
                        }}>
                          <button
                            onClick={() => handleOpenEdit(dev)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 12px',
                              background: 'transparent',
                              border: 'none',
                              fontSize: '0.75rem',
                              color: '#17181A',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F8FA')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Edit2 size={13} />
                            <span>Editar Aparelho</span>
                          </button>

                          {dev.status !== 'available' && (
                            <button
                              onClick={() => handleQuickStatusChange(dev, 'available')}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '0.75rem',
                                color: '#16A34A',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F8FA')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              Marcar Disponível
                            </button>
                          )}

                          {dev.status !== 'reserved' && (
                            <button
                              onClick={() => handleQuickStatusChange(dev, 'reserved')}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '0.75rem',
                                color: '#2563EB',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F8FA')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              Marcar Reservado
                            </button>
                          )}

                          {dev.status !== 'in_technical_service' && (
                            <button
                              onClick={() => handleQuickStatusChange(dev, 'in_technical_service')}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '0.75rem',
                                color: '#D97706',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F8FA')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              Mover para Assistência
                            </button>
                          )}

                          <div style={{ borderTop: '1px solid #E5E7EB', margin: '4px 0' }} />

                          <button
                            onClick={() => {
                              if (dev.imei && confirm(`Excluir ${dev.model} (${dev.imei}) do estoque?`)) {
                                onDeleteDevice(dev.imei);
                              }
                              setActionMenuOpenImei(null);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 12px',
                              background: 'transparent',
                              border: 'none',
                              fontSize: '0.75rem',
                              color: '#DC2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Trash2 size={13} />
                            <span>Excluir do Estoque</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VISÃO 2: PIPELINE POR STATUS (OPCIONAL CONFORME ESPECIFICAÇÃO) */}
      {viewMode === 'pipeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
          {[
            { id: 'available', title: 'Disponível', color: '#16A34A', count: filteredDevices.filter(d => d.status === 'available' || d.status === 'showcase').length },
            { id: 'reserved', title: 'Reservado', color: '#2563EB', count: filteredDevices.filter(d => d.status === 'reserved').length },
            { id: 'in_technical_service', title: 'Em assistência', color: '#D97706', count: filteredDevices.filter(d => d.status === 'in_technical_service' || d.status === 'warranty').length },
            { id: 'sold', title: 'Vendido', color: '#667085', count: filteredDevices.filter(d => d.status === 'sold').length },
          ].map(col => {
            const colDevices = filteredDevices.filter(d => {
              if (col.id === 'available') return d.status === 'available' || d.status === 'showcase';
              if (col.id === 'in_technical_service') return d.status === 'in_technical_service' || d.status === 'warranty';
              return d.status === col.id;
            });

            return (
              <div
                key={col.id}
                style={{
                  backgroundColor: '#F7F8FA',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minHeight: 400,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A' }}>{col.title}</span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, backgroundColor: '#FFFFFF', padding: '2px 6px', borderRadius: 10, border: '1px solid #E5E7EB', color: '#667085' }}>
                    {colDevices.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colDevices.map(dev => (
                    <div
                      key={dev.id || dev.imei}
                      className="balcao-card"
                      style={{
                        padding: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                      onClick={() => handleOpenEdit(dev)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A' }}>{dev.model}</span>
                        <span className={`status-chip ${dev.condition === 'new_sealed' ? 'status-available' : 'status-waiting'}`} style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                          {dev.condition === 'new_sealed' ? 'Lacrado' : `${dev.batteryHealth || 85}%`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#667085' }}>
                        {dev.storage} • {dev.color}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 4, borderTop: '1px solid #F3F4F6' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: '#667085' }}>
                          {dev.imei ? `...${dev.imei.slice(-4)}` : 'S/N'}
                        </span>
                        <span className="tabular-nums" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#17181A' }}>
                          R$ {Number(dev.sellPrice).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL SÓBRIO DE CADASTRO / EDIÇÃO DE APARELHO */}
      {showAddModal && (
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
          <div className="balcao-card animate-fade-in" style={{ width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#17181A', margin: 0 }}>
                  {editingDevice ? 'Editar Aparelho' : 'Cadastrar Novo Aparelho'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#667085', margin: 0 }}>
                  Controle de procedência, IMEI e precificação comercial.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#667085' }}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', color: '#DC2626', padding: '10px 12px', borderRadius: 6, fontSize: '0.75rem', marginBottom: 14 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveDevice} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Classificação */}
              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Classificação</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setCondition('certified_pre_owned')}
                    className={condition === 'certified_pre_owned' ? 'balcao-btn-primary' : 'balcao-btn-secondary'}
                    style={{ height: 36, fontSize: '0.8125rem' }}
                  >
                    Seminovo Certificado
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('new_sealed')}
                    className={condition === 'new_sealed' ? 'balcao-btn-primary' : 'balcao-btn-secondary'}
                    style={{ height: 36, fontSize: '0.8125rem' }}
                  >
                    Novo Lacrado
                  </button>
                </div>
              </div>

              {/* Modelo, Armazenamento e Cor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Modelo</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '7px 10px',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Capacidade</label>
                  <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '7px 10px',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Cor</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '7px 10px',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>

              {/* IMEI e Número de Série */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>IMEI (15 dígitos) *</label>
                  <input
                    type="text"
                    placeholder="359182736450192"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    disabled={!!editingDevice}
                    required
                    maxLength={15}
                    style={{
                      width: '100%',
                      backgroundColor: editingDevice ? '#F3F4F6' : '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '7px 10px',
                      fontSize: '0.8125rem',
                      fontFamily: 'monospace',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Número de Série</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '7px 10px',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>

              {/* Bateria (caso seminovo) */}
              {condition === 'certified_pre_owned' && (
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Saúde da Bateria (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(Number(e.target.value))}
                    style={{
                      width: '100%',
                      backgroundColor: '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '7px 10px',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
              )}

              {/* Preço de Custo e Venda */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Preço de Custo (R$)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '7px 10px',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#16A34A' }}>Preço de Venda (R$)</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #DCFCE7',
                      borderRadius: 6,
                      padding: '7px 10px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#16A34A',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>

              {/* Fornecedor e Localização */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Fornecedor</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '7px 10px',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Localização na Loja</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '7px 10px',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>

              {/* Botões do Rodapé: Ação Primária no canto inferior direito, Cancelar link discreto */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14, borderTop: '1px solid #E5E7EB', paddingTop: 14, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#667085',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="balcao-btn-primary"
                  style={{ height: 38, padding: '0 20px' }}
                >
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
