import { useState, useEffect } from 'react';
import { Sidebar, type ERPNavTab } from './components/Sidebar.js';
import { DashboardView } from './components/DashboardView.js';
import { CheckoutView } from './components/CheckoutView.js';
import { CashControlView } from './components/CashControlView.js';
import { LabelPrintView } from './components/LabelPrintView.js';
import { SalesHistoryView } from './components/SalesHistoryView.js';
import { CustomersView } from './components/CustomersView.js';
import { AfterSalesView } from './components/AfterSalesView.js';
import { CrmKanbanView } from './components/crm/CrmKanbanView.js';
import { ExtendedModulesView } from './components/ExtendedModulesView.js';
import { StockShowcaseHub, type StockSubmoduleTab } from './components/StockShowcaseHub.js';
import { TechnicalAssistanceHub } from './components/TechnicalAssistanceHub.js';
import { ManagementHub, type ManagementSubmoduleTab } from './components/ManagementHub.js';
import { FinancialIntelligenceHub } from './components/financial-intelligence/FinancialIntelligenceHub.js';
import { FinancialRepository } from './repositories/financialRepository.js';
import { 
  INITIAL_DEVICES, 
  INITIAL_ACCESSORIES, 
  INITIAL_SERVICE_ORDERS, 
  INITIAL_CASH, 
  INITIAL_SALES, 
  INITIAL_CUSTOMERS,
  INITIAL_AFTER_SALES_TRIGGERS
} from './data/erpData.js';
import { 
  fetchDevices, 
  createDeviceApi, 
  updateDeviceApi,
  deleteDeviceApi,
  fetchSales, 
  createSaleApi, 
  cancelSaleApi,
  fetchServiceOrders, 
  createServiceOrderApi, 
  updateServiceOrderStatusApi,
  updateServiceOrderQuoteApi,
  recordServiceOrderApprovalApi,
  fetchTechnicalServices,
  createTechnicalServiceApi,
  updateTechnicalServiceApi,
  deleteTechnicalServiceApi,
  fetchWarranties,
  fetchWarrantyClaims,
  createWarrantyClaimApi,
  updateWarrantyClaimApi,
  fetchCashRegister, 
  openCashRegisterApi,
  closeCashRegisterApi,
  addCashTransactionApi,
  toggleCashApi,
  fetchCustomers,
  createCustomerApi,
  fetchAfterSalesTriggers,
  updateAfterSalesStatusApi,
  fetchSuppliers,
  createSupplierApi,
  updateSupplierApi,
  deleteSupplierApi,
  fetchProducts,
  createProductApi,
  updateProductApi,
  adjustProductStockApi,
  deleteProductApi,
  fetchParts,
  createPartApi,
  updatePartApi,
  adjustPartStockApi,
  deletePartApi,
  fetchPhonePurchases,
  createPhonePurchaseApi,
  confirmPhonePurchaseApi,
  fetchInventoryMovements,
  getDatabaseConnectionHealth 
} from './api/erpApi.js';
import type { 
  Device, 
  Accessory, 
  ServiceOrder, 
  CashRegister, 
  Sale, 
  Customer, 
  AfterSalesTrigger, 
  TransactionCategory,
  Product,
  Part,
  Supplier,
  PhonePurchase,
  InventoryMovement,
  TechnicalService,
  WarrantyEntry,
  WarrantyClaim,
  OSStatus,
  OSQuoteServiceItem,
  OSQuotePartItem
} from './types.js';
import { Bell, Search, LifeBuoy, Plus, X } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ERPNavTab>('dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [accessories] = useState<Accessory[]>(INITIAL_ACCESSORIES);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(INITIAL_SERVICE_ORDERS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [cashRegister, setCashRegister] = useState<CashRegister>(INITIAL_CASH);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [afterSalesTriggers, setAfterSalesTriggers] = useState<AfterSalesTrigger[]>(INITIAL_AFTER_SALES_TRIGGERS);

  // Estados do Módulo de Estoque e Vitrine
  const [products, setProducts] = useState<Product[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PhonePurchase[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  // Estados do Módulo de Assistência Técnica (Dados Reais)
  const [technicalServices, setTechnicalServices] = useState<TechnicalService[]>([]);
  const [warranties, setWarranties] = useState<WarrantyEntry[]>([]);
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>([]);

  const [dbHealth, setDbHealth] = useState<{ online: boolean; tablesCreated: boolean; error?: string }>({ 
    online: false, 
    tablesCreated: false 
  });

  // Carrega dados iniciais do backend com fallback resiliente
  useEffect(() => {
    async function loadData() {
      // 1. Checa status da conexão com o Supabase
      try {
        const health = await getDatabaseConnectionHealth();
        setDbHealth(health);
      } catch (e) {
        console.warn('Erro ao checar Supabase health:', e);
      }

      // 2. Carrega todas as entidades do ERP, Estoque e Assistência Técnica
      try {
        const [
          loadedDevices, 
          loadedSales, 
          loadedOS, 
          loadedCash,
          loadedCustomers,
          loadedTriggers,
          loadedProducts,
          loadedParts,
          loadedSuppliers,
          loadedPurchases,
          loadedMovements,
          loadedServices,
          loadedWarranties,
          loadedClaims
        ] = await Promise.all([
          fetchDevices(),
          fetchSales(),
          fetchServiceOrders(),
          fetchCashRegister(),
          fetchCustomers(),
          fetchAfterSalesTriggers(),
          fetchProducts(),
          fetchParts(),
          fetchSuppliers(),
          fetchPhonePurchases(),
          fetchInventoryMovements(),
          fetchTechnicalServices(),
          fetchWarranties(),
          fetchWarrantyClaims()
        ]);
        if (loadedDevices) setDevices(loadedDevices);
        if (loadedSales) setSales(loadedSales);
        if (loadedOS) setServiceOrders(loadedOS);
        if (loadedCash) setCashRegister(loadedCash);
        if (loadedCustomers) setCustomers(loadedCustomers);
        if (loadedTriggers) setAfterSalesTriggers(loadedTriggers);
        if (loadedProducts) setProducts(loadedProducts);
        if (loadedParts) setParts(loadedParts);
        if (loadedSuppliers) setSuppliers(loadedSuppliers);
        if (loadedPurchases) setPurchases(loadedPurchases);
        if (loadedMovements) setMovements(loadedMovements);
        if (loadedServices) setTechnicalServices(loadedServices);
        if (loadedWarranties) setWarranties(loadedWarranties);
        if (loadedClaims) setWarrantyClaims(loadedClaims);
      } catch (err) {
        console.warn('Usando dados mockados de inicialização:', err);
      }
    }
    loadData();
  }, []);

  // Alternar Abertura / Fechamento de Caixa Rápido
  const handleToggleCash = async () => {
    try {
      const updated = await toggleCashApi(cashRegister.isOpen);
      setCashRegister(updated);
    } catch {
      setCashRegister(prev => ({
        ...prev,
        isOpen: !prev.isOpen,
        openedAt: !prev.isOpen ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      }));
    }
  };

  // Abertura com Fundo de Troco
  const handleOpenCash = async (initialFloat: number, operatorName: string) => {
    const updated = await openCashRegisterApi(initialFloat, operatorName);
    setCashRegister(updated);
  };

  // Fechamento com Conferência Cega
  const handleCloseCash = async (cashCounted: number, notes?: string) => {
    const res = await closeCashRegisterApi(cashCounted, notes);
    if (res.register) setCashRegister(res.register);
    return res;
  };

  // Movimentação Manual (Sangria ou Suprimento)
  const handleAddCashTransaction = async (
    type: 'inflow' | 'outflow',
    category: TransactionCategory,
    amount: number,
    description: string,
    paymentMethod: string = 'Dinheiro'
  ) => {
    await addCashTransactionApi(type, category, amount, description, paymentMethod);
    const updated = await fetchCashRegister();
    if (updated) setCashRegister(updated);
  };

  // Concluir Venda no PDV (Checkout Rápido com Fluxo Integrado)
  const handleCompleteSale = async (saleData: any) => {
    const newSalePayload: Sale = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sale-${Date.now()}`,
      saleNumber: `VD-${2092 + sales.length}`,
      customerId: saleData.customerId,
      customerName: saleData.customerName,
      customerPhone: saleData.customerPhone,
      sellerName: saleData.sellerName,
      date: saleData.date,
      items: saleData.items,
      tradeIn: saleData.tradeIn,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      total: saleData.total,
      paymentMethod: saleData.paymentMethod,
      installments: saleData.installments,
      status: 'completed',
    };

    // Salva no banco e dispara sincronização em cadeia
    await createSaleApi(newSalePayload);
    try {
      await FinancialRepository.syncFromSale(newSalePayload);
    } catch (e) {
      console.warn('Erro ao sincronizar venda com financeiro:', e);
    }
    setSales(prev => [newSalePayload, ...prev]);

    // Recarrega estoque, caixa, clientes e pós-venda sincronizados
    try {
      const [updatedDevs, updatedCash, updatedCusts, updatedTrigs] = await Promise.all([
        fetchDevices(),
        fetchCashRegister(),
        fetchCustomers(),
        fetchAfterSalesTriggers(),
      ]);
      if (updatedDevs) setDevices(updatedDevs);
      if (updatedCash) setCashRegister(updatedCash);
      if (updatedCusts) setCustomers(updatedCusts);
      if (updatedTrigs) setAfterSalesTriggers(updatedTrigs);
    } catch {
      // Fallback local se rede oscilar
      saleData.items.forEach((item: any) => {
        if (item.type === 'device' && item.imei) {
          setDevices(prev => prev.map(d => d.imei === item.imei ? { ...d, status: 'sold' } : d));
        }
      });
    }
  };

  // Cancelar / Estornar Venda com Reversão Multi-Módulo
  const handleCancelSale = async (sale: Sale, reason: string) => {
    await cancelSaleApi(sale, reason);
    setSales(prev => prev.map(s => s.id === sale.id ? { ...s, status: 'cancelled', cancellationReason: reason } : s));

    // Recarrega estoque e caixa refletindo a devolução
    const [updatedDevs, updatedCash, updatedCusts] = await Promise.all([
      fetchDevices(),
      fetchCashRegister(),
      fetchCustomers(),
    ]);
    if (updatedDevs) setDevices(updatedDevs);
    if (updatedCash) setCashRegister(updatedCash);
    if (updatedCusts) setCustomers(updatedCusts);
  };

  // Handlers de Estoque de Aparelhos (Celulares)
  const handleAddDevice = async (device: Device) => {
    await createDeviceApi(device);
    const updated = await fetchDevices();
    if (updated) setDevices(updated);
  };

  const handleUpdateDevice = async (imei: string, updates: Partial<Device>) => {
    await updateDeviceApi(imei, updates);
    const updated = await fetchDevices();
    if (updated) setDevices(updated);
  };

  const handleDeleteDevice = async (imei: string) => {
    await deleteDeviceApi(imei);
    const updated = await fetchDevices();
    if (updated) setDevices(updated);
  };

  // Handlers de Produtos
  const handleCreateProduct = async (prod: Omit<Product, 'id' | 'createdAt'>) => {
    await createProductApi(prod);
    const [updatedProds, updatedMoves] = await Promise.all([fetchProducts(), fetchInventoryMovements()]);
    if (updatedProds) setProducts(updatedProds);
    if (updatedMoves) setMovements(updatedMoves);
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    await updateProductApi(id, updates);
    const updated = await fetchProducts();
    if (updated) setProducts(updated);
  };

  const handleAdjustProductStock = async (id: string, delta: number, reason: string) => {
    await adjustProductStockApi(id, delta, reason);
    const [updatedProds, updatedMoves] = await Promise.all([fetchProducts(), fetchInventoryMovements()]);
    if (updatedProds) setProducts(updatedProds);
    if (updatedMoves) setMovements(updatedMoves);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProductApi(id);
    const updated = await fetchProducts();
    if (updated) setProducts(updated);
  };

  // Handlers de Peças
  const handleCreatePart = async (part: Omit<Part, 'id' | 'createdAt'>) => {
    await createPartApi(part);
    const [updatedParts, updatedMoves] = await Promise.all([fetchParts(), fetchInventoryMovements()]);
    if (updatedParts) setParts(updatedParts);
    if (updatedMoves) setMovements(updatedMoves);
  };

  const handleUpdatePart = async (id: string, updates: Partial<Part>) => {
    await updatePartApi(id, updates);
    const updated = await fetchParts();
    if (updated) setParts(updated);
  };

  const handleAdjustPartStock = async (id: string, delta: number, reason: string) => {
    await adjustPartStockApi(id, delta, reason);
    const [updatedParts, updatedMoves] = await Promise.all([fetchParts(), fetchInventoryMovements()]);
    if (updatedParts) setParts(updatedParts);
    if (updatedMoves) setMovements(updatedMoves);
  };

  const handleDeletePart = async (id: string) => {
    await deletePartApi(id);
    const updated = await fetchParts();
    if (updated) setParts(updated);
  };

  // Handlers de Fornecedores
  const handleCreateSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    await createSupplierApi(supplier);
    const updated = await fetchSuppliers();
    if (updated) setSuppliers(updated);
  };

  const handleUpdateSupplier = async (id: string, updates: Partial<Supplier>) => {
    await updateSupplierApi(id, updates);
    const updated = await fetchSuppliers();
    if (updated) setSuppliers(updated);
  };

  const handleDeleteSupplier = async (id: string) => {
    await deleteSupplierApi(id);
    const updated = await fetchSuppliers();
    if (updated) setSuppliers(updated);
  };

  // Handlers de Compras de Telefones
  const handleCreatePurchase = async (purchase: Omit<PhonePurchase, 'id' | 'createdAt'>) => {
    await createPhonePurchaseApi(purchase);
    const updated = await fetchPhonePurchases();
    if (updated) setPurchases(updated);
  };

  const handleConfirmPurchase = async (id: string) => {
    await confirmPhonePurchaseApi(id);
    const purchase = purchases.find(p => p.id === id);
    if (purchase) {
      try {
        await FinancialRepository.syncFromPurchase(purchase);
      } catch (e) {
        console.warn('Erro ao sincronizar compra com financeiro:', e);
      }
    }
    const [updatedPurchases, updatedDevices, updatedCash, updatedMoves] = await Promise.all([
      fetchPhonePurchases(),
      fetchDevices(),
      fetchCashRegister(),
      fetchInventoryMovements()
    ]);
    if (updatedPurchases) setPurchases(updatedPurchases);
    if (updatedDevices) setDevices(updatedDevices);
    if (updatedCash) setCashRegister(updatedCash);
    if (updatedMoves) setMovements(updatedMoves);
  };

  // Iniciar Venda no PDV a partir da Vitrine / Estoque
  const handleStartSaleInPOS = (_device?: Device) => {
    setActiveTab('checkout');
  };

  // Handlers do Módulo de Assistência Técnica
  const handleUpdateOSStatus = async (
    id: string, 
    status: OSStatus, 
    notes?: string, 
    operator?: string, 
    extra?: Partial<ServiceOrder>
  ) => {
    const res = await updateServiceOrderStatusApi(id, status, notes, operator, extra);
    if (res.success) {
      if (status === 'entregue' || status === 'delivered') {
        const order = serviceOrders.find(o => o.id === id);
        if (order) {
          try {
            await FinancialRepository.syncFromOSDelivery({ ...order, ...extra, status });
          } catch (e) {
            console.warn('Erro ao sincronizar OS com financeiro:', e);
          }
        }
      }
      const [updatedOS, updatedWarranties, updatedParts, updatedMovements] = await Promise.all([
        fetchServiceOrders(),
        fetchWarranties(),
        fetchParts(),
        fetchInventoryMovements()
      ]);
      if (updatedOS) setServiceOrders(updatedOS);
      if (updatedWarranties) setWarranties(updatedWarranties);
      if (updatedParts) setParts(updatedParts);
      if (updatedMovements) setMovements(updatedMovements);
    }
    return res;
  };

  const handleUpdateOSQuote = async (
    id: string,
    services: OSQuoteServiceItem[],
    partsItems: OSQuotePartItem[],
    discount: number
  ) => {
    const res = await updateServiceOrderQuoteApi(id, services, partsItems, discount);
    const updatedOS = await fetchServiceOrders();
    if (updatedOS) setServiceOrders(updatedOS);
    return res;
  };

  const handleRecordOSApproval = async (id: string, approval: any) => {
    const res = await recordServiceOrderApprovalApi(id, approval);
    const updatedOS = await fetchServiceOrders();
    if (updatedOS) setServiceOrders(updatedOS);
    return res;
  };

  const handleCreateTechnicalService = async (service: Omit<TechnicalService, 'id' | 'createdAt'>) => {
    await createTechnicalServiceApi(service);
    const updated = await fetchTechnicalServices();
    if (updated) setTechnicalServices(updated);
  };

  const handleUpdateTechnicalService = async (id: string, updates: Partial<TechnicalService>) => {
    await updateTechnicalServiceApi(id, updates);
    const updated = await fetchTechnicalServices();
    if (updated) setTechnicalServices(updated);
  };

  const handleDeleteTechnicalService = async (id: string) => {
    await deleteTechnicalServiceApi(id);
    const updated = await fetchTechnicalServices();
    if (updated) setTechnicalServices(updated);
  };

  const handleCreateWarrantyClaim = async (claim: Omit<WarrantyClaim, 'id' | 'createdAt'>) => {
    await createWarrantyClaimApi(claim);
    const [updatedClaims, updatedWarranties, updatedOS] = await Promise.all([
      fetchWarrantyClaims(),
      fetchWarranties(),
      fetchServiceOrders()
    ]);
    if (updatedClaims) setWarrantyClaims(updatedClaims);
    if (updatedWarranties) setWarranties(updatedWarranties);
    if (updatedOS) setServiceOrders(updatedOS);
  };

  const handleUpdateWarrantyClaim = async (id: string, updates: Partial<WarrantyClaim>) => {
    await updateWarrantyClaimApi(id, updates);
    const updated = await fetchWarrantyClaims();
    if (updated) setWarrantyClaims(updated);
  };

  // Adicionar novo Cliente com Persistência em Banco
  const handleAddCustomer = async (customer: Customer) => {
    const created = await createCustomerApi(customer);
    setCustomers(prev => [created, ...prev.filter(c => c.id !== created.id)]);
  };

  // Ação de Pós-Venda (Marcar Enviado / Convertido)
  const handleTriggerAction = async (id: string, newStatus: 'sent' | 'converted') => {
    await updateAfterSalesStatusApi(id, newStatus);
    setAfterSalesTriggers(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* MENU LATERAL COMPLETO DO BALCÃO PHONES */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCashOpen={cashRegister.isOpen}
        cashBalance={(cashRegister.initialFloat || 0) + (cashRegister.totalSales || 0)}
        onToggleCash={handleToggleCash}
        onQuickNewSale={() => setActiveTab('checkout')}
        onQuickNewOS={() => setActiveTab('service_order')}
        onQuickNewDevice={() => setActiveTab('inventory')}
      />

      {/* ÁREA DE CONTEÚDO PRINCIPAL (COM TOPBAR DE SUPORTE) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* 1. BARRA SUPERIOR PERMANENTE E LIMPA (ESTILO CLOSE CRM / BALCÃO OS) */}
        <header
          style={{
            height: 52,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {/* Busca Global à Esquerda */}
          <div style={{ position: 'relative', width: 360 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#F7F8FA',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                padding: '6px 10px',
              }}
            >
              <Search size={14} color="#667085" />
              <input
                type="text"
                placeholder="Busca global... (Ctrl+K)"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#17181A',
                  fontSize: '0.8125rem',
                  width: '100%',
                }}
              />
              {globalSearchQuery ? (
                <button
                  onClick={() => setGlobalSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#98A2B3', display: 'flex' }}
                >
                  <X size={13} />
                </button>
              ) : (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: '#98A2B3',
                    border: '1px solid #E5E7EB',
                    borderRadius: 4,
                    padding: '1px 5px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  ⌘K
                </span>
              )}
            </div>

            {/* Menu Suspenso de Resultados da Busca Global */}
            {globalSearchQuery.trim() && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 6,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  maxHeight: 320,
                  overflowY: 'auto',
                  padding: '6px 0',
                }}
              >
                <div style={{ padding: '6px 12px', fontSize: '0.6875rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
                  Resultados Rápidos
                </div>

                {devices.filter(d => 
                  d.model.toLowerCase().includes(globalSearchQuery.toLowerCase()) || 
                  (d.imei && d.imei.includes(globalSearchQuery))
                ).slice(0, 3).map(dev => (
                  <div
                    key={dev.imei || dev.id}
                    onClick={() => {
                      setActiveTab('inventory');
                      setGlobalSearchQuery('');
                    }}
                    style={{
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F3F4F6',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#17181A' }}>{dev.model}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#667085' }}>IMEI: {dev.imei || 'S/N'}</div>
                    </div>
                    <span className="status-chip status-available" style={{ fontSize: '0.6875rem' }}>
                      R$ {dev.sellPrice?.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}

                {customers.filter(c => 
                  c.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || 
                  (c.phone && c.phone.includes(globalSearchQuery))
                ).slice(0, 3).map(cust => (
                  <div
                    key={cust.id}
                    onClick={() => {
                      setActiveTab('customers');
                      setGlobalSearchQuery('');
                    }}
                    style={{
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F3F4F6',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#17181A' }}>{cust.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#667085' }}>{cust.phone}</div>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#2563EB', fontWeight: 500 }}>Cliente</span>
                  </div>
                ))}

                {serviceOrders.filter(os => 
                  (os.osNumber && os.osNumber.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
                  (os.customerName && os.customerName.toLowerCase().includes(globalSearchQuery.toLowerCase()))
                ).slice(0, 2).map(os => (
                  <div
                    key={os.id}
                    onClick={() => {
                      setActiveTab('service_order');
                      setGlobalSearchQuery('');
                    }}
                    style={{
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#17181A' }}>{os.osNumber} • {os.customerName}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#667085' }}>{os.deviceModel}</div>
                    </div>
                    <span className="status-chip status-maintenance" style={{ fontSize: '0.6875rem' }}>O.S.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notificações, Ajuda e Perfil à Direita */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Botão de Ajuda */}
            <button
              onClick={() => setIsHelpModalOpen(true)}
              style={{
                background: 'transparent',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                padding: '5px 10px',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#667085',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
              }}
              title="Ajuda e Atalhos"
            >
              <LifeBuoy size={14} color="#667085" />
              <span>Ajuda</span>
            </button>

            {/* Notificações */}
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              style={{
                background: 'transparent',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#667085',
                cursor: 'pointer',
                position: 'relative',
              }}
              title="Notificações operacionais"
            >
              <Bell size={15} />
              <span
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#DC2626',
                }}
              />
            </button>

            {/* Painel Suspenso de Notificações */}
            {isNotificationsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 52,
                  right: 28,
                  width: 300,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  padding: '12px 14px',
                  zIndex: 60,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A' }}>Notificações</span>
                  <span style={{ fontSize: '0.6875rem', color: '#2563EB', cursor: 'pointer' }} onClick={() => setIsNotificationsOpen(false)}>Fechar</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.75rem', color: '#667085' }}>
                  <div style={{ padding: '6px 8px', backgroundColor: '#F9FAFB', borderRadius: 4 }}>
                    <strong style={{ color: '#17181A' }}>O.S. #1024</strong>: Cliente aguarda orçamento há 48h.
                  </div>
                  <div style={{ padding: '6px 8px', backgroundColor: '#F9FAFB', borderRadius: 4 }}>
                    <strong style={{ color: '#17181A' }}>Reserva iPhone 14 Pro</strong>: Expira hoje às 18:00.
                  </div>
                  <div style={{ padding: '6px 8px', backgroundColor: '#F9FAFB', borderRadius: 4 }}>
                    <strong style={{ color: '#17181A' }}>Estoque baixo</strong>: Película 3D iPhone 13 (2 un).
                  </div>
                </div>
              </div>
            )}

            {/* Perfil Operador */}
            <div
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 8px',
                borderRadius: 6,
                cursor: 'pointer',
                border: '1px solid transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F8FA')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              title="Meu Perfil"
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#151515',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                RH
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A', lineHeight: 1.2 }}>Robson H.</span>
                <span style={{ fontSize: '0.6875rem', color: '#667085', lineHeight: 1 }}>Gerente Balcão</span>
              </div>
            </div>
          </div>
        </header>

        {/* 2. SUB-HEADER / ACTION BAR CONTEXTUAL DA TELA (LAYOUT-BASE) */}
        <div
          style={{
            backgroundColor: '#F7F8FA',
            borderBottom: '1px solid #E5E7EB',
            padding: '16px 32px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            {/* Breadcrumb Sóbrio */}
            <div style={{ fontSize: '0.75rem', color: '#667085', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span>
                {activeTab === 'dashboard' ? 'Visão geral' :
                 ['checkout', 'sales_history', 'cash', 'customers', 'after_sales', 'crm_customers'].includes(activeTab) ? 'Operação' :
                 ['stock_dashboard', 'inventory', 'phone_purchases', 'products', 'parts', 'suppliers', 'showcase', 'labels'].includes(activeTab) ? 'Estoque' :
                 ['assistance_dashboard', 'service_order', 'services', 'warranty'].includes(activeTab) ? 'Assistência' : 'Administração'}
              </span>
              <span>/</span>
              <span style={{ color: '#17181A', fontWeight: 500 }}>
                {activeTab === 'dashboard' ? 'Dashboard' :
                 activeTab === 'checkout' ? 'PDV / Nova venda' :
                 activeTab === 'sales_history' ? 'Caixa e vendas' :
                 activeTab === 'cash' ? 'Fluxo de caixa' :
                 activeTab === 'customers' ? 'Clientes' :
                 activeTab === 'after_sales' ? 'Pós-venda' :
                 activeTab === 'crm_customers' ? 'Prospecção (WhatsApp)' :
                 activeTab === 'stock_dashboard' ? 'Painel de estoque' :
                 activeTab === 'inventory' ? 'Celulares por IMEI' :
                 activeTab === 'phone_purchases' ? 'Compras / Trade-in' :
                 activeTab === 'products' ? 'Produtos e peças' :
                 activeTab === 'suppliers' ? 'Fornecedores' :
                 activeTab === 'showcase' ? 'Vitrine' :
                 activeTab === 'labels' ? 'Etiquetas' :
                 activeTab === 'assistance_dashboard' ? 'Painel de assistência' :
                 activeTab === 'service_order' ? 'Ordens de serviço' :
                 activeTab === 'services' ? 'Serviços' :
                 activeTab === 'warranty' ? 'Garantias' :
                 activeTab === 'financial_intelligence' ? 'Gestão da loja' :
                 activeTab === 'subscription' ? 'Assinatura' :
                 activeTab === 'support' ? 'Suporte' :
                 activeTab === 'migration' ? 'Migração de dados' :
                 activeTab === 'settings' ? 'Configurações' : 'Sistema'}
              </span>
            </div>

            {/* Título e Subtítulo Objetivo */}
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#17181A', margin: 0, letterSpacing: '-0.01em' }}>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'checkout' && 'PDV / Nova venda'}
              {activeTab === 'sales_history' && 'Caixa e vendas'}
              {activeTab === 'cash' && 'Fluxo de caixa'}
              {activeTab === 'customers' && 'Clientes'}
              {activeTab === 'after_sales' && 'Pós-venda'}
              {activeTab === 'crm_customers' && 'Prospecção comercial'}
              {activeTab === 'stock_dashboard' && 'Painel de estoque'}
              {activeTab === 'inventory' && 'Celulares por IMEI'}
              {activeTab === 'phone_purchases' && 'Compras / Trade-in'}
              {activeTab === 'products' && 'Produtos e peças'}
              {activeTab === 'suppliers' && 'Fornecedores'}
              {activeTab === 'showcase' && 'Vitrine comercial'}
              {activeTab === 'labels' && 'Etiquetas térmicas'}
              {activeTab === 'assistance_dashboard' && 'Painel de assistência técnica'}
              {activeTab === 'service_order' && 'Ordens de serviço'}
              {activeTab === 'services' && 'Serviços'}
              {activeTab === 'warranty' && 'Garantias'}
              {activeTab === 'financial_intelligence' && 'Inteligência Financeira'}
              {activeTab === 'subscription' && 'Assinatura & Licença'}
              {activeTab === 'support' && 'Suporte técnico'}
              {activeTab === 'migration' && 'Migração de dados'}
              {activeTab === 'settings' && 'Configurações'}
              {activeTab === 'profile' && 'Meu perfil'}
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#667085', marginTop: 2, marginBottom: 0 }}>
              {activeTab === 'dashboard' && 'Central de decisão, indicadores do dia e oportunidades de recompra.'}
              {activeTab === 'checkout' && 'Atendimento de balcão e checkout ágil com suporte a trade-in.'}
              {activeTab === 'sales_history' && 'Histórico cronológico de vendas e movimentações.'}
              {activeTab === 'cash' && 'Entradas, saídas e conciliação do dia.'}
              {activeTab === 'customers' && 'Base cadastral e histórico de compras.'}
              {activeTab === 'after_sales' && 'Acompanhamento de garantia, satisfação e reativação.'}
              {activeTab === 'crm_customers' && 'Funil comercial de WhatsApp e mensagens automáticas.'}
              {activeTab === 'stock_dashboard' && 'Patrimônio em estoque, giro e reposição.'}
              {activeTab === 'inventory' && 'Rastreabilidade de aparelhos por IMEI e saúde de bateria.'}
              {activeTab === 'phone_purchases' && 'Avaliação de compra, termos de procedência e trade-in.'}
              {activeTab === 'products' && 'Catálogo de acessórios e peças de bancada.'}
              {activeTab === 'suppliers' && 'Fornecedores de peças e aparelhos.'}
              {activeTab === 'showcase' && 'Aparelhos ativos na vitrine comercial.'}
              {activeTab === 'labels' && 'Impressão de etiquetas térmicas de gôndola.'}
              {activeTab === 'assistance_dashboard' && 'Visão consolidada de bancada e produtividade.'}
              {activeTab === 'service_order' && 'Diagnóstico, orçamentos e fluxo de bancada.'}
              {activeTab === 'services' && 'Tabela padronizada de serviços e mão de obra.'}
              {activeTab === 'warranty' && 'Controle de garantias e chamados de retorno.'}
              {activeTab === 'financial_intelligence' && 'Controladoria determinística e inteligência com IA.'}
              {activeTab === 'subscription' && 'Status do plano SaaS e faturamento.'}
              {activeTab === 'support' && 'Canais de suporte operacional e chamados.'}
              {activeTab === 'migration' && 'Importação e exportação de dados do sistema.'}
              {activeTab === 'settings' && 'Parâmetros operacionais e infraestrutura.'}
              {activeTab === 'profile' && 'Dados cadastrais do operador do balcão.'}
            </p>
          </div>

          {/* Ação Primária Contextual no Cabeçalho (Azul Operacional #2563EB) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {['dashboard', 'sales_history', 'stock_dashboard'].includes(activeTab) && (
              <button
                onClick={() => setActiveTab('checkout')}
                className="balcao-btn-primary"
                title="Abrir PDV para Nova Venda"
              >
                <Plus size={15} />
                <span>Nova venda</span>
              </button>
            )}

            {['assistance_dashboard', 'service_order', 'services', 'warranty'].includes(activeTab) && (
              <button
                onClick={() => setActiveTab('service_order')}
                className="balcao-btn-primary"
                title="Cadastrar Nova Ordem de Serviço"
              >
                <Plus size={15} />
                <span>Nova O.S.</span>
              </button>
            )}

            {['inventory', 'phone_purchases'].includes(activeTab) && (
              <button
                onClick={() => setActiveTab('phone_purchases')}
                className="balcao-btn-primary"
                title="Registrar Compra ou Trade-in de Aparelho"
              >
                <Plus size={15} />
                <span>Nova compra</span>
              </button>
            )}

            {activeTab === 'customers' && (
              <button
                onClick={() => {
                  const customerModalBtn = document.getElementById('open-customer-modal-btn');
                  if (customerModalBtn) customerModalBtn.click();
                }}
                className="balcao-btn-primary"
                title="Cadastrar Novo Cliente"
              >
                <Plus size={15} />
                <span>Novo cliente</span>
              </button>
            )}
          </div>
        </div>

        {/* MODAL DE AJUDA & STATUS TÉCNICO (DISCRETO) */}
        {isHelpModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
            }}
            onClick={() => setIsHelpModalOpen(false)}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                padding: '24px 28px',
                width: 480,
                maxWidth: '90vw',
                border: '1px solid #E5E7EB',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#17181A', margin: 0 }}>
                  Ajuda & Suporte Operacional
                </h3>
                <button
                  onClick={() => setIsHelpModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#667085' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A', marginBottom: 6 }}>
                    Atalhos do Teclado (Balcão OS)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.75rem', color: '#667085' }}>
                    <div><kbd style={{ padding: '2px 6px', background: '#F3F4F6', borderRadius: 4, border: '1px solid #E5E7EB', color: '#17181A' }}>Ctrl+K</kbd> Busca global</div>
                    <div><kbd style={{ padding: '2px 6px', background: '#F3F4F6', borderRadius: 4, border: '1px solid #E5E7EB', color: '#17181A' }}>F2</kbd> Nova venda (PDV)</div>
                    <div><kbd style={{ padding: '2px 6px', background: '#F3F4F6', borderRadius: 4, border: '1px solid #E5E7EB', color: '#17181A' }}>F3</kbd> Nova O.S.</div>
                    <div><kbd style={{ padding: '2px 6px', background: '#F3F4F6', borderRadius: 4, border: '1px solid #E5E7EB', color: '#17181A' }}>Esc</kbd> Fechar modal</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 12 }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#17181A', marginBottom: 6 }}>
                    Status da Infraestrutura
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#667085' }}>Banco de Dados:</span>
                      <span style={{ color: dbHealth.online ? '#16A34A' : '#DC2626', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dbHealth.online ? '#16A34A' : '#DC2626' }} />
                        {dbHealth.online ? 'Supabase Cloud Conectado' : 'Modo Offline (Cache Local)'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#667085' }}>Segurança & LGPD:</span>
                      <span style={{ color: '#16A34A', fontWeight: 500 }}>Dados Reais Criptografados</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#667085' }}>Versão do Sistema:</span>
                      <span style={{ color: '#17181A', fontWeight: 500 }}>Balcão OS v2.4 (Build 2026.10)</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setIsHelpModalOpen(false)}
                    className="balcao-btn-primary"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TELAS DO SISTEMA ERP */}
        <main style={{ flex: 1, paddingBottom: 40 }}>
          {activeTab === 'dashboard' && (
            <DashboardView
              devices={devices}
              serviceOrders={serviceOrders}
              sales={sales}
              isCashOpen={cashRegister.isOpen}
              onToggleCash={handleToggleCash}
              onNavigate={(tab) => setActiveTab(tab as ERPNavTab)}
              onOpenNewDevice={() => setActiveTab('inventory')}
              onQuickNewSale={() => setActiveTab('checkout')}
              onQuickNewOS={() => setActiveTab('service_order')}
            />
          )}

          {activeTab === 'checkout' && (
            <CheckoutView
              devices={devices}
              accessories={accessories}
              serviceOrders={serviceOrders}
              customers={customers}
              isCashOpen={cashRegister.isOpen}
              onOpenCash={() => setActiveTab('cash')}
              onCompleteSale={handleCompleteSale}
              onNavigateToWarranty={() => setActiveTab('warranty')}
            />
          )}

          {activeTab === 'sales_history' && (
            <SalesHistoryView
              sales={sales}
              onOpenWarranty={() => {
                setActiveTab('warranty');
              }}
              onCancelSale={handleCancelSale}
            />
          )}

          {activeTab === 'crm_customers' && (
            <CrmKanbanView />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onNavigateToPOS={(_customerName) => {
                setActiveTab('checkout');
              }}
            />
          )}

          {activeTab === 'after_sales' && (
            <AfterSalesView
              triggers={afterSalesTriggers}
              onTriggerAction={handleTriggerAction}
            />
          )}

          {[
            'stock_dashboard',
            'inventory',
            'phone_purchases',
            'products',
            'parts',
            'suppliers',
            'showcase'
          ].includes(activeTab) && (
            <StockShowcaseHub
              initialSubmodule={activeTab as StockSubmoduleTab}
              devices={devices}
              products={products}
              parts={parts}
              suppliers={suppliers}
              purchases={purchases}
              movements={movements}
              onAddDevice={handleAddDevice}
              onUpdateDevice={handleUpdateDevice}
              onDeleteDevice={handleDeleteDevice}
              onCreateProduct={handleCreateProduct}
              onUpdateProduct={handleUpdateProduct}
              onAdjustProductStock={handleAdjustProductStock}
              onDeleteProduct={handleDeleteProduct}
              onCreatePart={handleCreatePart}
              onUpdatePart={handleUpdatePart}
              onAdjustPartStock={handleAdjustPartStock}
              onDeletePart={handleDeletePart}
              onCreateSupplier={handleCreateSupplier}
              onUpdateSupplier={handleUpdateSupplier}
              onDeleteSupplier={handleDeleteSupplier}
              onCreatePurchase={handleCreatePurchase}
              onConfirmPurchase={handleConfirmPurchase}
              onStartSaleInPOS={handleStartSaleInPOS}
            />
          )}

          {activeTab === 'labels' && (
            <LabelPrintView
              devices={devices}
              products={products}
              onNavigateToStock={() => setActiveTab('stock_dashboard')}
            />
          )}

          {[
            'assistance_dashboard',
            'service_order',
            'services',
            'warranty'
          ].includes(activeTab) && (
            <TechnicalAssistanceHub
              initialSubmodule={
                activeTab === 'assistance_dashboard' ? 'dashboard' :
                activeTab === 'service_order' ? 'service_order' :
                activeTab === 'services' ? 'services' :
                'warranty'
              }
              serviceOrders={serviceOrders}
              warranties={warranties}
              claims={warrantyClaims}
              services={technicalServices}
              parts={parts}
              customers={customers}
              devices={devices}
              onAddServiceOrder={async (os) => {
                await createServiceOrderApi(os);
                const updated = await fetchServiceOrders();
                if (updated) setServiceOrders(updated);
              }}
              onUpdateOSStatus={handleUpdateOSStatus}
              onUpdateOSQuote={handleUpdateOSQuote}
              onRecordOSApproval={handleRecordOSApproval}
              onCreateService={handleCreateTechnicalService}
              onUpdateService={handleUpdateTechnicalService}
              onDeleteService={handleDeleteTechnicalService}
              onCreateClaim={handleCreateWarrantyClaim}
              onUpdateClaim={handleUpdateWarrantyClaim}
              onAddCustomer={handleAddCustomer}
            />
          )}

          {activeTab === 'cash' && (
            <CashControlView
              cashRegister={cashRegister}
              sales={sales}
              onToggleCash={handleToggleCash}
              onOpenCash={handleOpenCash}
              onCloseCash={handleCloseCash}
              onAddTransaction={handleAddCashTransaction}
            />
          )}

          {activeTab === 'financial_intelligence' && (
            <FinancialIntelligenceHub
              sales={sales}
              serviceOrders={serviceOrders}
              devices={devices}
              products={products}
            />
          )}

          {[
            'financial',
            'profile',
            'reports',
            'commissions',
            'timecard',
            'users',
            'settings',
          ].includes(activeTab) && (
            <ManagementHub
              initialSubmodule={activeTab as ManagementSubmoduleTab}
              sales={sales}
              serviceOrders={serviceOrders}
              devices={devices}
              products={products}
              customers={customers}
            />
          )}

          {[
            'subscription',
            'support',
            'migration',
          ].includes(activeTab) && (
            <ExtendedModulesView
              tab={activeTab}
              accessories={accessories}
              devices={devices}
              onNavigateToPOS={() => setActiveTab('checkout')}
              onOpenNewDevice={() => setActiveTab('inventory')}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
