import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  X 
} from 'lucide-react';
import type { TechnicalService } from '../../types.js';

interface ServicesCatalogProps {
  services: TechnicalService[];
  onCreateService: (service: Omit<TechnicalService, 'id' | 'createdAt'>) => Promise<any>;
  onUpdateService: (id: string, updates: Partial<TechnicalService>) => Promise<any>;
  onDeleteService: (id: string) => Promise<any>;
}

const CATEGORIES = [
  'Todas',
  'Troca de tela',
  'Troca de bateria',
  'Reparo de conector',
  'Reparo de placa',
  'Software',
  'Limpeza técnica',
  'Outros',
];

export const ServicesCatalogView: React.FC<ServicesCatalogProps> = ({
  services,
  onCreateService,
  onUpdateService,
  onDeleteService,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Troca de tela');
  const [description, setDescription] = useState('');
  const [compatibleDevices, setCompatibleDevices] = useState('iPhone');
  const [defaultPrice, setDefaultPrice] = useState(250);
  const [estimatedCost, setEstimatedCost] = useState(70);
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [defaultWarrantyDays, setDefaultWarrantyDays] = useState(90);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const openCreateModal = () => {
    setEditingServiceId(null);
    setName('');
    setCode(`SRV-${Date.now().toString().slice(-4)}`);
    setCategory('Troca de tela');
    setDescription('');
    setCompatibleDevices('iPhone');
    setDefaultPrice(250);
    setEstimatedCost(70);
    setEstimatedMinutes(45);
    setDefaultWarrantyDays(90);
    setNotes('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (service: TechnicalService) => {
    setEditingServiceId(service.id);
    setName(service.name);
    setCode(service.code);
    setCategory(service.category);
    setDescription(service.description || '');
    setCompatibleDevices((service.compatibleDevices || ['iPhone']).join(', '));
    setDefaultPrice(service.defaultPrice);
    setEstimatedCost(service.estimatedCost || 0);
    setEstimatedMinutes(service.estimatedMinutes || 60);
    setDefaultWarrantyDays(service.defaultWarrantyDays || 90);
    setNotes(service.notes || '');
    setStatus(service.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const devicesArray = compatibleDevices.split(',').map(d => d.trim()).filter(Boolean);

    if (editingServiceId) {
      await onUpdateService(editingServiceId, {
        name,
        code,
        category,
        description,
        compatibleDevices: devicesArray,
        defaultPrice,
        estimatedCost,
        estimatedMinutes,
        defaultWarrantyDays,
        notes,
        status,
      });
    } else {
      await onCreateService({
        name,
        code,
        category,
        description,
        compatibleDevices: devicesArray,
        defaultPrice,
        estimatedCost,
        estimatedMinutes,
        defaultWarrantyDays,
        notes,
        status,
      });
    }

    setIsModalOpen(false);
  };

  const filteredServices = useMemo(() => {
    return services.filter(srv => {
      if (selectedCategory !== 'Todas' && srv.category !== selectedCategory) return false;
      if (statusFilter !== 'all' && srv.status !== statusFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = srv.name.toLowerCase().includes(query);
        const matchCode = srv.code.toLowerCase().includes(query);
        const matchCat = srv.category.toLowerCase().includes(query);
        return matchName || matchCode || matchCat;
      }
      return true;
    });
  }, [services, selectedCategory, statusFilter, searchTerm]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter(s => s.status === 'active').length;
    const avgPrice = total > 0 ? services.reduce((acc, s) => acc + s.defaultPrice, 0) / total : 0;
    const avgCost = total > 0 ? services.reduce((acc, s) => acc + (s.estimatedCost || 0), 0) / total : 0;
    const avgMarginPct = avgPrice > 0 ? ((avgPrice - avgCost) / avgPrice) * 100 : 0;

    return { total, active, avgPrice, avgMarginPct };
  }, [services]);

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1440, margin: '0 auto' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ASSISTÊNCIA TÉCNICA
            </span>
            <span style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
              Catálogo Oficial de Mão de Obra
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
            Catálogo de Serviços Técnicos
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Serviços padronizados com tempos de bancada, prazos legais de garantia, precificação e margem calculada.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
          }}
        >
          <Plus size={16} />
          Novo Serviço
        </button>
      </div>

      {/* METRIC STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Cadastrado</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', marginTop: 2 }}>{stats.total} serviços</div>
        </div>
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Serviços Ativos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', marginTop: 2 }}>{stats.active} ativos</div>
        </div>
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Ticket Médio</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3b82f6', marginTop: 2 }}>
            R$ {stats.avgPrice.toFixed(2)}
          </div>
        </div>
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Margem Média Bruta</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f97316', marginTop: 2 }}>
            {stats.avgMarginPct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* BARRA DE PESQUISA & FILTROS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: 12 }} />
            <input
              type="text"
              placeholder="Pesquisar por nome, código ou categoria de serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: '#0d121f',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 14px 10px 40px',
                borderRadius: 8,
                color: '#f8fafc',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                background: '#0d121f',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 14px',
                borderRadius: 8,
                color: '#f8fafc',
                fontSize: '0.85rem',
              }}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Somente Ativos</option>
              <option value="inactive">Somente Inativos</option>
            </select>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#f97316' : 'rgba(255, 255, 255, 0.04)',
                color: selectedCategory === cat ? '#fff' : '#94a3b8',
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#f97316' : 'rgba(255, 255, 255, 0.08)',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA DE SERVIÇOS */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Código</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Serviço / Descrição</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Categoria</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tempo Bancada</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Garantia CDC</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Preço Padrão</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Margem Estimada</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
                  Nenhum serviço técnico encontrado com os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredServices.map(srv => {
                const profit = srv.defaultPrice - (srv.estimatedCost || 0);
                const marginPct = srv.defaultPrice > 0 ? (profit / srv.defaultPrice) * 100 : 0;

                return (
                  <tr 
                    key={srv.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
                      color: '#f8fafc',
                      opacity: srv.status === 'inactive' ? 0.5 : 1,
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f97316', background: 'rgba(249, 115, 22, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        {srv.code}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{srv.name}</div>
                      {srv.description && (
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2, maxWidth: 320 }}>
                          {srv.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', padding: '3px 8px', borderRadius: 6, fontSize: '0.74rem' }}>
                        {srv.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} color="#60a5fa" />
                        <span>{srv.estimatedMinutes} min</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={14} />
                        {srv.defaultWarrantyDays} dias
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#f8fafc', fontSize: '0.9rem' }}>
                      R$ {srv.defaultPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                        +{marginPct.toFixed(0)}% (R$ {profit.toFixed(2)})
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        Custo: R$ {(srv.estimatedCost || 0).toFixed(2)}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => openEditModal(srv)}
                          title="Editar Serviço"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <Edit3 size={13} />
                        </button>
                        {srv.status === 'active' && (
                          <button
                            onClick={() => onDeleteService(srv.id)}
                            title="Desativar Serviço (Preserva Histórico)"
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              color: '#ef4444',
                              padding: '6px 10px',
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

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#0d121f',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 14,
              width: '100%',
              maxWidth: 620,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                {editingServiceId ? 'Editar Serviço Técnico' : 'Cadastrar Novo Serviço'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Nome do Serviço *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Troca de Tela OLED + True Tone"
                    style={{
                      width: '100%',
                      background: '#151b2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Código Interno *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="SRV-TELA-13"
                    style={{
                      width: '100%',
                      background: '#151b2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#151b2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                    }}
                  >
                    {CATEGORIES.filter(c => c !== 'Todas').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Equipamentos Compatíveis
                  </label>
                  <input
                    type="text"
                    value={compatibleDevices}
                    onChange={(e) => setCompatibleDevices(e.target.value)}
                    placeholder="iPhone, iPad, Apple Watch"
                    style={{
                      width: '100%',
                      background: '#151b2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Preço Padrão (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: '#151b2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '8px 10px',
                      borderRadius: 6,
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Custo Est. (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: '#151b2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '8px 10px',
                      borderRadius: 6,
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Tempo (minutos)
                  </label>
                  <input
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: '#151b2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '8px 10px',
                      borderRadius: 6,
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Garantia (dias)
                  </label>
                  <input
                    type="number"
                    value={defaultWarrantyDays}
                    onChange={(e) => setDefaultWarrantyDays(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: '#151b2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '8px 10px',
                      borderRadius: 6,
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Descrição Completa
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Procedimento detalhado executado pelo técnico..."
                  style={{
                    width: '100%',
                    background: '#151b2b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#f8fafc',
                    fontSize: '0.82rem',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Requisitos ou Observações Técnicas
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Requer gravador JCID para copiar dados do True Tone."
                  style={{
                    width: '100%',
                    background: '#151b2b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontSize: '0.85rem',
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
                    padding: '8px 20px',
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
