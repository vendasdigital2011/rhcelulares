import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Smartphone, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Battery, 
  Eye, 
  X,
  Phone,
} from 'lucide-react';
import type { Customer } from '../types.js';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onNavigateToPOS?: (customerName: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onAddCustomer,
  onNavigateToPOS,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

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

  const handleOpenWhatsApp = (phone: string, customerName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Olá ${customerName}! Tudo bem? Aqui é da equipe da Hiago iPhones.`);
    window.open(`https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`}?text=${text}`, '_blank');
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      cpf: formData.cpf,
      email: formData.email,
      purchasedDevices: [],
      totalSpent: 0,
      lastPurchaseDate: new Date().toLocaleDateString('pt-BR'),
      notes: formData.notes,
      birthday: formData.birthday,
    };

    onAddCustomer(newCustomer);
    setIsNewModalOpen(false);
    setFormData({ name: '', phone: '', cpf: '', email: '', birthday: '', notes: '' });
  };

  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#10b981',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            GESTÃO COMERCIAL • BASE DE COMPRADORES
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', marginTop: 4 }}>
            Clientes & Ciclo de Vida
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
            Diretório unificado de contatos, histórico de smartphones comprados e saúde da bateria.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#10b981',
            color: '#fff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: 8,
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(16, 185, 129, 0.35)',
          }}
        >
          <Plus size={16} strokeWidth={3} />
          Cadastrar Cliente
        </button>
      </div>

      {/* 3 CARDS DE MÉTRICAS DA BASE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>Base Ativa de Clientes</span>
            <Users size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#f8fafc', marginTop: 8 }}>
            {customers.length} Clientes
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 4, fontWeight: 600 }}>
            100% com WhatsApp cadastrado
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>LTV Médio (Valor por Cliente)</span>
            <DollarSign size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#10b981', marginTop: 8 }}>
            R$ {avgLtv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
            Faturamento acumulado: R$ {totalSpentAll.toLocaleString('pt-BR')}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>iPhones no Ciclo de Troca</span>
            <Smartphone size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#f8fafc', marginTop: 8 }}>
            {totalDevicesSold} Aparelhos
          </div>
          <div style={{ fontSize: '0.72rem', color: '#818cf8', marginTop: 4, fontWeight: 600 }}>
            Monitorados com saúde de bateria
          </div>
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        padding: '8px 16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone, CPF, modelo de iPhone ou IMEI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#f8fafc',
            fontSize: '0.86rem',
            width: '100%',
            outline: 'none',
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* TABELA DE CLIENTES */}
      <div className="glass-panel" style={{ borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.07)', color: '#94a3b8' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Cliente</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>WhatsApp / Telefone</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Último iPhone Comprado</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Total Gasto</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Última Compra</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Ações Rápidas</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((cust) => {
                const latestDevice = cust.purchasedDevices[0];
                return (
                  <tr
                    key={cust.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setSelectedCustomer(cust)}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#f8fafc' }}>{cust.name}</div>
                      {cust.cpf && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>CPF: {cust.cpf}</div>}
                    </td>

                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={13} color="#10b981" />
                        <span>{cust.phone}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      {latestDevice ? (
                        <div>
                          <div style={{ color: '#f8fafc', fontWeight: 600 }}>{latestDevice.model}</div>
                          {latestDevice.batteryHealth && (
                            <div style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Battery size={11} /> Saúde: {latestDevice.batteryHealth}%
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#64748b' }}>Nenhum aparelho</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#10b981' }}>
                      R$ {cust.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        <span>{cust.lastPurchaseDate}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenWhatsApp(cust.phone, cust.name)}
                          title="Abrir conversa no WhatsApp"
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10b981',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                          }}
                        >
                          <MessageSquare size={13} />
                          WhatsApp
                        </button>

                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          title="Ver Ficha Completa"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#cbd5e1',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.74rem',
                          }}
                        >
                          <Eye size={13} />
                          Ficha
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  Nenhum cliente encontrado para os critérios pesquisados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL / GAVETA DE DETALHES DO CLIENTE SELECIONADO */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20,
        }}>
          <div style={{
            background: '#0d121f',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 620,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 26,
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>FICHA PERMANENTE DO CLIENTE</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>{selectedCustomer.name}</h2>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <span>{selectedCustomer.phone}</span>
                  {selectedCustomer.cpf && <span>• CPF: {selectedCustomer.cpf}</span>}
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* APARELHOS VINCULADOS */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Smartphone size={15} color="#38bdf8" />
                Histórico de Smartphones Comprados na Loja
              </div>

              {selectedCustomer.purchasedDevices.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedCustomer.purchasedDevices.map((dev, i) => (
                    <div key={i} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.86rem' }}>{dev.model}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          Comprado em: {dev.purchaseDate} {dev.imei ? `• IMEI: ${dev.imei}` : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.86rem' }}>
                          R$ {dev.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {dev.batteryHealth && (
                          <div style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 700 }}>
                            Bateria: {dev.batteryHealth}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 10, color: '#94a3b8', fontSize: '0.78rem' }}>
                  Nenhum aparelho comprado registrado.
                </div>
              )}
            </div>

            {/* OBSERVAÇÕES & NOTAS */}
            {selectedCustomer.notes && (
              <div style={{ marginTop: 20, background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>NOTAS INTERNAS:</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{selectedCustomer.notes}</div>
              </div>
            )}

            {/* BOTÕES DE AÇÃO */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 16 }}>
              <button
                onClick={() => handleOpenWhatsApp(selectedCustomer.phone, selectedCustomer.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <MessageSquare size={14} />
                Chamar no WhatsApp
              </button>

              {onNavigateToPOS && (
                <button
                  onClick={() => {
                    const name = selectedCustomer.name;
                    setSelectedCustomer(null);
                    onNavigateToPOS(name);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '9px 18px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Nova Venda (PDV)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR NOVO CLIENTE */}
      {isNewModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20,
        }}>
          <form onSubmit={handleSaveCustomer} style={{
            background: '#0d121f',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 520,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>Novo Cliente</h2>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>NOME COMPLETO *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: João da Silva"
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#f8fafc', fontSize: '0.84rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>WHATSAPP / TELEFONE *</label>
                <input
                  required
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+55 77 98844-0000"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#f8fafc', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>CPF (OPCIONAL)</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#f8fafc', fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>E-MAIL</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="cliente@email.com"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#f8fafc', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>DATA ANIVERSÁRIO</label>
                <input
                  type="text"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  placeholder="DD/MM (Ex: 15/08)"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#f8fafc', fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>OBSERVAÇÕES / PREFERÊNCIAS</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Preferências de modelos, cores, histórico..."
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#f8fafc', fontSize: '0.84rem', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', padding: '9px 16px', borderRadius: 8, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Salvar Cliente
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
