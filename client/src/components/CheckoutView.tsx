import { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Smartphone, Package, Wrench, 
  Trash2, CheckCircle2, User, AlertTriangle, Printer, MessageSquare, Plus, Minus, Search, ChevronDown, ChevronUp
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

  // Aba ativa do catálogo: 'devices' | 'accessories' | 'services'
  const [activeItemType, setActiveItemType] = useState<'devices' | 'accessories' | 'services'>('devices');

  // Itens no carrinho
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);

  // Trade-in (Aparelho de entrada como seção expansível)
  const [tradeInExpanded, setTradeInExpanded] = useState(false);
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
        name: `${device.model} ${device.storage || ''} - ${device.color || ''} (${device.condition === 'new_sealed' ? 'Lacrado' : `Seminovo ${device.batteryHealth ? `${device.batteryHealth}%` : ''}`})`.trim(),
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

  // Adicionar O.S. ao carrinho
  const handleAddServiceOrder = (os: ServiceOrder) => {
    const existing = cartItems.find(i => i.id === os.id);
    if (existing) return;
    const finalPrice = os.finalValue || os.estimatedValue || 0;
    setCartItems(prev => [
      ...prev,
      {
        id: os.id,
        type: 'service',
        name: `${os.osNumber} • ${os.deviceModel} (${os.reportedIssue || 'Reparo Técnico'})`,
        price: finalPrice,
        quantity: 1,
      },
    ]);
  };

  // Alterar quantidade
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        if (item.type === 'device') return item; // Aparelho com IMEI é sempre 1
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  // Remover item do carrinho
  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  // Totais
  const subtotal = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const tradeInDeduction = hasTradeIn ? (Number(tradeInValue) || 0) : 0;
  const total = Math.max(0, subtotal - tradeInDeduction - (Number(discount) || 0));
  const changeAmount = paymentMethod === 'Dinheiro' && cashReceived > total ? cashReceived - total : 0;

  const handleFinishSale = async () => {
    if (isSubmitting) return;

    if (!isCashOpen) {
      alert('⚠️ O caixa da loja está FECHADO. Abra o caixa antes de faturar a venda para garantir o registro financeiro correto.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Adicione ao menos um item ao pedido antes de finalizar.');
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
      setTradeInExpanded(false);
    } catch (err: any) {
      alert('Erro ao processar venda: ' + (err.message || 'Falha de comunicação'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDevices = devices.filter(d => 
    d.status === 'available' &&
    (!deviceSearch || d.model.toLowerCase().includes(deviceSearch.toLowerCase()) || d.imei?.includes(deviceSearch) || (d.color && d.color.toLowerCase().includes(deviceSearch.toLowerCase())))
  );

  const filteredAccessories = accessories.filter(a =>
    !accessorySearch || a.name.toLowerCase().includes(accessorySearch.toLowerCase())
  );

  const readyServiceOrders = serviceOrders.filter(os =>
    ['pronta', 'em_testes', 'aprovada', 'received'].includes(os.status)
  );

  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Alerta de Caixa Fechado (Discreto) */}
      {!isCashOpen && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FEF3C7',
          borderRadius: 8,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} color="#D97706" />
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#92400E' }}>Caixa do Dia Fechado</span>
              <p style={{ fontSize: '0.75rem', color: '#B45309', margin: 0 }}>
                Para faturar vendas com registro contábil correto, realize a abertura do caixa com o saldo inicial.
              </p>
            </div>
          </div>
          {onOpenCash && (
            <button
              onClick={onOpenCash}
              className="balcao-btn-primary"
              style={{ height: 32, fontSize: '0.75rem' }}
            >
              Abrir Caixa
            </button>
          )}
        </div>
      )}

      {/* LAYOUT 2 COLUNAS: ESQUERDA CATÁLOGO / DIREITA CARRINHO FIXO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
        
        {/* COLUNA ESQUERDA: BUSCA E CATÁLOGO DE PRODUTOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Seletor de Categorias do Catálogo */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: '6px',
            display: 'flex',
            gap: 6,
          }}>
            <button
              onClick={() => setActiveItemType('devices')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 6,
                border: 'none',
                background: activeItemType === 'devices' ? '#2563EB' : 'transparent',
                color: activeItemType === 'devices' ? '#FFFFFF' : '#667085',
                fontSize: '0.8125rem',
                fontWeight: activeItemType === 'devices' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <Smartphone size={16} />
              <span>Aparelhos ({availableDevices.length})</span>
            </button>

            <button
              onClick={() => setActiveItemType('accessories')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 6,
                border: 'none',
                background: activeItemType === 'accessories' ? '#2563EB' : 'transparent',
                color: activeItemType === 'accessories' ? '#FFFFFF' : '#667085',
                fontSize: '0.8125rem',
                fontWeight: activeItemType === 'accessories' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <Package size={16} />
              <span>Acessórios & Peças ({filteredAccessories.length})</span>
            </button>

            <button
              onClick={() => setActiveItemType('services')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 6,
                border: 'none',
                background: activeItemType === 'services' ? '#2563EB' : 'transparent',
                color: activeItemType === 'services' ? '#FFFFFF' : '#667085',
                fontSize: '0.8125rem',
                fontWeight: activeItemType === 'services' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <Wrench size={16} />
              <span>O.S. / Assistência ({readyServiceOrders.length})</span>
            </button>
          </div>

          {/* CATÁLOGO: APARELHOS */}
          {activeItemType === 'devices' && (
            <div className="balcao-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#F7F8FA',
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  padding: '8px 12px',
                }}>
                  <Search size={15} color="#667085" />
                  <input
                    type="text"
                    placeholder="Buscar por modelo, IMEI ou cor..."
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
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
                <span style={{ fontSize: '0.75rem', color: '#667085', whiteSpace: 'nowrap' }}>
                  {availableDevices.length} disponíveis
                </span>
              </div>

              {availableDevices.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#667085', fontSize: '0.8125rem' }}>
                  Nenhum aparelho disponível no momento para venda.
                </div>
              ) : (
                <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                  <table className="balcao-table">
                    <thead>
                      <tr>
                        <th>Modelo & Detalhes</th>
                        <th>IMEI</th>
                        <th>Condição</th>
                        <th style={{ textAlign: 'right' }}>Preço</th>
                        <th style={{ textAlign: 'right', width: 100 }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableDevices.map(device => {
                        const isAdded = cartItems.some(i => i.imei === device.imei);
                        return (
                          <tr key={device.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: '#17181A' }}>{device.model}</div>
                              <div style={{ fontSize: '0.6875rem', color: '#667085' }}>
                                {device.storage} • {device.color}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#475467' }}>
                                {device.imei ? `${device.imei.slice(0, 6)}...${device.imei.slice(-4)}` : 'S/N'}
                              </span>
                            </td>
                            <td>
                              <span className={`status-chip ${device.condition === 'new_sealed' ? 'status-available' : 'status-waiting'}`}>
                                {device.condition === 'new_sealed' ? 'Lacrado' : `Seminovo ${device.batteryHealth ? `${device.batteryHealth}%` : ''}`}
                              </span>
                            </td>
                            <td className="text-financial" style={{ fontSize: '0.875rem' }}>
                              R$ {Number(device.sellPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleAddDevice(device)}
                                disabled={isAdded}
                                className={isAdded ? 'balcao-btn-secondary' : 'balcao-btn-primary'}
                                style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
                              >
                                {isAdded ? 'No pedido' : '+ Adicionar'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* CATÁLOGO: ACESSÓRIOS */}
          {activeItemType === 'accessories' && (
            <div className="balcao-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#F7F8FA',
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  padding: '8px 12px',
                }}>
                  <Search size={15} color="#667085" />
                  <input
                    type="text"
                    placeholder="Buscar acessório ou peça..."
                    value={accessorySearch}
                    onChange={(e) => setAccessorySearch(e.target.value)}
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
              </div>

              {filteredAccessories.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#667085', fontSize: '0.8125rem' }}>
                  Nenhum acessório cadastrado no estoque.
                </div>
              ) : (
                <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                  <table className="balcao-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Estoque</th>
                        <th style={{ textAlign: 'right' }}>Preço</th>
                        <th style={{ textAlign: 'right', width: 100 }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccessories.map(acc => (
                        <tr key={acc.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#17181A' }}>{acc.name}</div>
                          </td>
                          <td style={{ color: '#667085', fontSize: '0.75rem' }}>
                            {acc.category || 'Geral'}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', color: (acc.stock ?? 0) < 5 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>
                              {acc.stock ?? 0} un
                            </span>
                          </td>
                          <td className="text-financial" style={{ fontSize: '0.875rem' }}>
                            R$ {Number(acc.sellPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleAddAccessory(acc)}
                              className="balcao-btn-primary"
                              style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
                            >
                              + Adicionar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* CATÁLOGO: ORDENS DE SERVIÇO & ASSISTÊNCIA */}
          {activeItemType === 'services' && (
            <div className="balcao-card" style={{ padding: 16 }}>
              <div style={{ marginBottom: 12, fontSize: '0.8125rem', color: '#667085' }}>
                Fature serviços executados na bancada técnica diretamente no checkout do balcão:
              </div>

              {readyServiceOrders.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#667085', fontSize: '0.8125rem' }}>
                  Nenhuma ordem de serviço pronta para faturamento no momento.
                </div>
              ) : (
                <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                  <table className="balcao-table">
                    <thead>
                      <tr>
                        <th>Nº da O.S.</th>
                        <th>Cliente / Aparelho</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Valor Total</th>
                        <th style={{ textAlign: 'right', width: 100 }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readyServiceOrders.map(os => {
                        const isAdded = cartItems.some(i => i.id === os.id);
                        return (
                          <tr key={os.id}>
                            <td>
                              <span style={{ fontWeight: 600, color: '#17181A' }}>{os.osNumber}</span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 500, color: '#17181A' }}>{os.customerName}</div>
                              <div style={{ fontSize: '0.6875rem', color: '#667085' }}>{os.deviceModel}</div>
                            </td>
                            <td>
                              <span className="status-chip status-maintenance">
                                {os.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="text-financial" style={{ fontSize: '0.875rem' }}>
                              R$ {Number(os.finalValue || os.estimatedValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleAddServiceOrder(os)}
                                disabled={isAdded}
                                className={isAdded ? 'balcao-btn-secondary' : 'balcao-btn-primary'}
                                style={{ height: 32, padding: '0 10px', fontSize: '0.75rem' }}
                              >
                                {isAdded ? 'Faturando' : '+ Faturar'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* COLUNA DIREITA FIXA: CARRINHO, TRADE-IN, DESCONTOS E FINALIZAÇÃO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 1. DADOS DO CLIENTE & VENDEDOR */}
          <div className="balcao-card" style={{ padding: 16 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase', marginBottom: 10 }}>
              Atendimento Balcão
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Cliente */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Cliente</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#F7F8FA',
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  padding: '6px 10px',
                  marginTop: 4,
                }}>
                  <User size={14} color="#667085" />
                  <input
                    type="text"
                    placeholder="Nome do cliente (ou Consumidor Final)"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setCustomerSearchDropdown(true);
                    }}
                    onFocus={() => setCustomerSearchDropdown(true)}
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

                {/* Dropdown de Clientes Cadastrados */}
                {customerSearchDropdown && customers.length > 0 && customerName && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 20,
                    marginTop: 4,
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}>
                    {customers
                      .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()) || c.phone.includes(customerName))
                      .slice(0, 4)
                      .map(c => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedCustomerId(c.id);
                            setCustomerName(c.name);
                            setCustomerPhone(c.phone);
                            setCustomerSearchDropdown(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid #F3F4F6',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                        >
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A' }}>{c.name}</div>
                          <div style={{ fontSize: '0.6875rem', color: '#667085' }}>{c.phone}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>WhatsApp (para recibo e garantia)</label>
                <input
                  type="text"
                  placeholder="(77) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#F7F8FA',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: '0.8125rem',
                    color: '#17181A',
                    outline: 'none',
                    marginTop: 4,
                  }}
                />
              </div>

              {/* Vendedor e Data */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Vendedor</label>
                  <select
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      color: '#17181A',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  >
                    <option value="Hiago (Responsável)">Hiago (Responsável)</option>
                    <option value="Lucas Vendedor">Lucas Vendedor</option>
                    <option value="Camila Gerente">Camila Gerente</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Data</label>
                  <input
                    type="text"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      color: '#17181A',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. ITENS NO CARRINHO */}
          <div className="balcao-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
                Itens da Venda ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </span>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setCartItems([])}
                  style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: '0.6875rem', cursor: 'pointer', fontWeight: 500 }}
                >
                  Limpar todos
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#667085', fontSize: '0.8125rem' }}>
                Nenhum item adicionado ao pedido. Selecione aparelhos ou acessórios à esquerda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {cartItems.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#667085' }}>
                        R$ {Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / un
                      </div>
                    </div>

                    {/* Quantidade */}
                    {item.type !== 'device' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            border: '1px solid #E5E7EB',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Minus size={10} color="#667085" />
                        </button>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: 16, textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            border: '1px solid #E5E7EB',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Plus size={10} color="#667085" />
                        </button>
                      </div>
                    )}

                    {/* Subtotal do item */}
                    <div className="text-financial" style={{ fontSize: '0.8125rem', minWidth: 70 }}>
                      R$ {Number(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    {/* Remover */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#98A2B3', padding: 2 }}
                      title="Remover item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. TRADE-IN EXPANSÍVEL (SEÇÃO DISCRETA, SEM CARD DE DESTAQUE NEON) */}
          <div className="balcao-card" style={{ padding: '12px 16px' }}>
            <div
              onClick={() => setTradeInExpanded(!tradeInExpanded)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={hasTradeIn}
                  onChange={(e) => {
                    e.stopPropagation();
                    setHasTradeIn(e.target.checked);
                    if (e.target.checked) setTradeInExpanded(true);
                  }}
                  style={{ accentColor: '#2563EB' }}
                />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A' }}>
                  Aparelho de Entrada (Trade-in)
                </span>
              </div>
              {tradeInExpanded ? <ChevronUp size={16} color="#667085" /> : <ChevronDown size={16} color="#667085" />}
            </div>

            {tradeInExpanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Modelo do aparelho entregue</label>
                  <input
                    type="text"
                    placeholder="Ex: iPhone 12 128GB Azul"
                    value={tradeInModel}
                    onChange={(e) => setTradeInModel(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#F7F8FA',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '6px 10px',
                      fontSize: '0.8125rem',
                      color: '#17181A',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>IMEI (Opcional)</label>
                    <input
                      type="text"
                      placeholder="3591..."
                      value={tradeInImei}
                      onChange={(e) => setTradeInImei(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#F7F8FA',
                        border: '1px solid #E5E7EB',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                        color: '#17181A',
                        outline: 'none',
                        marginTop: 4,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Saúde da Bateria (%)</label>
                    <input
                      type="number"
                      value={tradeInBattery}
                      onChange={(e) => setTradeInBattery(Number(e.target.value))}
                      style={{
                        width: '100%',
                        backgroundColor: '#F7F8FA',
                        border: '1px solid #E5E7EB',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                        color: '#17181A',
                        outline: 'none',
                        marginTop: 4,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#16A34A' }}>Valor de Avaliação / Dedução (R$)</label>
                  <input
                    type="number"
                    value={tradeInValue}
                    onChange={(e) => {
                      setTradeInValue(Number(e.target.value));
                      if (Number(e.target.value) > 0) setHasTradeIn(true);
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #DCFCE7',
                      borderRadius: 6,
                      padding: '6px 10px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#16A34A',
                      outline: 'none',
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. PAGAMENTO & TOTAIS */}
          <div className="balcao-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Desconto */}
              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Desconto Comercial (R$)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    backgroundColor: '#F7F8FA',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: '0.8125rem',
                    color: '#17181A',
                    outline: 'none',
                    marginTop: 4,
                  }}
                />
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#F7F8FA',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                    padding: '8px 10px',
                    fontSize: '0.8125rem',
                    color: '#17181A',
                    outline: 'none',
                    marginTop: 4,
                  }}
                >
                  <option value="Cartão de Crédito 12x">Cartão de Crédito 12x</option>
                  <option value="Cartão de Crédito 18x">Cartão de Crédito 18x</option>
                  <option value="Cartão de Crédito 1x">Cartão de Crédito à Vista</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="PIX Instantâneo">PIX Instantâneo</option>
                  <option value="Dinheiro">Dinheiro (Espécie)</option>
                </select>
              </div>

              {/* Dinheiro & Troco */}
              {paymentMethod === 'Dinheiro' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                  <div>
                    <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#667085' }}>Valor Entregue (R$)</label>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      style={{
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: 4,
                        padding: '6px 8px',
                        fontSize: '0.8125rem',
                        color: '#17181A',
                        outline: 'none',
                        marginTop: 4,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#2563EB' }}>Troco a Devolver</label>
                    <div className="text-financial" style={{ fontSize: '1rem', color: '#2563EB', marginTop: 8 }}>
                      R$ {changeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}

              {/* Resumo Financeiro */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#667085' }}>
                  <span>Subtotal:</span>
                  <span className="tabular-nums">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                {hasTradeIn && tradeInDeduction > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#16A34A' }}>
                    <span>Trade-in ({tradeInModel || 'Aparelho'}):</span>
                    <span className="tabular-nums">- R$ {tradeInDeduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#D97706' }}>
                    <span>Desconto:</span>
                    <span className="tabular-nums">- R$ {discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #E5E7EB',
                  paddingTop: 8,
                  marginTop: 4,
                }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#17181A' }}>Total a Pagar:</span>
                  <span className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#17181A' }}>
                    R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* BOTÃO FINAL INEQUÍVOCO: FINALIZAR VENDA */}
              <button
                onClick={handleFinishSale}
                disabled={isSubmitting || cartItems.length === 0}
                className="balcao-btn-primary"
                style={{
                  height: 44,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  width: '100%',
                  marginTop: 6,
                  opacity: (isSubmitting || cartItems.length === 0) ? 0.6 : 1,
                  cursor: (isSubmitting || cartItems.length === 0) ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Processando Faturamento...' : 'Finalizar Venda'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE VENDA CONCLUÍDA & COMPROVANTE SÓBRIO */}
      {completedSaleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 70,
          padding: 20,
        }}>
          <div className="balcao-card animate-fade-in" style={{ width: '100%', maxWidth: 480, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#17181A', margin: 0 }}>
                  Venda Concluída com Sucesso
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#667085', margin: 0 }}>
                  Estoque atualizado e transação registrada no caixa do dia.
                </p>
              </div>
            </div>

            {/* Recibo Térmico Formatado */}
            <div style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              padding: 16,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#344054',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#17181A', fontSize: '0.8125rem' }}>
                HIAGO IPHONES • COMPROVANTE OPERACIONAL
              </div>
              <div style={{ textAlign: 'center', color: '#667085', fontSize: '0.6875rem' }}>
                Vitória da Conquista - BA • {completedSaleModal.date}
              </div>
              <div style={{ borderBottom: '1px dashed #D1D5DB', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cliente:</span>
                <span style={{ fontWeight: 600, color: '#17181A' }}>{completedSaleModal.customerName}</span>
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

              <div style={{ borderBottom: '1px dashed #D1D5DB', margin: '4px 0' }} />
              <div style={{ fontWeight: 600, color: '#17181A' }}>ITENS:</div>
              {completedSaleModal.items?.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span className="tabular-nums">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              {completedSaleModal.tradeIn && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                  <span>Trade-In ({completedSaleModal.tradeIn.model}):</span>
                  <span className="tabular-nums">- R$ {Number(completedSaleModal.tradeIn.evaluatedValue).toFixed(2)}</span>
                </div>
              )}

              {completedSaleModal.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                  <span>Desconto:</span>
                  <span className="tabular-nums">- R$ {Number(completedSaleModal.discount).toFixed(2)}</span>
                </div>
              )}

              <div style={{ borderBottom: '1px dashed #D1D5DB', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 700, color: '#17181A' }}>
                <span>TOTAL:</span>
                <span className="tabular-nums">R$ {Number(completedSaleModal.total).toFixed(2)}</span>
              </div>

              {completedSaleModal.changeAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563EB' }}>
                  <span>Troco entregue:</span>
                  <span className="tabular-nums">R$ {completedSaleModal.changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Ações pós-venda */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => window.print()}
                className="balcao-btn-secondary"
                style={{ flex: 1, height: 36, fontSize: '0.75rem' }}
              >
                <Printer size={14} />
                <span>Imprimir Recibo</span>
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
                  className="balcao-btn-secondary"
                  style={{ flex: 1, height: 36, fontSize: '0.75rem' }}
                >
                  <MessageSquare size={14} color="#16A34A" />
                  <span>WhatsApp</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #E5E7EB', paddingTop: 12 }}>
              {onNavigateToWarranty && (
                <button
                  onClick={() => {
                    setCompletedSaleModal(null);
                    onNavigateToWarranty();
                  }}
                  className="balcao-btn-secondary"
                  style={{ height: 36, fontSize: '0.75rem' }}
                >
                  Garantia
                </button>
              )}
              <button
                onClick={() => setCompletedSaleModal(null)}
                className="balcao-btn-primary"
                style={{ height: 36, fontSize: '0.75rem' }}
              >
                Nova Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
