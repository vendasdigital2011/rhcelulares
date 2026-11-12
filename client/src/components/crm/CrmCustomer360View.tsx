import React, { useState, useMemo } from 'react';
import {
  Search,
  Phone,
  Mail,
  Smartphone,
  ShoppingBag,
  Wrench,
  MessageSquare,
  UserCheck,
} from 'lucide-react';
import type { Customer, Sale, ServiceOrder, Device } from '../../types.js';

interface CrmCustomer360ViewProps {
  customers: Customer[];
  sales: Sale[];
  serviceOrders: ServiceOrder[];
  devices?: Device[];
  onNavigateToPOS?: (customerName: string) => void;
  onOpenWhatsApp?: (phone: string, customerName: string) => void;
}

export const CrmCustomer360View: React.FC<CrmCustomer360ViewProps> = ({
  customers,
  sales,
  serviceOrders,
  devices: _devices = [],
  onNavigateToPOS,
  onOpenWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'assistance' | 'devices'>('overview');

  // Filtragem dos clientes
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase().trim();
    return customers.filter(c => {
      const matchName = c.name.toLowerCase().includes(term);
      const matchPhone = c.phone.includes(term);
      const matchCpf = c.cpf && c.cpf.includes(term);
      const matchDevice = c.purchasedDevices.some(d => d.model.toLowerCase().includes(term) || (d.imei && d.imei.includes(term)));
      return Boolean(matchName || matchPhone || matchCpf || matchDevice);
    });
  }, [customers, searchTerm]);

  // Se o cliente selecionado não estiver na lista (ou foi filtrado), mantém o primeiro disponível
  const activeCustomer = selectedCustomer || filteredCustomers[0] || null;

  // Vendas do cliente ativo
  const customerSales = useMemo(() => {
    if (!activeCustomer) return [];
    return sales.filter(s => {
      return (
        s.customerId === activeCustomer.id ||
        (s.customerPhone && activeCustomer.phone && s.customerPhone.replace(/\D/g, '') === activeCustomer.phone.replace(/\D/g, '')) ||
        (s.customerName && s.customerName.toLowerCase() === activeCustomer.name.toLowerCase())
      );
    });
  }, [activeCustomer, sales]);

  // Ordens de serviço do cliente ativo
  const customerServiceOrders = useMemo(() => {
    if (!activeCustomer) return [];
    return serviceOrders.filter(os => {
      return (
        os.customerId === activeCustomer.id ||
        (os.customerPhone && activeCustomer.phone && os.customerPhone.replace(/\D/g, '') === activeCustomer.phone.replace(/\D/g, '')) ||
        (os.customerName && os.customerName.toLowerCase() === activeCustomer.name.toLowerCase())
      );
    });
  }, [activeCustomer, serviceOrders]);

  // Disparo de mensagem no WhatsApp
  const handleWhatsApp = (phone: string, name: string) => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp(phone, name);
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(`Olá ${name}! Aqui é da Hiago iPhones. Como podemos ajudar hoje?`);
    window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16, alignItems: 'start' }}>
      {/* COLUNA ESQUERDA: LISTA & BUSCA DE CLIENTES */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 180px)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>Base de Clientes</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6B7280', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: 10 }}>
              {filteredCustomers.length} encontrados
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              padding: '6px 10px',
            }}
          >
            <Search size={14} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone, CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.8125rem',
                width: '100%',
                color: '#111827',
              }}
            />
          </div>
        </div>

        {/* Lista Rolável de Clientes */}
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {filteredCustomers.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', fontSize: '0.8125rem', color: '#9CA3AF' }}>
              Nenhum cliente encontrado
            </div>
          ) : (
            filteredCustomers.map(cust => {
              const isSelected = activeCustomer?.id === cust.id;
              const devCount = cust.purchasedDevices?.length || 0;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid #F3F4F6',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                    borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
                    transition: 'all 0.12s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: isSelected ? 700 : 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cust.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {cust.phone}
                    </span>
                    {devCount > 0 && (
                      <span style={{ fontSize: '0.6875rem', color: '#059669', fontWeight: 600 }}>
                        {cust.purchasedDevices[0].model} {devCount > 1 ? `(+${devCount - 1})` : ''}
                      </span>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827' }}>
                      R$ {cust.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>LTV</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* COLUNA DIREITA: PAINEL 360° DO CLIENTE */}
      {activeCustomer ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* CABEÇALHO DO CLIENTE 360° */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: '#1E293B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.125rem',
                  }}
                >
                  {activeCustomer.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                      {activeCustomer.name}
                    </h2>
                    {activeCustomer.totalSpent > 5000 && (
                      <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                        CLIENTE VIP
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.8125rem', color: '#6B7280', marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={13} color="#2563EB" />
                      {activeCustomer.phone}
                    </span>
                    {activeCustomer.cpf && (
                      <span>CPF: <strong>{activeCustomer.cpf}</strong></span>
                    )}
                    {activeCustomer.email && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={13} />
                        {activeCustomer.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTÕES DE AÇÃO RÁPIDA 1-CLIQUE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => handleWhatsApp(activeCustomer.phone, activeCustomer.name)}
                  style={{
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <MessageSquare size={14} />
                  <span>Conversar no WhatsApp</span>
                </button>

                {onNavigateToPOS && (
                  <button
                    onClick={() => onNavigateToPOS(activeCustomer.name)}
                    style={{
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>Iniciar Venda PDV</span>
                  </button>
                )}
              </div>
            </div>

            {/* MÉTRICAS CHAVE DO CLIENTE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
              <div style={{ backgroundColor: '#F9FAFB', padding: 10, borderRadius: 6 }}>
                <span style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Investido (LTV)</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
                  R$ {activeCustomer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ backgroundColor: '#F9FAFB', padding: 10, borderRadius: 6 }}>
                <span style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Aparelhos em Posse</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
                  {activeCustomer.purchasedDevices.length} aparelho(s)
                </div>
              </div>

              <div style={{ backgroundColor: '#F9FAFB', padding: 10, borderRadius: 6 }}>
                <span style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Vendas Concluídas</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
                  {customerSales.length} compras
                </div>
              </div>

              <div style={{ backgroundColor: '#F9FAFB', padding: 10, borderRadius: 6 }}>
                <span style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Ordens de Serviço</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
                  {customerServiceOrders.length} atendimentos
                </div>
              </div>
            </div>
          </div>

          {/* ABAS DO DETALHAMENTO 360° */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Seletor de Abas */}
            <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #E5E7EB', paddingBottom: 10 }}>
              {[
                { id: 'overview' as const, label: 'Visão Geral', icon: UserCheck },
                { id: 'sales' as const, label: `Histórico de Vendas (${customerSales.length})`, icon: ShoppingBag },
                { id: 'devices' as const, label: `Aparelhos (${activeCustomer.purchasedDevices.length})`, icon: Smartphone },
                { id: 'assistance' as const, label: `Assistência Técnica (${customerServiceOrders.length})`, icon: Wrench },
              ].map(tab => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                      color: isActive ? '#2563EB' : '#4B5563',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* CONTEÚDO DA ABA SELECIONADA */}

            {/* 1. VISÃO GERAL */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activeCustomer.notes && (
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151' }}>Observações do Cliente:</span>
                    <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: 10, fontSize: '0.8125rem', color: '#4B5563', marginTop: 4 }}>
                      {activeCustomer.notes}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* Última Compra */}
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: 12 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShoppingBag size={14} color="#10B981" />
                      Última Compra no PDV
                    </span>
                    {customerSales.length > 0 ? (
                      <div style={{ marginTop: 8, fontSize: '0.8125rem' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>Venda #{customerSales[0].saleNumber || customerSales[0].id.slice(0, 8)}</div>
                        <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>{customerSales[0].date} • {customerSales[0].paymentMethod}</div>
                        <div style={{ color: '#10B981', fontWeight: 800, marginTop: 4 }}>
                          R$ {(customerSales[0].total ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#9CA3AF' }}>Nenhuma venda registrada ainda.</div>
                    )}
                  </div>

                  {/* Último Reparo */}
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: 12 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Wrench size={14} color="#F59E0B" />
                      Último Reparo em Assistência
                    </span>
                    {customerServiceOrders.length > 0 ? (
                      <div style={{ marginTop: 8, fontSize: '0.8125rem' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>OS {customerServiceOrders[0].osNumber} ({customerServiceOrders[0].deviceModel})</div>
                        <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Defeito: {customerServiceOrders[0].reportedIssue || 'Reparo'}</div>
                        <div style={{ color: '#2563EB', fontWeight: 700, marginTop: 4 }}>
                          Status: {customerServiceOrders[0].status}
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#9CA3AF' }}>Nenhum atendimento na bancada registrado.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. HISTÓRICO DE VENDAS (PDV) */}
            {activeTab === 'sales' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {customerSales.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: '0.8125rem' }}>
                    Nenhuma venda vinculada a este cliente.
                  </div>
                ) : (
                  customerSales.map(sale => (
                    <div
                      key={sale.id}
                      style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: 6,
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>
                            Venda #{sale.saleNumber || sale.id.slice(0, 8)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>({sale.date})</span>
                          <span style={{ fontSize: '0.6875rem', backgroundColor: '#EFF6FF', color: '#2563EB', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                            {sale.paymentMethod}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: 4 }}>
                          Itens: {sale.items?.map(i => `${i.name} (${i.quantity}x)`).join(', ') || 'Produtos diversos'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>
                          R$ {(sale.total ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. APARELHOS DO CLIENTE */}
            {activeTab === 'devices' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeCustomer.purchasedDevices.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: '0.8125rem' }}>
                    Nenhum aparelho cadastrado em posse deste cliente.
                  </div>
                ) : (
                  activeCustomer.purchasedDevices.map((dev, idx) => (
                    <div
                      key={dev.imei || idx}
                      style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: 6,
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Smartphone size={18} color="#2563EB" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>
                            {dev.model}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>
                            IMEI: {dev.imei || 'Não informado'} • Bateria: {dev.batteryHealth ? `${dev.batteryHealth}%` : 'N/D'}
                          </div>
                        </div>
                      </div>

                      {dev.value && (
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10B981' }}>
                            R$ {Number(dev.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. ORDENS DE SERVIÇO NA ASSISTÊNCIA */}
            {activeTab === 'assistance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {customerServiceOrders.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: '0.8125rem' }}>
                    Nenhuma Ordem de Serviço aberta ou concluída para este cliente.
                  </div>
                ) : (
                  customerServiceOrders.map(os => (
                    <div
                      key={os.id}
                      style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: 6,
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#2563EB', fontFamily: 'monospace' }}>
                            {os.osNumber}
                          </span>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
                            {os.deviceModel}
                          </span>
                          <span style={{ fontSize: '0.6875rem', backgroundColor: '#F3F4F6', color: '#374151', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                            Status: {os.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: 4 }}>
                          Defeito: {os.reportedIssue || 'Sem defeito relatado'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#111827' }}>
                          R$ {Number(os.finalValue || os.estimatedValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div style={{ fontSize: '0.6875rem', color: '#6B7280' }}>
                          {os.entryDate}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
          Selecione um cliente para ver a Ficha 360°
        </div>
      )}
    </div>
  );
};
