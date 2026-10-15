import { useState, useEffect } from 'react';
import { Sidebar, type ERPNavTab } from './components/Sidebar.js';
import { DashboardView } from './components/DashboardView.js';
import { CheckoutView } from './components/CheckoutView.js';
import { CashControlView } from './components/CashControlView.js';
import { LabelPrintView } from './components/LabelPrintView.js';
import { SalesHistoryView } from './components/SalesHistoryView.js';
import { CustomersView } from './components/CustomersView.js';
import { AfterSalesView } from './components/AfterSalesView.js';
import { ExtendedModulesView } from './components/ExtendedModulesView.js';
import { StockShowcaseHub, type StockSubmoduleTab } from './components/StockShowcaseHub.js';
import { TechnicalAssistanceHub } from './components/TechnicalAssistanceHub.js';
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
import { Store, Bell, ShieldCheck, Database } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ERPNavTab>('dashboard');

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
        {/* BARRA SUPERIOR ELEGANTE */}
        <header
          style={{
            height: 56,
            background: 'rgba(9, 13, 22, 0.75)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8' }}>
              Loja Selecionada:
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: '0.78rem',
                color: '#f8fafc',
                fontWeight: 600,
              }}
            >
              <Store size={13} color="#f97316" />
              <span>Hiago iPhones • Matriz Centro</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Status do Banco de Dados Supabase Cloud */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: dbHealth.online && dbHealth.tablesCreated 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : dbHealth.online 
                    ? 'rgba(245, 158, 11, 0.12)' 
                    : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${
                  dbHealth.online && dbHealth.tablesCreated 
                    ? 'rgba(16, 185, 129, 0.3)' 
                    : dbHealth.online 
                      ? 'rgba(245, 158, 11, 0.35)' 
                      : 'rgba(239, 68, 68, 0.3)'
                }`,
                color: dbHealth.online && dbHealth.tablesCreated 
                  ? '#10b981' 
                  : dbHealth.online 
                    ? '#f59e0b' 
                    : '#ef4444',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
              title={dbHealth.error || (dbHealth.tablesCreated ? 'Conectado diretamente ao Supabase PostgreSQL' : 'Execute o script DDL no SQL Editor do Supabase')}
            >
              <Database size={13} />
              <span>
                {dbHealth.online && dbHealth.tablesCreated 
                  ? 'Supabase Cloud Ativo' 
                  : dbHealth.online 
                    ? 'Supabase Conectado (Aguardando DDL)' 
                    : 'Modo Offline (Cache Local)'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                color: '#60a5fa',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={13} />
              <span>Dados Reais Protegidos</span>
            </div>

            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <Bell size={15} />
            </div>
          </div>
        </header>

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

          {[
            'financial',
            'profile',
            'reports',
            'commissions',
            'timecard',
            'users',
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
