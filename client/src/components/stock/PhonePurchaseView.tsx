import { useState } from 'react';
import {
  Plus,
  Search,
  ShieldAlert,
  FileText,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Printer,
} from 'lucide-react';
import type { PhonePurchase, PhonePurchaseItem, Supplier } from '../../types.js';
import { validateIMEI } from '../../utils/validators.js';

interface PhonePurchaseViewProps {
  purchases: PhonePurchase[];
  suppliers: Supplier[];
  onCreatePurchase: (purchase: Omit<PhonePurchase, 'id' | 'createdAt'>) => void;
  onConfirmPurchase: (id: string) => void;
}

export const PhonePurchaseView: React.FC<PhonePurchaseViewProps> = ({
  purchases,
  suppliers,
  onCreatePurchase,
  onConfirmPurchase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'confirmed'>('all');
  const [showModal, setShowModal] = useState(false);
  const [viewingContract, setViewingContract] = useState<PhonePurchase | null>(null);

  // Estados do formulário de nova compra
  const [sellerType, setSellerType] = useState<'pf' | 'pj'>('pf');
  const [customerName, setCustomerName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [status, setStatus] = useState<'draft' | 'confirmed'>('confirmed');
  const [notes, setNotes] = useState('');
  const [additionalExpenses, setAdditionalExpenses] = useState(0);
  const [discounts, setDiscounts] = useState(0);

  // Lista de itens/aparelhos da compra
  const [items, setItems] = useState<PhonePurchaseItem[]>([
    {
      model: 'iPhone 13 128GB',
      storage: '128GB',
      color: 'Meia-noite',
      imei: '',
      condition: 'certified_pre_owned',
      batteryHealth: 88,
      costPrice: 2100,
      sellPrice: 2890,
    },
  ]);

  const [formError, setFormError] = useState<string | null>(null);

  const addItem = () => {
    setItems((prev: PhonePurchaseItem[]) => [
      ...prev,
      {
        model: 'iPhone 12 64GB',
        storage: '64GB',
        color: 'Azul',
        imei: '',
        condition: 'certified_pre_owned',
        batteryHealth: 84,
        costPrice: 1500,
        sellPrice: 2190,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev: PhonePurchaseItem[]) => prev.filter((_: PhonePurchaseItem, i: number) => i !== index));
  };

  const updateItem = (index: number, field: keyof PhonePurchaseItem, value: any) => {
    setItems((prev: PhonePurchaseItem[]) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const calculateSubtotal = () => {
    return items.reduce((sum: number, item: PhonePurchaseItem) => sum + (Number(item.costPrice) || 0), 0);
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() + Number(additionalExpenses) - Number(discounts));
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const sellerTitle = sellerType === 'pj' 
      ? (suppliers.find(s => s.id === selectedSupplierId)?.name || 'Fornecedor PJ')
      : customerName.trim();

    if (!sellerTitle) {
      setFormError('Informe o nome do vendedor (Pessoa Física) ou selecione um fornecedor cadastrado.');
      return;
    }

    // Valida IMEIs dos aparelhos
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const cleanImei = it.imei.replace(/\D/g, '');
      if (!cleanImei || cleanImei.length !== 15) {
        setFormError(`Item ${i + 1} (${it.model}): O IMEI deve conter exatamente 15 dígitos.`);
        return;
      }
      if (!validateIMEI(cleanImei)) {
        setFormError(`Item ${i + 1} (${it.model}): IMEI ${cleanImei} inválido pelo algoritmo de Luhn.`);
        return;
      }
    }

    const purchasePayload: Omit<PhonePurchase, 'id' | 'createdAt'> = {
      purchaseNumber: `CP-${1080 + purchases.length + 1}`,
      date: new Date().toLocaleDateString('pt-BR'),
      supplierId: sellerType === 'pj' ? selectedSupplierId : undefined,
      customer: sellerTitle,
      cpf: sellerType === 'pf' ? cpf : undefined,
      phone: sellerType === 'pf' ? phone : undefined,
      address: sellerType === 'pf' ? address : undefined,
      seller: 'Hiago (Responsável)',
      items: items.map((it: PhonePurchaseItem) => ({ ...it, imei: it.imei.replace(/\D/g, '') })),
      subtotal: calculateSubtotal(),
      additionalExpenses: Number(additionalExpenses) || 0,
      discounts: Number(discounts) || 0,
      totalAmount: calculateTotal(),
      paymentMethod,
      paymentStatus,
      status,
      notes: notes.trim() || undefined,
      hasContract: true,
    };

    onCreatePurchase(purchasePayload);
    setShowModal(false);
  };

  const filteredPurchases = purchases.filter(cp => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      cp.purchaseNumber.toLowerCase().includes(q) ||
      cp.customer.toLowerCase().includes(q) ||
      (cp.cpf && cp.cpf.includes(q)) ||
      cp.items.some(i => i.model.toLowerCase().includes(q) || i.imei.includes(q));

    const matchesStatus = statusFilter === 'all' || cp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            AQUISIÇÕES & TRADE-IN
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Compra de Telefone
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Avaliação e compra de seminovos de clientes (balcão), lote de atacado e geração de termo de compra e venda.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => window.open('https://consultaserialaparelho.com.br/', '_blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '9px 14px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ShieldAlert size={15} />
            <span>Consultar Bloqueio IMEI (Anatel)</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
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
            <span>+ Nova Compra de Telefone</span>
          </button>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="glass-panel" style={{ padding: 16, borderRadius: 12, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="Buscar por número (CP-XXXX), vendedor, CPF ou modelo..."
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
          <option value="all">Todas as Compras ({purchases.length})</option>
          <option value="confirmed">Apenas Confirmadas (Em Estoque)</option>
          <option value="draft">Rascunhos (Em Avaliação)</option>
        </select>
      </div>

      {/* LISTAGEM DE COMPRAS */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Nº Compra / Data</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Vendedor / Origem</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Aparelho(s) Adquirido(s)</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Valor Total</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Pagamento</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Situação</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
                  Nenhuma compra de telefone registrada.
                </td>
              </tr>
            ) : (
              filteredPurchases.map((cp) => (
                <tr key={cp.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#38bdf8' }}>{cp.purchaseNumber}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{cp.date}</div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700 }}>{cp.customer}</div>
                    {cp.cpf && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>CPF: {cp.cpf}</div>}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {cp.items.map((it, idx) => (
                      <div key={idx} style={{ marginBottom: 2 }}>
                        <span style={{ fontWeight: 700 }}>{it.model}</span>{' '}
                        <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                          ({it.imei})
                        </span>{' '}
                        {it.batteryHealth && (
                          <span style={{ fontSize: '0.68rem', color: '#10b981' }}>{it.batteryHealth}%</span>
                        )}
                      </div>
                    ))}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#f97316', fontSize: '0.85rem' }}>
                      R$ {cp.totalAmount.toFixed(2)}
                    </div>
                    {cp.discounts > 0 && (
                      <div style={{ fontSize: '0.68rem', color: '#10b981' }}>Desc: R$ {cp.discounts.toFixed(2)}</div>
                    )}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: cp.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: cp.paymentStatus === 'paid' ? '#10b981' : '#eab308',
                    }}>
                      {cp.paymentStatus === 'paid' ? 'Pago' : 'Pendente'} • {cp.paymentMethod}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: cp.status === 'confirmed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: cp.status === 'confirmed' ? '#10b981' : '#f59e0b',
                    }}>
                      {cp.status === 'confirmed' ? 'CONFIRMADA' : 'RASCUNHO'}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      {cp.status === 'draft' && (
                        <button
                          onClick={() => onConfirmPurchase(cp.id)}
                          title="Confirmar Entrada no Estoque"
                          style={{
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Check size={12} /> Confirmar
                        </button>
                      )}

                      <button
                        onClick={() => setViewingContract(cp)}
                        title="Ver Termo de Compra e Venda"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#cbd5e1',
                          padding: '5px 8px',
                          borderRadius: 6,
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <FileText size={13} /> Termo
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE NOVA COMPRA */}
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
            maxWidth: 720,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                  Registrar Compra de Telefone
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                  Entrada de aparelhos novos ou seminovos com contrato de compra e venda legal.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSavePurchase} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Tipo de Vendedor */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Origem da Aquisição</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setSellerType('pf')}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: sellerType === 'pf' ? '2px solid #f97316' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: sellerType === 'pf' ? 'rgba(249, 115, 22, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      color: '#f8fafc',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    Pessoa Física (Cliente Balcão / Trade-In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSellerType('pj')}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: sellerType === 'pj' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: sellerType === 'pj' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      color: '#f8fafc',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    Fornecedor PJ (Distribuidor / Importador)
                  </button>
                </div>
              </div>

              {sellerType === 'pf' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Nome do Cliente *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nome completo do vendedor"
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>CPF do Cliente</label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Telefone WhatsApp</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(77) 99999-9999"
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 3' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Endereço Residencial do Vendedor</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Selecione o Fornecedor PJ *</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    required
                    style={{ width: '100%', background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  >
                    <option value="">Selecione um fornecedor...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.document})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* ITENS DA COMPRA */}
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase' }}>
                    Aparelho(s) a Adquirir ({items.length})
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    style={{ background: 'transparent', border: 'none', color: '#10b981', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={14} /> + Adicionar Outro Aparelho
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((it: PhonePurchaseItem, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 10,
                        padding: 12,
                        position: 'relative',
                      }}
                    >
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          style={{ position: 'absolute', right: 10, top: 10, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: 8 }}>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Modelo</label>
                          <input
                            type="text"
                            required
                            value={it.model}
                            onChange={(e) => updateItem(idx, 'model', e.target.value)}
                            placeholder="ex: iPhone 13 128GB"
                            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: '0.78rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Cor</label>
                          <input
                            type="text"
                            value={it.color}
                            onChange={(e) => updateItem(idx, 'color', e.target.value)}
                            placeholder="Azul"
                            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: '0.78rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Bateria (%)</label>
                          <input
                            type="number"
                            min={40}
                            max={100}
                            value={it.batteryHealth || 85}
                            onChange={(e) => updateItem(idx, 'batteryHealth', Number(e.target.value))}
                            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: '0.78rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>IMEI (15 dígitos) *</label>
                          <input
                            type="text"
                            required
                            maxLength={15}
                            value={it.imei}
                            onChange={(e) => updateItem(idx, 'imei', e.target.value.replace(/\D/g, ''))}
                            placeholder="359182736450192"
                            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#38bdf8', fontFamily: 'monospace', padding: '6px 10px', borderRadius: 6, fontSize: '0.78rem' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Valor Pago / Custo (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={it.costPrice}
                            onChange={(e) => updateItem(idx, 'costPrice', Number(e.target.value))}
                            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: '0.78rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Preço Futuro de Venda (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={it.sellPrice}
                            onChange={(e) => updateItem(idx, 'sellPrice', Number(e.target.value))}
                            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f97316', fontWeight: 800, padding: '6px 10px', borderRadius: 6, fontSize: '0.78rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VALORES E PAGAMENTO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 4 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '100%', background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 10px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  >
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro Físico</option>
                    <option value="Transferência">Transferência Bancária</option>
                    <option value="Boleto Faturado">Boleto Faturado</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Status Financeiro</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    style={{ width: '100%', background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 10px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  >
                    <option value="paid">Pago Imediatamente (Lança Saída no Caixa)</option>
                    <option value="pending">Pendente (A Pagar)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Situação da Compra</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={{ width: '100%', background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 10px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  >
                    <option value="confirmed">Confirmada (Já Entra no Estoque Disponível)</option>
                    <option value="draft">Rascunho (Não entra no estoque ainda)</option>
                  </select>
                </div>
              </div>

              {/* DESPESAS ADICIONAIS, DESCONTOS E OBSERVAÇÕES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 10, marginTop: 4 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Despesas Adicionais (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={additionalExpenses}
                    onChange={(e) => setAdditionalExpenses(Number(e.target.value))}
                    placeholder="0.00"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 10px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Descontos / Negociação (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={discounts}
                    onChange={(e) => setDiscounts(Number(e.target.value))}
                    placeholder="0.00"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 10px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>Observações Internas</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Aparelho impecável com cabo original"
                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '8px 10px', borderRadius: 8, fontSize: '0.8rem', marginTop: 4 }}
                  />
                </div>
              </div>

              {/* TOTAL RESUMO */}
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 10, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>
                  Total a Pagar ({items.length} aparelho(s)):
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f97316' }}>
                  R$ {calculateTotal().toFixed(2)}
                </span>
              </div>

              {/* BOTÕES */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '9px 18px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', border: 'none', color: '#fff', padding: '9px 24px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Confirmar e Salvar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE TERMO DE COMPRA E VENDA */}
      {viewingContract && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: 20,
        }}>
          <div className="glass-panel" style={{
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: 12,
            maxWidth: 600,
            width: '100%',
            padding: 28,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>TERMO DE COMPRA E VENDA E PROCEDÊNCIA</h2>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>CRM Hiago iPhones • Operação {viewingContract.purchaseNumber}</div>
            </div>

            <div style={{ fontSize: '0.8rem', lineHeight: 1.6, color: '#334155' }}>
              <p>
                Pelo presente instrumento, <strong>{viewingContract.customer}</strong>
                {viewingContract.cpf ? `, portador(a) do CPF nº ${viewingContract.cpf}` : ''}, declara sob as penas da lei que é o legítimo proprietário dos seguintes aparelhos entregues à <strong>Hiago iPhones</strong>:
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, margin: '12px 0' }}>
                {viewingContract.items.map((it: PhonePurchaseItem, i: number) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    <strong>{it.model}</strong> ({it.color}) — IMEI: <code>{it.imei}</code> — Avaliado em R$ {it.costPrice.toFixed(2)}
                  </div>
                ))}
              </div>

              <p>
                O(A) VENDEDOR(A) atesta que os bens estão livres de quaisquer ônus, gravames, queixas de roubo/furto ou alienação fiduciária, responsabilizando-se civil e criminalmente pela procedência dos mesmos.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                <span>Valor Total da Transação:</span>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>R$ {viewingContract.totalAmount.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Forma de Liquidação:</span>
                <span>{viewingContract.paymentMethod} ({viewingContract.paymentStatus === 'paid' ? 'Liquidado' : 'A pagar'})</span>
              </div>
            </div>

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: 16 }}>
              <div style={{ width: '45%', borderTop: '1px solid #94a3b8', textAlign: 'center', fontSize: '0.72rem', color: '#64748b', paddingTop: 4 }}>
                Assinatura do Vendedor
              </div>
              <div style={{ width: '45%', borderTop: '1px solid #94a3b8', textAlign: 'center', fontSize: '0.72rem', color: '#64748b', paddingTop: 4 }}>
                Hiago iPhones (Comprador)
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => window.print()}
                style={{
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Printer size={14} /> Imprimir Termo
              </button>
              <button
                onClick={() => setViewingContract(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
