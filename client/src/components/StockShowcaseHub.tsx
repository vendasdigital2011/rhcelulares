import React, { useState } from 'react';
import {
  BarChart3,
  Smartphone,
  ShoppingBag,
  Package,
  Cpu,
  Truck,
  Globe,
} from 'lucide-react';
import type { Device, Product, Part, Supplier, PhonePurchase, InventoryMovement } from '../types.js';
import { StockDashboardView } from './stock/StockDashboardView.js';
import { DeviceStockView } from './stock/DeviceStockView.js';
import { PhonePurchaseView } from './stock/PhonePurchaseView.js';
import { ProductsView } from './stock/ProductsView.js';
import { PartsView } from './stock/PartsView.js';
import { SuppliersView } from './stock/SuppliersView.js';
import { ShowcaseManageView } from './stock/ShowcaseManageView.js';

export type StockSubmoduleTab = 
  | 'stock_dashboard'
  | 'inventory'
  | 'phone_purchases'
  | 'products'
  | 'parts'
  | 'suppliers'
  | 'showcase';

interface StockShowcaseHubProps {
  initialSubmodule?: StockSubmoduleTab;
  devices: Device[];
  products: Product[];
  parts: Part[];
  suppliers: Supplier[];
  purchases: PhonePurchase[];
  movements: InventoryMovement[];
  onAddDevice: (device: Device) => void;
  onUpdateDevice: (imei: string, updates: Partial<Device>) => void;
  onDeleteDevice: (imei: string) => void;
  onCreateProduct: (prod: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onAdjustProductStock: (id: string, delta: number, reason: string) => void;
  onDeleteProduct: (id: string) => void;
  onCreatePart: (part: Omit<Part, 'id' | 'createdAt'>) => void;
  onUpdatePart: (id: string, updates: Partial<Part>) => void;
  onAdjustPartStock: (id: string, delta: number, reason: string) => void;
  onDeletePart: (id: string) => void;
  onCreateSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  onUpdateSupplier: (id: string, updates: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => void;
  onCreatePurchase: (purchase: Omit<PhonePurchase, 'id' | 'createdAt'>) => void;
  onConfirmPurchase: (id: string) => void;
  onStartSaleInPOS: (device?: Device) => void;
}

export const StockShowcaseHub: React.FC<StockShowcaseHubProps> = ({
  initialSubmodule = 'stock_dashboard',
  devices,
  products,
  parts,
  suppliers,
  purchases,
  movements,
  onAddDevice,
  onUpdateDevice,
  onDeleteDevice,
  onCreateProduct,
  onUpdateProduct,
  onAdjustProductStock,
  onDeleteProduct,
  onCreatePart,
  onUpdatePart,
  onAdjustPartStock,
  onDeletePart,
  onCreateSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onCreatePurchase,
  onConfirmPurchase,
  onStartSaleInPOS,
}) => {
  const [activeSubmodule, setActiveSubmodule] = useState<StockSubmoduleTab>(initialSubmodule);

  // Sincroniza se a prop mudar vinda da Sidebar
  React.useEffect(() => {
    if (initialSubmodule) {
      setActiveSubmodule(initialSubmodule);
    }
  }, [initialSubmodule]);

  const navItems: Array<{ id: StockSubmoduleTab; label: string; icon: React.ComponentType<{ size?: number; color?: string }>; count?: number }> = [
    { id: 'stock_dashboard', label: 'Visão Geral & Métricas', icon: BarChart3 },
    { id: 'inventory', label: 'Estoque Celulares', icon: Smartphone, count: devices.filter(d => d.status === 'available').length },
    { id: 'phone_purchases', label: 'Compra de Telefone', icon: ShoppingBag, count: purchases.length },
    { id: 'products', label: 'Produtos & Acessórios', icon: Package, count: products.length },
    { id: 'parts', label: 'Peças de Bancada', icon: Cpu, count: parts.length },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck, count: suppliers.length },
    { id: 'showcase', label: 'Vitrine Online', icon: Globe, count: devices.filter(d => d.isShowcasePublic && d.status === 'available').length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* BARRA SUPERIOR DE SUB-NAVEGAÇÃO */}
      <div style={{
        background: '#0d121f',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '8px 32px 0 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        position: 'sticky',
        top: 60,
        zIndex: 30,
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubmodule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSubmodule(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: isActive ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
                color: isActive ? '#f97316' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                borderBottom: isActive ? '3px solid #f97316' : '3px solid transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} color={isActive ? '#f97316' : '#64748b'} />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: isActive ? 'rgba(249, 115, 22, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#fff' : '#94a3b8',
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ÁREA DE CONTEÚDO DO SUBMÓDULO ATIVO */}
      <div style={{ flex: 1, paddingBottom: 40 }}>
        {activeSubmodule === 'stock_dashboard' && (
          <StockDashboardView
            devices={devices}
            products={products}
            parts={parts}
            suppliers={suppliers}
            purchases={purchases}
            movements={movements}
            onNavigateSubmodule={(sub) => setActiveSubmodule(sub)}
            onQuickNewDevice={() => setActiveSubmodule('inventory')}
            onQuickNewPurchase={() => setActiveSubmodule('phone_purchases')}
            onQuickNewProduct={() => setActiveSubmodule('products')}
          />
        )}

        {activeSubmodule === 'inventory' && (
          <DeviceStockView
            devices={devices}
            onAddDevice={onAddDevice}
            onUpdateDevice={onUpdateDevice}
            onDeleteDevice={onDeleteDevice}
          />
        )}

        {activeSubmodule === 'phone_purchases' && (
          <PhonePurchaseView
            purchases={purchases}
            suppliers={suppliers}
            onCreatePurchase={onCreatePurchase}
            onConfirmPurchase={onConfirmPurchase}
          />
        )}

        {activeSubmodule === 'products' && (
          <ProductsView
            products={products}
            onCreateProduct={onCreateProduct}
            onUpdateProduct={onUpdateProduct}
            onAdjustStock={onAdjustProductStock}
            onDeleteProduct={onDeleteProduct}
          />
        )}

        {activeSubmodule === 'parts' && (
          <PartsView
            parts={parts}
            onCreatePart={onCreatePart}
            onUpdatePart={onUpdatePart}
            onAdjustStock={onAdjustPartStock}
            onDeletePart={onDeletePart}
          />
        )}

        {activeSubmodule === 'suppliers' && (
          <SuppliersView
            suppliers={suppliers}
            purchases={purchases}
            onCreateSupplier={onCreateSupplier}
            onUpdateSupplier={onUpdateSupplier}
            onDeleteSupplier={onDeleteSupplier}
          />
        )}

        {activeSubmodule === 'showcase' && (
          <ShowcaseManageView
            devices={devices}
            products={products}
            onToggleShowcasePublic={(imei, isPub) => onUpdateDevice(imei, { isShowcasePublic: isPub })}
            onToggleShowcaseFeatured={(imei, isFeat) => onUpdateDevice(imei, { isShowcaseFeatured: isFeat })}
            onStartSaleInPOS={(dev) => onStartSaleInPOS(dev)}
            onOpenNewDevice={() => setActiveSubmodule('inventory')}
          />
        )}
      </div>
    </div>
  );
};
