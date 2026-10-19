import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Wrench, 
  Cog, 
  ShieldCheck 
} from 'lucide-react';
import type { 
  ServiceOrder, 
  WarrantyEntry, 
  WarrantyClaim, 
  TechnicalService, 
  Part, 
  Customer, 
  Device, 
  OSStatus, 
  OSQuoteServiceItem, 
  OSQuotePartItem 
} from '../types.js';
import { TechnicalAssistanceDashboard } from './assistance/TechnicalAssistanceDashboard.js';
import { ServiceOrderView } from './assistance/ServiceOrderView.js';
import { ServicesCatalogView } from './assistance/ServicesCatalogView.js';
import { WarrantyManagementView } from './assistance/WarrantyManagementView.js';

export type AssistanceSubmoduleTab = 'dashboard' | 'service_order' | 'services' | 'warranty';

interface TechnicalAssistanceHubProps {
  initialSubmodule?: AssistanceSubmoduleTab;
  serviceOrders: ServiceOrder[];
  warranties: WarrantyEntry[];
  claims: WarrantyClaim[];
  services: TechnicalService[];
  parts: Part[];
  customers: Customer[];
  devices: Device[];
  onAddServiceOrder: (os: ServiceOrder) => Promise<any>;
  onUpdateOSStatus: (id: string, status: OSStatus, notes?: string, operator?: string, extra?: Partial<ServiceOrder>) => Promise<any>;
  onUpdateOSQuote: (id: string, services: OSQuoteServiceItem[], parts: OSQuotePartItem[], discount: number) => Promise<any>;
  onRecordOSApproval: (id: string, approval: any) => Promise<any>;
  onCreateService: (service: Omit<TechnicalService, 'id' | 'createdAt'>) => Promise<any>;
  onUpdateService: (id: string, updates: Partial<TechnicalService>) => Promise<any>;
  onDeleteService: (id: string) => Promise<any>;
  onCreateClaim: (claim: Omit<WarrantyClaim, 'id' | 'createdAt'>) => Promise<any>;
  onUpdateClaim: (id: string, updates: Partial<WarrantyClaim>) => Promise<any>;
  onAddCustomer?: (customer: Customer) => Promise<any>;
}

export const TechnicalAssistanceHub: React.FC<TechnicalAssistanceHubProps> = ({
  initialSubmodule = 'dashboard',
  serviceOrders,
  warranties,
  claims,
  services,
  parts,
  customers,
  devices,
  onAddServiceOrder,
  onUpdateOSStatus,
  onUpdateOSQuote,
  onRecordOSApproval,
  onCreateService,
  onUpdateService,
  onDeleteService,
  onCreateClaim,
  onUpdateClaim,
  onAddCustomer,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AssistanceSubmoduleTab>(initialSubmodule);

  // Sincroniza se a prop mudar vinda do Sidebar
  useEffect(() => {
    if (initialSubmodule) {
      setActiveSubTab(initialSubmodule);
    }
  }, [initialSubmodule]);

  const navItems = [
    {
      id: 'dashboard' as AssistanceSubmoduleTab,
      label: 'Painel Geral',
      icon: BarChart3,
      count: undefined,
    },
    {
      id: 'service_order' as AssistanceSubmoduleTab,
      label: 'Ordens de Serviço',
      icon: Wrench,
      count: serviceOrders.length,
    },
    {
      id: 'services' as AssistanceSubmoduleTab,
      label: 'Catálogo de Serviços',
      icon: Cog,
      count: services.length,
    },
    {
      id: 'warranty' as AssistanceSubmoduleTab,
      label: 'Garantias & Retornos',
      icon: ShieldCheck,
      count: warranties.length,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--canvas-bg)' }}>
      {/* SUB-HEADER ELEGANTE DE NAVEGAÇÃO DA ASSISTÊNCIA TÉCNICA (BALCÃO OS) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 52,
          zIndex: 35,
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          {navItems.map(item => {
            const isActive = activeSubTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? '#f97316' : 'transparent'}`,
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} color={isActive ? '#f97316' : '#64748b'} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    style={{
                      background: isActive ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#f97316' : '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 10,
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDERIZAÇÃO DA SUB-VIEW SELECIONADA */}
      <div style={{ flex: 1, paddingBottom: 40 }}>
        {activeSubTab === 'dashboard' && (
          <TechnicalAssistanceDashboard
            serviceOrders={serviceOrders}
            warranties={warranties}
            services={services}
            onNavigateSubmodule={(tab) => setActiveSubTab(tab)}
            onOpenNewOS={() => setActiveSubTab('service_order')}
          />
        )}

        {activeSubTab === 'service_order' && (
          <ServiceOrderView
            serviceOrders={serviceOrders}
            customers={customers}
            servicesCatalog={services}
            partsInventory={parts}
            stockDevices={devices}
            onAddServiceOrder={onAddServiceOrder}
            onUpdateStatus={onUpdateOSStatus}
            onUpdateQuote={onUpdateOSQuote}
            onRecordApproval={onRecordOSApproval}
            onAddCustomer={onAddCustomer}
          />
        )}

        {activeSubTab === 'services' && (
          <ServicesCatalogView
            services={services}
            onCreateService={onCreateService}
            onUpdateService={onUpdateService}
            onDeleteService={onDeleteService}
          />
        )}

        {activeSubTab === 'warranty' && (
          <WarrantyManagementView
            warranties={warranties}
            claims={claims}
            serviceOrders={serviceOrders}
            onCreateClaim={onCreateClaim}
            onUpdateClaim={onUpdateClaim}
            onNavigateToOS={(_osNum) => setActiveSubTab('service_order')}
          />
        )}
      </div>
    </div>
  );
};
