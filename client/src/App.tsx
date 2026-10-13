import { useState, useEffect } from 'react';
import { Sidebar, type ERPNavTab } from './components/Sidebar.js';
import { DashboardView } from './components/DashboardView.js';
import { CheckoutView } from './components/CheckoutView.js';
import { DeviceInventoryView } from './components/DeviceInventoryView.js';
import { ServiceOrderView } from './components/ServiceOrderView.js';
import { CashControlView } from './components/CashControlView.js';
import { ShowcaseView } from './components/ShowcaseView.js';
import { LabelPrintView } from './components/LabelPrintView.js';
import { WarrantyView } from './components/WarrantyView.js';
import { SalesHistoryView } from './components/SalesHistoryView.js';
import { CustomersView } from './components/CustomersView.js';
import { AfterSalesView } from './components/AfterSalesView.js';
import { ExtendedModulesView } from './components/ExtendedModulesView.js';
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
  fetchSales, 
  createSaleApi, 
  fetchServiceOrders, 
  createServiceOrderApi, 
  fetchCashRegister, 
  toggleCashApi 
} from './api/erpApi.js';
import type { Device, Accessory, ServiceOrder, CashRegister, Sale, Customer, AfterSalesTrigger } from './types.js';
import { Store, Bell, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ERPNavTab>('dashboard');

  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [accessories] = useState<Accessory[]>(INITIAL_ACCESSORIES);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(INITIAL_SERVICE_ORDERS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [cashRegister, setCashRegister] = useState<CashRegister>(INITIAL_CASH);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [afterSalesTriggers, setAfterSalesTriggers] = useState<AfterSalesTrigger[]>(INITIAL_AFTER_SALES_TRIGGERS);

  // Carrega dados iniciais do backend com fallback resiliente
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedDevices, loadedSales, loadedOS, loadedCash] = await Promise.all([
          fetchDevices(),
          fetchSales(),
          fetchServiceOrders(),
          fetchCashRegister(),
        ]);
        if (loadedDevices?.length) setDevices(loadedDevices);
        if (loadedSales?.length) setSales(loadedSales);
        if (loadedOS?.length) setServiceOrders(loadedOS);
        if (loadedCash) setCashRegister(loadedCash);
      } catch (err) {
        console.warn('Usando dados mockados de inicialização:', err);
      }
    }
    loadData();
  }, []);

  // Alternar Abertura / Fechamento de Caixa
  const handleToggleCash = async () => {
    try {
      const updated = await toggleCashApi();
      setCashRegister(updated);
    } catch {
      setCashRegister(prev => ({
        ...prev,
        isOpen: !prev.isOpen,
        openedAt: !prev.isOpen ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      }));
    }
  };

  // Concluir Venda no PDV (Checkout Rápido)
  const handleCompleteSale = async (saleData: any) => {
    const newSalePayload: Sale = {
      id: `sale-${Date.now()}`,
      saleNumber: `VD-${2092 + sales.length}`,
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
    };

    // Salva no backend e atualiza estado local
    await createSaleApi(newSalePayload);
    setSales(prev => [newSalePayload, ...prev]);

    // Atualiza status dos aparelhos vendidos
    saleData.items.forEach((item: any) => {
      if (item.type === 'device' && item.imei) {
        setDevices(prev => prev.map(d => d.imei === item.imei ? { ...d, status: 'sold' } : d));
      }
    });

    // Se houve Trade-In, cadastra o aparelho usado de entrada
    if (saleData.tradeIn && saleData.tradeIn.model) {
      const tradeInDev: Device = {
        id: `dev-tradein-${Date.now()}`,
        brand: 'Apple',
        model: saleData.tradeIn.model,
        storage: 'Entrada',
        color: 'Usado',
        condition: 'certified_pre_owned',
        batteryHealth: saleData.tradeIn.batteryHealth || 80,
        imei: saleData.tradeIn.imei || '',
        purchasePrice: saleData.tradeIn.evaluatedValue,
        sellPrice: Math.round(saleData.tradeIn.evaluatedValue * 1.3),
        supplier: `Trade-in (${saleData.customerName})`,
        status: 'available',
        isShowcasePublic: false,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setDevices(prev => [tradeInDev, ...prev]);
    }

    // Abre a tela de emissão de Termo de Garantia da venda recém-feita
    setActiveTab('warranty');
  };

  // Adicionar novo aparelho ao estoque
  const handleAddDevice = async (device: Device) => {
    await createDeviceApi(device);
    setDevices(prev => [device, ...prev]);
  };

  // Adicionar nova Ordem de Serviço
  const handleAddServiceOrder = async (os: ServiceOrder) => {
    await createServiceOrderApi(os);
    setServiceOrders(prev => [os, ...prev]);
  };

  // Adicionar novo Cliente
  const handleAddCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={13} />
              <span>Sistema Conectado & Operacional</span>
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
              onCompleteSale={handleCompleteSale}
            />
          )}

          {activeTab === 'sales_history' && (
            <SalesHistoryView
              sales={sales}
              onOpenWarranty={() => {
                setActiveTab('warranty');
              }}
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
              onTriggerAction={(id, newStatus) => {
                setAfterSalesTriggers(prev =>
                  prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
                );
              }}
            />
          )}

          {activeTab === 'inventory' && (
            <DeviceInventoryView
              devices={devices}
              onAddDevice={handleAddDevice}
            />
          )}

          {activeTab === 'labels' && (
            <LabelPrintView
              devices={devices}
            />
          )}

          {activeTab === 'service_order' && (
            <ServiceOrderView
              serviceOrders={serviceOrders}
              onAddServiceOrder={handleAddServiceOrder}
            />
          )}

          {activeTab === 'cash' && (
            <CashControlView
              cashRegister={cashRegister}
              sales={sales}
              onToggleCash={handleToggleCash}
            />
          )}

          {activeTab === 'showcase' && (
            <ShowcaseView
              devices={devices}
              onOpenNewDevice={() => setActiveTab('inventory')}
            />
          )}

          {activeTab === 'warranty' && (
            <WarrantyView
              sales={sales}
              devices={devices}
            />
          )}

          {[
            'phone_purchases',
            'products',
            'parts',
            'suppliers',
            'services',
            'financial',
            'profile',
            'reports',
            'commissions',
            'timecard',
            'users',
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
