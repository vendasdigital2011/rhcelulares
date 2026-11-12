import React, { useState } from 'react';
import { 
  Search, 
  MessageSquare, 
  X,
  Phone,
  MoreVertical,
  Pencil
} from 'lucide-react';
import type { Customer, Sale, ServiceOrder } from '../types.js';
import { validatePhoneBR } from '../utils/validators.js';

interface CustomersViewProps {
  customers: Customer[];
  sales?: Sale[];
  serviceOrders?: ServiceOrder[];
  onAddCustomer: (customer: Customer) => Promise<void>;
  onUpdateCustomer: (customer: Customer) => Promise<void>;
  onNavigateToPOS?: (customerName: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  sales = [],
  serviceOrders = [],
  onAddCustomer,
  onUpdateCustomer,
  onNavigateToPOS,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activeMenuCustomerId, setActiveMenuCustomerId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Formulário de novo cliente
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cpf: '',
    email: '',
    birthday: '',
    notes: '',
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.cpf && c.cpf.includes(searchTerm)) ||
    c.purchasedDevices.some(d => d.model.toLowerCase().includes(searchTerm.toLowerCase()) || (d.imei && d.imei.includes(searchTerm)))
  );

  const totalSpentAll = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgLtv = customers.length > 0 ? Math.round(totalSpentAll / customers.length) : 0;
  const totalDevicesSold = customers.reduce((acc, c) => acc + c.purchasedDevices.length, 0);

  const handleOpenWhatsApp = (phone: string, customerName: string, deviceModel?: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = deviceModel 
      ? `Olá ${customerName}! Tudo bem? Aqui é da Hiago iPhones. Seu ${deviceModel} está elegível para nossa avaliação especial de trade-in!`
      : `Olá ${customerName}! Tudo bem? Aqui é da equipe da Hiago iPhones. Como podemos ajudar hoje?`;
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`}?text=${text}`, '_blank');
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setSaveError('');
    setFormData({ name: '', phone: '', cpf: '', email: '', birthday: '', notes: '' });
    setIsNewModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setSaveError('');
    setFormData({
      name: customer.name,
      phone: customer.phone,
      cpf: customer.cpf || '',
      email: customer.email || '',
      birthday: customer.birthday || '',
      notes: customer.notes || '',
    });
    setSelectedCustomer(null);
    setActiveMenuCustomerId(null);
    setIsNewModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Preencha os campos obrigatórios: Nome e Telefone/WhatsApp.');
      return;
    }

    const phoneCheck = validatePhoneBR(formData.phone);
    if (!phoneCheck.isValid) {
      alert(`Atenção: ${phoneCheck.error}`);
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    const alreadyExists = customers.some(c => c.id !== editingCustomer?.id && c.phone.replace(/\D/g, '') === cleanPhone);
    if (alreadyExists) {
      alert('Já existe um cliente cadastrado com este telefone.');
      return;
    }

    const newCustomer: Customer = {
      id: editingCustomer?.id || `cust-${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      cpf: formData.cpf.trim() || undefined,
      email: formData.email.trim() || undefined,
      purchasedDevices: editingCustomer?.purchasedDevices || [],
      totalSpent: editingCustomer?.totalSpent || 0,
      lastPurchaseDate: editingCustomer?.lastPurchaseDate || new Date().toLocaleDateString('pt-BR'),
      notes: formData.notes.trim() || undefined,
      birthday: formData.birthday || undefined,
    };

    setIsSaving(true);
    setSaveError('');
    try {
      if (editingCustomer) {
        await onUpdateCustomer(newCustomer);
      } else {
        await onAddCustomer(newCustomer);
      }
      setIsNewModalOpen(false);
      setFormData({ name: '', phone: '', cpf: '', email: '', birthday: '', notes: '' });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar o cliente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 3 CARDS DE MÉTRICAS DA BASE DE CLIENTES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
            Base ativa de clientes
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            {customers.length} contatos
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: 4, fontWeight: 500 }}>
            100% com canal WhatsApp disponível
          </div>
        </div>

        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
            LTV médio por cliente
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            R$ {avgLtv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: 4 }}>
            Faturamento acumulado: R$ {totalSpentAll.toLocaleString('pt-BR')}
          </div>
        </div>

        <div className="balcao-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
            Aparelhos no ciclo
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#17181A', marginTop: 6 }}>
            {totalDevicesSold} smartphones
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: 4, fontWeight: 500 }}>
            Monitorados com histórico de bateria
          </div>
        </div>
      </div>

      {/* BARRA DE PESQUISA & CONTROLE */}
      <div className="balcao-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#F7F8FA',
          border: '1px solid #E5E7EB',
          borderRadius: 6,
          padding: '7px 12px',
          flex: 1,
          maxWidth: 420,
        }}>
          <Search size={15} color="#667085" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone, CPF ou aparelho comprado..."
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

        <button
          id="open-customer-modal-btn"
          onClick={openCreateModal}
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          style={{ display: 'none' }}
        >
          Abrir cadastro de cliente
        </button>
      </div>

      {/* TABELA DE CLIENTES CONFORME ESPECIFICAÇÃO BALCÃO OS:
          Cliente | Última compra | Aparelho | LTV | Próxima ação | Responsável | ••• */}
      <div className="balcao-card" style={{ overflow: 'hidden' }}>
        <table className="balcao-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Última Compra</th>
              <th>Aparelho Registrado</th>
              <th style={{ textAlign: 'right' }}>LTV</th>
              <th>Próxima Ação</th>
              <th>Responsável</th>
              <th style={{ textAlign: 'right', width: 90 }}>•••</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#667085' }}>
                  Nenhum cliente localizado na base cadastral.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(cust => {
                const latestDevice = cust.purchasedDevices[0];
                return (
                  <tr key={cust.id}>
                    {/* Cliente */}
                    <td>
                      <div
                        onClick={() => setSelectedCustomer(cust)}
                        style={{ fontWeight: 600, color: '#17181A', cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#17181A')}
                      >
                        {cust.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#667085' }}>
                        {cust.phone}
                      </div>
                    </td>

                    {/* Última compra */}
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#17181A' }}>
                        {cust.lastPurchaseDate || 'Sem compras'}
                      </span>
                    </td>

                    {/* Aparelho */}
                    <td>
                      {latestDevice ? (
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.8125rem', color: '#17181A' }}>
                            {latestDevice.model}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#667085' }}>
                            {latestDevice.imei ? `IMEI: ${latestDevice.imei}` : 'Dispositivo'} • {latestDevice.batteryHealth ? `Bateria ${latestDevice.batteryHealth}%` : 'Novo'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#98A2B3' }}>Nenhum aparelho</span>
                      )}
                    </td>

                    {/* LTV */}
                    <td className="text-financial" style={{ fontSize: '0.875rem' }}>
                      R$ {Number(cust.totalSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Próxima ação com etiqueta contextual de sugestão automática */}
                    <td>
                      {latestDevice ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span className="status-chip status-reserved" style={{ fontSize: '0.6875rem', width: 'fit-content' }}>
                            Sugestão: trade-in provável
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: '#667085' }}>
                            Base: {latestDevice.model} comprado há 18m
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#667085' }}>Apresentar portfólio</span>
                      )}
                    </td>

                    {/* Responsável */}
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#475467' }}>
                        Hiago
                      </span>
                    </td>

                    {/* Menu ••• */}
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => handleOpenWhatsApp(cust.phone, cust.name, latestDevice?.model)}
                          style={{
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: 4,
                            padding: '4px 6px',
                            cursor: 'pointer',
                            color: '#16A34A',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Abrir WhatsApp"
                        >
                          <MessageSquare size={13} />
                        </button>

                        <button
                          onClick={() => openEditModal(cust)}
                          style={{
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: 4,
                            padding: '4px 6px',
                            cursor: 'pointer',
                            color: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Editar cliente"
                          aria-label={`Editar cliente ${cust.name}`}
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          onClick={() => setActiveMenuCustomerId(activeMenuCustomerId === cust.id ? null : cust.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#667085',
                            padding: 4,
                          }}
                        >
                          <MoreVertical size={15} />
                        </button>
                      </div>

                      {activeMenuCustomerId === cust.id && (
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
                          textAlign: 'left',
                        }}>
                          <button
                            onClick={() => openEditModal(cust)}
                            style={{
                              width: '100%', padding: '8px 12px', background: 'transparent', border: 'none',
                              fontSize: '0.75rem', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F8FA')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Pencil size={13} />
                            <span>Editar cliente</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setActiveMenuCustomerId(null);
                            }}
                            style={{
                              width: '100%',
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
                            <span>Ver perfil completo</span>
                          </button>

                          {onNavigateToPOS && (
                            <button
                              onClick={() => {
                                onNavigateToPOS(cust.name);
                                setActiveMenuCustomerId(null);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '0.75rem',
                                color: '#2563EB',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F8FA')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <span>Iniciar venda no PDV</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAINEL LATERAL (DRAWER) CONTEXTUAL DE DETALHES DO CLIENTE */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 90,
        }}>
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 460,
              backgroundColor: '#FFFFFF',
              height: '100%',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E5E7EB', paddingBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#17181A', margin: 0 }}>
                  {selectedCustomer.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#667085' }}>
                  Cliente desde {selectedCustomer.lastPurchaseDate || 'recente'}
                </span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#667085' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16, flex: 1 }}>
              {/* Contatos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={14} color="#667085" />
                  <span style={{ color: '#17181A', fontWeight: 500 }}>{selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.cpf && (
                  <div style={{ fontSize: '0.75rem', color: '#667085' }}>
                    CPF: {selectedCustomer.cpf}
                  </div>
                )}
                {selectedCustomer.email && (
                  <div style={{ fontSize: '0.75rem', color: '#667085' }}>
                    E-mail: {selectedCustomer.email}
                  </div>
                )}
              </div>

              {/* LTV & Histórico Financeiro */}
              <div style={{ backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 8, padding: 14 }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
                  Total Investido na Loja (LTV)
                </span>
                <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#17181A', marginTop: 4 }}>
                  R$ {selectedCustomer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Aparelhos Comprados */}
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A', marginBottom: 10 }}>
                  Aparelhos Adquiridos ({selectedCustomer.purchasedDevices.length})
                </h4>

                {selectedCustomer.purchasedDevices.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: 6, fontSize: '0.75rem', color: '#667085' }}>
                    Nenhum smartphone vinculado a este cadastro ainda.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedCustomer.purchasedDevices.map((dev, idx) => (
                      <div key={dev.imei || idx} style={{ padding: 12, border: '1px solid #E5E7EB', borderRadius: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#17181A' }}>{dev.model}</span>
                          <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                            R$ {Number(dev.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#667085', marginTop: 4 }}>
                          IMEI: {dev.imei || 'S/N'} • Bateria: {dev.batteryHealth ? `${dev.batteryHealth}%` : 'N/D'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Histórico de Compras (Vendas PDV) */}
              {sales.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A', marginBottom: 10 }}>
                    Compras Recentes no PDV ({
                      sales.filter(s => s.customerId === selectedCustomer.id || (s.customerPhone && selectedCustomer.phone && s.customerPhone.replace(/\D/g, '') === selectedCustomer.phone.replace(/\D/g, ''))).length
                    })
                  </h4>
                  {(() => {
                    const custSales = sales.filter(s => s.customerId === selectedCustomer.id || (s.customerPhone && selectedCustomer.phone && s.customerPhone.replace(/\D/g, '') === selectedCustomer.phone.replace(/\D/g, ''))).slice(0, 3);
                    if (custSales.length === 0) {
                      return (
                        <div style={{ padding: 12, textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: 6, fontSize: '0.75rem', color: '#667085' }}>
                          Nenhuma venda no PDV registrada.
                        </div>
                      );
                    }
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {custSales.map(s => (
                          <div key={s.id} style={{ padding: 10, border: '1px solid #E5E7EB', borderRadius: 6, fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#17181A' }}>Venda #{s.saleNumber || s.id.slice(0, 6)} ({s.date})</div>
                              <div style={{ color: '#667085', fontSize: '0.6875rem' }}>{s.paymentMethod}</div>
                            </div>
                            <div style={{ fontWeight: 700, color: '#16A34A' }}>
                              R$ {(s.total ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Ordens de Serviço (Assistência Técnica) */}
              {serviceOrders.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A', marginBottom: 10 }}>
                    Ordens de Serviço ({
                      serviceOrders.filter(o => o.customerId === selectedCustomer.id || (o.customerPhone && selectedCustomer.phone && o.customerPhone.replace(/\D/g, '') === selectedCustomer.phone.replace(/\D/g, ''))).length
                    })
                  </h4>
                  {(() => {
                    const custOrders = serviceOrders.filter(o => o.customerId === selectedCustomer.id || (o.customerPhone && selectedCustomer.phone && o.customerPhone.replace(/\D/g, '') === selectedCustomer.phone.replace(/\D/g, ''))).slice(0, 3);
                    if (custOrders.length === 0) {
                      return (
                        <div style={{ padding: 12, textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: 6, fontSize: '0.75rem', color: '#667085' }}>
                          Nenhum chamado de assistência técnica registrado.
                        </div>
                      );
                    }
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {custOrders.map(o => (
                          <div key={o.id} style={{ padding: 10, border: '1px solid #E5E7EB', borderRadius: 6, fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#17181A' }}>OS {o.osNumber} ({o.deviceModel})</div>
                              <div style={{ color: '#2563EB', fontSize: '0.6875rem' }}>Status: {o.status}</div>
                            </div>
                            <div style={{ fontWeight: 700, color: '#17181A' }}>
                              R$ {Number(o.finalValue || o.estimatedValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {selectedCustomer.notes && (
                <div>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A', marginBottom: 6 }}>
                    Observações de Balcão
                  </h4>
                  <div style={{ padding: 10, backgroundColor: '#F9FAFB', borderRadius: 6, fontSize: '0.75rem', color: '#475467' }}>
                    {selectedCustomer.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Ações no Rodapé do Drawer */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 16, display: 'flex', gap: 10 }}>
              <button onClick={() => openEditModal(selectedCustomer)} className="balcao-btn-secondary" style={{ flex: 1 }}>
                <Pencil size={14} />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleOpenWhatsApp(selectedCustomer.phone, selectedCustomer.name, selectedCustomer.purchasedDevices[0]?.model)}
                className="balcao-btn-secondary"
                style={{ flex: 1 }}
              >
                <MessageSquare size={14} color="#16A34A" />
                <span>WhatsApp</span>
              </button>

              {onNavigateToPOS && (
                <button
                  onClick={() => {
                    onNavigateToPOS(selectedCustomer.name);
                    setSelectedCustomer(null);
                  }}
                  className="balcao-btn-primary"
                  style={{ flex: 1 }}
                >
                  Iniciar Venda
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CENTRAL DE CRIAÇÃO CURTA DE CLIENTE */}
      {isNewModalOpen && (
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
          <div className="balcao-card animate-fade-in" style={{ width: '100%', maxWidth: 480, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#17181A', margin: 0 }}>{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <p style={{ fontSize: '0.75rem', color: '#667085', margin: 0 }}>{editingCustomer ? 'Atualize os dados cadastrais.' : 'Cadastro rápido de balcão.'}</p>
              </div>
              <button type="button" disabled={isSaving} onClick={() => setIsNewModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', color: '#667085' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: '0.8125rem', outline: 'none', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>WhatsApp *</label>
                  <input
                    type="text"
                    placeholder="(77) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: '0.8125rem', outline: 'none', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: '0.8125rem', outline: 'none', marginTop: 4 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>E-mail (Opcional)</label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: '0.8125rem', outline: 'none', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Observações</label>
                <textarea
                  rows={2}
                  placeholder="Preferências, canal de origem, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: '0.8125rem', outline: 'none', marginTop: 4, resize: 'none' }}
                />
              </div>

              {saveError ? (
                <div role="alert" style={{ padding: '9px 10px', border: '1px solid #FECACA', borderRadius: 6, background: '#FEF2F2', color: '#B91C1C', fontSize: '0.75rem' }}>
                  {saveError}
                </div>
              ) : null}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14, borderTop: '1px solid #E5E7EB', paddingTop: 14, marginTop: 8 }}>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsNewModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#667085', fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button type="submit" className="balcao-btn-primary" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : editingCustomer ? 'Salvar Alterações' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
