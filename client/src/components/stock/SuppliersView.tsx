import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Edit2,
  Trash2,
  Building,
  User,
  ShoppingBag,
  X,
} from 'lucide-react';
import type { Supplier, PhonePurchase } from '../../types.js';

interface SuppliersViewProps {
  suppliers: Supplier[];
  purchases: PhonePurchase[];
  onCreateSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  onUpdateSupplier: (id: string, updates: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  purchases,
  onCreateSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'pj' | 'pf'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierHistory, setSelectedSupplierHistory] = useState<Supplier | null>(null);

  // Formulário
  const [type, setType] = useState<'pj' | 'pf'>('pj');
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [categoryInput, setCategoryInput] = useState('iPhones Novos, Seminovos Atacado');
  const [paymentTerms, setPaymentTerms] = useState('30 dias boleto');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setType('pj');
    setName('');
    setTradeName('');
    setDocument('');
    setPhone('');
    setEmail('');
    setCity('');
    setContactPerson('');
    setCategoryInput('iPhones Novos, Seminovos Atacado');
    setPaymentTerms('30 dias boleto');
    setNotes('');
    setEditingSupplier(null);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !document.trim() || !phone.trim()) return;

    const categories = categoryInput.split(',').map(s => s.trim()).filter(Boolean);

    if (editingSupplier) {
      onUpdateSupplier(editingSupplier.id, {
        type,
        name,
        tradeName: tradeName.trim() || undefined,
        document,
        phone,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        contactPerson: contactPerson.trim() || undefined,
        categories,
        paymentTerms: paymentTerms.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      onCreateSupplier({
        type,
        name,
        tradeName: tradeName.trim() || undefined,
        document,
        phone,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        contactPerson: contactPerson.trim() || undefined,
        categories,
        paymentTerms: paymentTerms.trim() || undefined,
        notes: notes.trim() || undefined,
        status: 'active',
      });
    }

    setShowModal(false);
    resetForm();
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setType(sup.type);
    setName(sup.name);
    setTradeName(sup.tradeName || '');
    setDocument(sup.document);
    setPhone(sup.phone);
    setEmail(sup.email || '');
    setCity(sup.city || '');
    setContactPerson(sup.contactPerson || '');
    setCategoryInput(sup.categories.join(', '));
    setPaymentTerms(sup.paymentTerms || '');
    setNotes(sup.notes || '');
    setShowModal(true);
  };

  const filteredSuppliers = suppliers.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      s.name.toLowerCase().includes(q) ||
      (s.tradeName && s.tradeName.toLowerCase().includes(q)) ||
      s.document.includes(q) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      s.categories.some(c => c.toLowerCase().includes(q));

    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            GESTÃO DE PARCEIROS & COMPRAS
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Fornecedores de Aparelhos e Peças
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Cadastro de distribuidores de atacado, importadoras e parceiros de assistência técnica com condições comerciais.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
            color: '#fff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: 8,
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(234, 179, 8, 0.35)',
          }}
        >
          <Plus size={16} />
          <span>+ Novo Fornecedor</span>
        </button>
      </div>

      {/* FILTROS E PESQUISA */}
      <div className="glass-panel" style={{ padding: 16, borderRadius: 12, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="Buscar por razão social, nome fantasia, CNPJ/CPF, cidade ou categoria..."
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
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
          <option value="all">Todos os Tipos ({suppliers.length})</option>
          <option value="pj">Pessoa Jurídica (CNPJ)</option>
          <option value="pf">Pessoa Física (Parceiros)</option>
        </select>
      </div>

      {/* GRID DE CARDS DOS FORNECEDORES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {filteredSuppliers.map((sup) => {
          const supplierPurchases = purchases.filter(p => p.supplierId === sup.id || p.customer === sup.name);
          const totalSpent = supplierPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
          const cleanPhone = sup.phone.replace(/\D/g, '');

          return (
            <div
              key={sup.id}
              className="glass-panel"
              style={{
                background: '#0d121f',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: 'rgba(234, 179, 8, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#eab308',
                    }}>
                      {sup.type === 'pj' ? <Building size={20} /> : <User size={20} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                        {sup.tradeName || sup.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 1 }}>
                        {sup.document} • {sup.city || 'Brasil'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => handleOpenEdit(sup)}
                      title="Editar Fornecedor"
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja remover o fornecedor ${sup.name}?`)) {
                          onDeleteSupplier(sup.id);
                        }
                      }}
                      title="Excluir Fornecedor"
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Categorias fornecidas */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 14 }}>
                  {sup.categories.map((cat, i) => (
                    <span
                      key={i}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontWeight: 600,
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Informações Comerciais */}
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem' }}>
                  {sup.contactPerson && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Contato:</span>
                      <strong style={{ color: '#f8fafc' }}>{sup.contactPerson}</strong>
                    </div>
                  )}
                  {sup.paymentTerms && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Condições:</span>
                      <span style={{ color: '#cbd5e1' }}>{sup.paymentTerms}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Total Comprado:</span>
                    <strong style={{ color: '#10b981' }}>R$ {totalSpent.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', marginTop: 16, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedSupplierHistory(sup)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ShoppingBag size={13} /> {supplierPurchases.length} Compra(s)
                </button>

                {cleanPhone && (
                  <button
                    onClick={() => window.open(`https://wa.me/55${cleanPhone}`, '_blank')}
                    style={{
                      background: 'rgba(37, 211, 102, 0.15)',
                      color: '#25d366',
                      border: '1px solid rgba(37, 211, 102, 0.3)',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO DE FORNECEDOR */}
      {showModal && (
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
                {editingSupplier ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setType('pj')}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    border: type === 'pj' ? '2px solid #eab308' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: type === 'pj' ? 'rgba(234, 179, 8, 0.15)' : 'transparent',
                    color: type === 'pj' ? '#eab308' : '#cbd5e1',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Pessoa Jurídica (CNPJ)
                </button>
                <button
                  type="button"
                  onClick={() => setType('pf')}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    border: type === 'pf' ? '2px solid #eab308' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: type === 'pf' ? 'rgba(234, 179, 8, 0.15)' : 'transparent',
                    color: type === 'pf' ? '#eab308' : '#cbd5e1',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Pessoa Física (CPF)
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Razão Social / Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Distribuidora Alpha SP Ltda"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Nome Fantasia</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="Alpha SP"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>CNPJ ou CPF *</label>
                  <input
                    type="text"
                    required
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="12.345.678/0001-90"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Cidade / UF</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo - SP"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>E-mail Comercial</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendas@alphasp.com.br"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Contato Comercial</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Rodrigo Vendas"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Categorias Fornecidas (separadas por vírgula)</label>
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="iPhones Novos, Seminovos Atacado, Peças"
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Condições Comerciais e Prazos</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="ex: 30 dias no boleto, ou PIX à vista com 3% desc"
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '9px 18px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', border: 'none', color: '#fff', padding: '9px 24px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  {editingSupplier ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE HISTÓRICO DE COMPRAS DO FORNECEDOR */}
      {selectedSupplierHistory && (
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
            padding: 24,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                  Histórico de Compras • {selectedSupplierHistory.name}
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedSupplierHistory.document}</div>
              </div>
              <button
                onClick={() => setSelectedSupplierHistory(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {purchases.filter(p => p.supplierId === selectedSupplierHistory.id || p.customer === selectedSupplierHistory.name).length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                Nenhuma compra registrada para este fornecedor até o momento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {purchases.filter(p => p.supplierId === selectedSupplierHistory.id || p.customer === selectedSupplierHistory.name).map((cp) => (
                  <div
                    key={cp.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 10,
                      padding: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: '#38bdf8' }}>{cp.purchaseNumber}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                        {cp.date} • {cp.items.length} item(ns)
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                        {cp.items.map(it => it.model).join(', ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f97316' }}>
                        R$ {cp.totalAmount.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981' }}>{cp.paymentMethod}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
