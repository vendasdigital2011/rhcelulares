import { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Smartphone, Package, Wrench, 
  Trash2, CheckCircle2, User, AlertTriangle, Printer, MessageSquare, Unlock
} from 'lucide-react';
import type { Device, Accessory, ServiceOrder, SaleItem, TradeInEntry, Customer } from '../types.js';
import { validatePhoneBR } from '../utils/validators.js';

interface CheckoutViewProps {
  devices: Device[];
  accessories: Accessory[];
  serviceOrders: ServiceOrder[];
  customers?: Customer[];
  isCashOpen?: boolean;
  onOpenCash?: () => void;
  onCompleteSale: (saleData: any) => Promise<void> | void;
  onNavigateToWarranty?: () => void;
}

export const CheckoutView = ({
  devices,
  accessories,
  serviceOrders,
  customers = [],
  isCashOpen = true,
  onOpenCash,
  onCompleteSale,
  onNavigateToWarranty,
}: CheckoutViewProps) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerSearchDropdown, setCustomerSearchDropdown] = useState(false);
  const [sellerName, setSellerName] = useState('Hiago (Responsável)');
  const [saleDate, setSaleDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSaleModal, setCompletedSaleModal] = useState<any | null>(null);

  // Pagamento em Dinheiro & Troco
  const [cashReceived, setCashReceived] = useState<number>(0);

  // Aba ativa: 'devices' | 'accessories' | 'services'
  const [activeItemType, setActiveItemType] = useState<'devices' | 'accessories' | 'services'>('devices');

  // Itens adicionados ao carrinho da venda
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);

  // Trade-in (Aparelho de entrada)
  const [hasTradeIn, setHasTradeIn] = useState(false);
  const [tradeInModel, setTradeInModel] = useState('');
  const [tradeInImei, setTradeInImei] = useState('');
  const [tradeInBattery, setTradeInBattery] = useState<number>(82);
  const [tradeInValue, setTradeInValue] = useState<number>(0);

  // Pagamento e Desconto
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cartão de Crédito 12x');
  const [installments] = useState<number>(12);

  // Filtros de busca
  const [deviceSearch, setDeviceSearch] = useState('');
  const [accessorySearch, setAccessorySearch] = useState('');

  // Adicionar Aparelho ao carrinho
  const handleAddDevice = (device: Device) => {
    if (cartItems.some(i => i.imei === device.imei)) return;
    setCartItems(prev => [
      ...prev,
      {
        id: device.id,
        type: 'device',
        name: `${device.model} ${device.storage} - ${device.color} (${device.condition === 'new_sealed' ? 'Lacrado' : `Seminovo ${device.batteryHealth}%`})`,
        price: device.sellPrice,
        quantity: 1,
        imei: device.imei,
      },
    ]);
  };

  // Adicionar Acessório ao carrinho
  const handleAddAccessory = (acc: Accessory) => {
    const existing = cartItems.find(i => i.id === acc.id);
    if (existing) {
      setCartItems(prev => prev.map(i => i.id === acc.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCartItems(prev => [
        ...prev,
        {
          id: acc.id,
          type: 'accessory',
          name: acc.name,
          price: acc.sellPrice,
          quantity: 1,
        },
      ]);
    }
  };

  // Remover item do carrinho
  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  // Totais
  const subtotal = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const total = Math.max(0, subtotal - (hasTradeIn ? tradeInValue : 0) - discount);
  const changeAmount = paymentMethod === 'Dinheiro' && cashReceived > total ? cashReceived - total : 0;

  const handleFinishSale = async () => {
    if (isSubmitting) return;

    if (!isCashOpen) {
      alert('⚠️ O caixa da loja está FECHADO. Abra o caixa antes de faturar a venda para garantir o registro financeiro correto.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Adicione ao menos um item à venda antes de prosseguir.');
      return;
    }

    if (customerPhone && customerPhone.trim().length > 0) {
      const phoneValidation = validatePhoneBR(customerPhone);
      if (!phoneValidation.isValid) {
        if (!confirm(`Aviso: ${phoneValidation.error}. Deseja prosseguir mesmo assim?`)) {
          return;
        }
      }
    }

    if (paymentMethod === 'Dinheiro' && cashReceived > 0 && cashReceived < total) {
      alert(`O valor entregue em dinheiro (R$ ${cashReceived.toFixed(2)}) é menor que o total da venda (R$ ${total.toFixed(2)}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      const tradeInData: TradeInEntry | undefined = hasTradeIn && tradeInModel ? {
        model: tradeInModel,
        imei: tradeInImei || undefined,
        batteryHealth: tradeInBattery,
        evaluatedValue: tradeInValue,
      } : undefined;

      const salePayload = {
        customerId: selectedCustomerId || undefined,
        customerName: customerName.trim() || 'Consumidor Final',
        customerPhone: customerPhone.trim(),
        sellerName,
        date: saleDate,
        items: cartItems,
        tradeIn: tradeInData,
        subtotal,
        discount,
        total,
        paymentMethod,
        installments: paymentMethod.includes('Cartão') ? installments : undefined,
      };

      await onCompleteSale(salePayload);

      // Abre modal com comprovante e ações
      setCompletedSaleModal({
        ...salePayload,
        changeAmount,
        cashReceived: paymentMethod === 'Dinheiro' ? cashReceived : undefined,
      });

      // Limpa formulário
      setCartItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setSelectedCustomerId(null);
      setHasTradeIn(false);
      setTradeInModel('');
      setTradeInValue(0);
      setDiscount(0);
      setCashReceived(0);
    } catch (err: any) {
      alert('Erro ao processar venda: ' + (err.message || 'Falha de comunicação'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDevices = devices.filter(d => 
    d.status === 'available' &&
    (!deviceSearch || d.model.toLowerCase().includes(deviceSearch.toLowerCase()) || d.imei?.includes(deviceSearch))
  );

  const filteredAccessories = accessories.filter(a =>
    !accessorySearch || a.name.toLowerCase().includes(accessorySearch.toLowerCase())
  );

  return (
    <div style={{
      padding: '24px 32px',
      maxWidth: 1280,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* Título do Checkout Rápido */}
      <div>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#f97316',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          CHECKOUT RÁPIDO
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
          Nova venda
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
          Venda aparelhos, acessórios e serviços de assistência no mesmo atendimento.
        </p>
      </div>

      {/* Alerta de Caixa Fechado */}
      {!isCashOpen && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 12,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} color="#ef4444" />
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f87171' }}>
                Atenção: O Caixa da Loja está Fechado
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                Para conformidade fiscal e auditoria de sangrias, abra o caixa antes de faturar a venda.
              </div>
            </div>
          </div>
          {onOpenCash && (
            <button
              onClick={onOpenCash}
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Unlock size={14} />
              Abrir Caixa Agora
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'flex-start' }}>
        {/* COLUNA ESQUERDA: CLIENTE, ITENS E TRADE-IN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Card de Identificação do Cliente */}
          <div className="glass-panel" style={{ padding: 18, borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} color="#f97316" />
                Cliente da venda
              </label>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {customers.length > 0 ? `${customers.length} clientes na base` : 'Consumidor Final'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12, marginTop: 10, position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Buscar ou digitar nome do cliente..."
                  value={customerName}
                  onFocus={() => setCustomerSearchDropdown(true)}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setCustomerSearchDropdown(true);
                    setSelectedCustomerId(null);
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />

                {/* Dropdown de sugestão de clientes existentes */}
                {customerSearchDropdown && customerName.trim().length > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    background: '#0d1322',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                    zIndex: 50,
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}>
                    {customers
                      .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()) || c.phone.includes(customerName))
                      .slice(0, 5)
                      .map(c => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setCustomerName(c.name);
                            setCustomerPhone(c.phone);
                            setSelectedCustomerId(c.id);
                            setCustomerSearchDropdown(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{c.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{c.phone}</div>
                          </div>
                          <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>Selecionar</span>
                        </div>
                      ))}
                    <div
                      onClick={() => setCustomerSearchDropdown(false)}
                      style={{ padding: '6px 12px', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                    >
                      Fechar sugestões
                    </div>
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="WhatsApp (ex: 77 98844-2211)..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Vendedor e Data da Operação */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Vendedor responsável</label>
                <select
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0d121f',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                >
                  <option value="Hiago (Responsável)">Hiago (Responsável)</option>
                  <option value="Lucas Vendedor">Lucas Vendedor</option>
                  <option value="Camila Gerente">Camila Gerente</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Data da venda</label>
                <input
                  type="text"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* O QUE SERÁ VENDIDO? (3 BOTÕES IDÊNTICOS AOS PRINTS: APARELHOS, ACESSÓRIOS, ASSISTÊNCIA) */}
          <div className="glass-panel" style={{ padding: 18, borderRadius: 14 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              O que será vendido?
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
              <button
                onClick={() => setActiveItemType('devices')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: activeItemType === 'devices' ? '2px solid #f97316' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: activeItemType === 'devices' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'rgba(255, 255, 255, 0.03)',
                  color: activeItemType === 'devices' ? '#ffffff' : '#94a3b8',
                  boxShadow: activeItemType === 'devices' ? '0 2px 10px rgba(249, 115, 22, 0.3)' : 'none',
                }}
              >
                <Smartphone size={16} />
                Aparelhos
              </button>

              <button
                onClick={() => setActiveItemType('accessories')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: activeItemType === 'accessories' ? '2px solid #f97316' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: activeItemType === 'accessories' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'rgba(255, 255, 255, 0.03)',
                  color: activeItemType === 'accessories' ? '#ffffff' : '#94a3b8',
                  boxShadow: activeItemType === 'accessories' ? '0 2px 10px rgba(249, 115, 22, 0.3)' : 'none',
                }}
              >
                <Package size={16} />
                Acessórios
              </button>

              <button
                onClick={() => setActiveItemType('services')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: activeItemType === 'services' ? '2px solid #f97316' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: activeItemType === 'services' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'rgba(255, 255, 255, 0.03)',
                  color: activeItemType === 'services' ? '#ffffff' : '#94a3b8',
                  boxShadow: activeItemType === 'services' ? '0 2px 10px rgba(249, 115, 22, 0.3)' : 'none',
                }}
              >
                <Wrench size={16} />
                Assistência
              </button>
            </div>

            {/* SELEÇÃO DE APARELHOS DO ESTOQUE */}
            {activeItemType === 'devices' && (
              <div style={{ marginTop: 16 }}>
                <input
                  type="text"
                  placeholder="Buscar aparelho por modelo, IMEI ou cor..."
                  value={deviceSearch}
                  onChange={(e) => setDeviceSearch(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    marginBottom: 10,
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {availableDevices.map((dev) => (
                    <div
                      key={dev.id}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                          {dev.model} {dev.storage} ({dev.color})
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                          IMEI: {dev.imei} • {dev.condition === 'new_sealed' ? 'Lacrado (Novo)' : `Seminovo (Bateria ${dev.batteryHealth}%)`}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>
                          R$ {dev.sellPrice.toLocaleString('pt-BR')}
                        </div>
                        <button
                          onClick={() => handleAddDevice(dev)}
                          style={{
                            background: '#f97316',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          + Adicionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SELEÇÃO DE ACESSÓRIOS */}
            {activeItemType === 'accessories' && (
              <div style={{ marginTop: 16 }}>
                <input
                  type="text"
                  placeholder="Buscar acessório por nome ou categoria..."
                  value={accessorySearch}
                  onChange={(e) => setAccessorySearch(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    marginBottom: 10,
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {filteredAccessories.map((acc) => (
                    <div
                      key={acc.id}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                          {acc.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          Estoque: {acc.stock} unidades
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>
                          R$ {acc.sellPrice.toLocaleString('pt-BR')}
                        </div>
                        <button
                          onClick={() => handleAddAccessory(acc)}
                          style={{
                            background: '#f97316',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          + Adicionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SELEÇÃO DE ASSISTÊNCIA */}
            {activeItemType === 'services' && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 10 }}>
                  Ordens de Serviço prontas para faturamento:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {serviceOrders.filter(os => os.status === 'ready').map(os => (
                    <div
                      key={os.id}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(6, 182, 212, 0.05)',
                        borderRadius: 8,
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                          {os.osNumber} - {os.deviceModel} ({os.customerName})
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#06b6d4' }}>
                          {os.serviceExecuted || os.reportedIssue}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>
                          R$ {os.finalValue || os.estimatedValue}
                        </div>
                        <button
                          onClick={() => {
                            setCartItems(prev => [
                              ...prev,
                              {
                                id: os.id,
                                type: 'service',
                                name: `Serviço ${os.osNumber} (${os.deviceModel}) - ${os.serviceExecuted}`,
                                price: os.finalValue || os.estimatedValue,
                                quantity: 1,
                              },
                            ]);
                          }}
                          style={{
                            background: '#06b6d4',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          + Vincular O.S.
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TRADE-IN (APARELHO DE ENTRADA / TROCA COM VOLTA) */}
          <div className="glass-panel" style={{ padding: 18, borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasTradeIn}
                  onChange={(e) => setHasTradeIn(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#f97316' }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                  🔄 Receber aparelho usado na troca (Trade-in / Troca com Volta)
                </span>
              </label>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                Abate direto do valor total
              </span>
            </div>

            {hasTradeIn && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 12, marginTop: 14 }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Modelo de entrada</label>
                  <input
                    type="text"
                    placeholder="Ex: iPhone 11 64GB Preto"
                    value={tradeInModel}
                    onChange={(e) => setTradeInModel(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      marginTop: 4,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>IMEI do usado</label>
                  <input
                    type="text"
                    placeholder="Ex: 354019283746510"
                    value={tradeInImei}
                    onChange={(e) => setTradeInImei(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      marginTop: 4,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Bateria do usado (%)</label>
                  <input
                    type="number"
                    value={tradeInBattery}
                    onChange={(e) => setTradeInBattery(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      marginTop: 4,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Valor de avaliação (R$)</label>
                  <input
                    type="number"
                    placeholder="Ex: 1200"
                    value={tradeInValue}
                    onChange={(e) => setTradeInValue(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#10b981',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      marginTop: 4,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: RESUMO DA VENDA E FINALIZAÇÃO */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 10 }}>
            Resumo da venda
          </h3>

          {/* Lista de Itens no Carrinho */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.8rem' }}>
                Nenhum item adicionado à venda ainda.
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ flex: 1, paddingRight: 8 }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {item.quantity}x R$ {item.price.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, color: '#f8fafc' }}>
                      R$ {(item.price * item.quantity).toLocaleString('pt-BR')}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discriminativo Financeiro */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94a3b8' }}>
              <span>Subtotal:</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            {hasTradeIn && tradeInValue > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#10b981' }}>
                <span>Entrada ({tradeInModel}):</span>
                <span style={{ fontWeight: 700 }}>- R$ {tradeInValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
              <span>Desconto (R$):</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                style={{
                  width: 80,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  textAlign: 'right',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#f8fafc',
              paddingTop: 8,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <span>Total:</span>
              <span style={{ color: '#10b981' }}>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Forma de pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: '100%',
                background: '#0d121f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: '9px 12px',
                color: '#fff',
                fontSize: '0.82rem',
                marginTop: 4,
                outline: 'none',
              }}
            >
              <option value="Cartão de Crédito 12x">Cartão de Crédito 12x (com taxa da máquina)</option>
              <option value="Cartão de Crédito 18x">Cartão de Crédito 18x</option>
              <option value="Pix">Pix à vista</option>
              <option value="Dinheiro">Dinheiro físico (Gaveta)</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
              <option value="Financiamento">Financiamento / Boleto</option>
            </select>
          </div>

          {/* Seletor de Troco para Dinheiro Físico */}
          {paymentMethod === 'Dinheiro' && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 10,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>
                  Valor Entregue pelo Cliente (R$):
                </label>
                <input
                  type="number"
                  placeholder={`Mín. ${total}`}
                  value={cashReceived || ''}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  style={{
                    width: 100,
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    color: '#fff',
                    textAlign: 'right',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              {cashReceived > total && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px dashed rgba(245, 158, 11, 0.3)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Troco a Devolver:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: '#10b981' }}>
                    R$ {changeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Botão Finalizar Venda com Prevenção de Múltiplos Cliques */}
          <button
            onClick={handleFinishSale}
            disabled={isSubmitting || cartItems.length === 0}
            style={{
              marginTop: 10,
              background: isSubmitting || cartItems.length === 0 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: isSubmitting || cartItems.length === 0 ? '#64748b' : '#ffffff',
              border: 'none',
              padding: '14px',
              borderRadius: 10,
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: isSubmitting || cartItems.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: isSubmitting || cartItems.length === 0 ? 'none' : '0 4px 15px rgba(249, 115, 22, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <CheckCircle2 size={18} />
            {isSubmitting ? 'Gravando Venda no Banco...' : 'Finalizar e Faturar Venda'}
          </button>
        </div>
      </div>

      {/* MODAL DE COMPROVANTE & CONFIRMAÇÃO DA VENDA */}
      {completedSaleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20,
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 16,
            maxWidth: 480,
            width: '100%',
            padding: 24,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc' }}>
                  Venda Concluída com Sucesso!
                </h3>
                <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Estoque baixado e movimentação gravada em nuvem.
                </p>
              </div>
            </div>

            {/* Cupom / Comprovante Visual Térmico */}
            <div style={{
              background: '#070a12',
              border: '1px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              padding: 16,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#f8fafc', fontSize: '0.85rem' }}>
                HIAGO IPHONES • COMPROVANTE DE VENDA
              </div>
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.7rem' }}>
                Vitória da Conquista - BA • {completedSaleModal.date}
              </div>
              <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.15)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cliente:</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>{completedSaleModal.customerName}</span>
              </div>
              {completedSaleModal.customerPhone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>WhatsApp:</span>
                  <span>{completedSaleModal.customerPhone}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Vendedor:</span>
                <span>{completedSaleModal.sellerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pagamento:</span>
                <span>{completedSaleModal.paymentMethod}</span>
              </div>

              <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.15)', margin: '4px 0' }} />
              <div style={{ fontWeight: 'bold', color: '#f97316' }}>ITENS FATURADOS:</div>
              {completedSaleModal.items?.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              {completedSaleModal.tradeIn && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Trade-In ({completedSaleModal.tradeIn.model}):</span>
                  <span>- R$ {Number(completedSaleModal.tradeIn.evaluatedValue).toFixed(2)}</span>
                </div>
              )}

              {completedSaleModal.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                  <span>Desconto:</span>
                  <span>- R$ {Number(completedSaleModal.discount).toFixed(2)}</span>
                </div>
              )}

              <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.15)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', color: '#10b981' }}>
                <span>TOTAL PAGO:</span>
                <span>R$ {Number(completedSaleModal.total).toFixed(2)}</span>
              </div>

              {completedSaleModal.changeAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                  <span>Troco entregue:</span>
                  <span>R$ {completedSaleModal.changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Ações pós-venda */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Printer size={14} />
                Imprimir Cupom
              </button>

              {completedSaleModal.customerPhone && (
                <button
                  onClick={() => {
                    const clean = completedSaleModal.customerPhone.replace(/\D/g, '');
                    const text = encodeURIComponent(
                      `Olá ${completedSaleModal.customerName}! Muito obrigado pela preferência na Hiago iPhones! Segue o comprovante da sua compra no valor total de R$ ${Number(completedSaleModal.total).toFixed(2)}. Conte conosco para qualquer suporte! 🍏`
                    );
                    window.open(`https://wa.me/${clean.startsWith('55') ? clean : `55${clean}`}?text=${text}`, '_blank');
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '9px 12px',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <MessageSquare size={14} />
                  Enviar WhatsApp
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {onNavigateToWarranty && (
                <button
                  onClick={() => {
                    setCompletedSaleModal(null);
                    onNavigateToWarranty();
                  }}
                  style={{
                    flex: 1,
                    background: '#f97316',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Emitir Termo de Garantia
                </button>
              )}
              <button
                onClick={() => setCompletedSaleModal(null)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Concluir & Nova Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
