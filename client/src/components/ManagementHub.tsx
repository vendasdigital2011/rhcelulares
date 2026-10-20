import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  User,
  BarChart3,
  Percent,
  Clock,
  Users,
  Settings,
  Palette,
} from 'lucide-react';
import { FinancialManagementView } from './management/FinancialManagementView.js';
import { UserProfileView } from './management/UserProfileView.js';
import { ReportsCentralView } from './management/ReportsCentralView.js';
import { CommissionsView } from './management/CommissionsView.js';
import { TimecardView } from './management/TimecardView.js';
import { UsersPermissionsView } from './management/UsersPermissionsView.js';
import { StoreSettingsView } from './management/StoreSettingsView.js';
import { AppearanceDesignerSubmodule } from './management/AppearanceDesignerSubmodule.js';
import type { Sale, ServiceOrder, Device, Product, Customer } from '../types.js';

export type ManagementSubmoduleTab =
  | 'financial'
  | 'profile'
  | 'reports'
  | 'commissions'
  | 'timecard'
  | 'users'
  | 'settings'
  | 'designer';

interface ManagementHubProps {
  initialSubmodule?: ManagementSubmoduleTab;
  sales: Sale[];
  serviceOrders: ServiceOrder[];
  devices: Device[];
  products: Product[];
  customers: Customer[];
}

export const ManagementHub: React.FC<ManagementHubProps> = ({
  initialSubmodule = 'financial',
  sales = [],
  serviceOrders = [],
  devices = [],
  products = [],
  customers = [],
}) => {
  const [activeSubmodule, setActiveSubmodule] = useState<ManagementSubmoduleTab>(initialSubmodule);

  useEffect(() => {
    if (initialSubmodule) {
      setActiveSubmodule(initialSubmodule);
    }
  }, [initialSubmodule]);

  const navItems = [
    { id: 'financial' as ManagementSubmoduleTab, label: 'Financeiro', icon: TrendingUp },
    { id: 'designer' as ManagementSubmoduleTab, label: 'Aparência & Designer', icon: Palette },
    { id: 'settings' as ManagementSubmoduleTab, label: 'Configurações da Loja', icon: Settings },
    { id: 'profile' as ManagementSubmoduleTab, label: 'Meu Perfil', icon: User },
    { id: 'reports' as ManagementSubmoduleTab, label: 'Relatórios', icon: BarChart3 },
    { id: 'commissions' as ManagementSubmoduleTab, label: 'Comissões', icon: Percent },
    { id: 'timecard' as ManagementSubmoduleTab, label: 'Ponto', icon: Clock },
    { id: 'users' as ManagementSubmoduleTab, label: 'Usuários & Permissões', icon: Users },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--canvas-bg)' }}>
      {/* BARRA SUPERIOR DE NAVEGAÇÃO DO MÓDULO GESTÃO COM BORDAS E CORES UNIFICADAS */}
      <div
        style={{
          background: 'var(--surface-bg)',
          borderBottom: 'var(--border-width) solid var(--border-default)',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {navItems.map(item => {
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
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: `var(--border-width) solid ${isActive ? 'var(--color-primary)' : 'var(--border-default)'}`,
                  cursor: 'pointer',
                  background: isActive ? 'var(--color-primary)' : 'var(--surface-hover)',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 2px 8px rgba(249, 115, 22, 0.25)' : 'none',
                  transition: 'all var(--animation-duration) ease',
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
          Design System & Gestão Corporativa RH / Hiago
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL DO SUBMÓDULO SELECIONADO */}
      <div style={{ flex: 1, padding: '24px 32px 40px' }}>
        {activeSubmodule === 'financial' && <FinancialManagementView />}
        {activeSubmodule === 'designer' && <AppearanceDesignerSubmodule />}
        {activeSubmodule === 'settings' && <StoreSettingsView onNavigateToDesigner={() => setActiveSubmodule('designer')} />}
        {activeSubmodule === 'profile' && <UserProfileView />}
        {activeSubmodule === 'reports' && (
          <ReportsCentralView
            sales={sales}
            serviceOrders={serviceOrders}
            devices={devices}
            products={products}
            customers={customers}
          />
        )}
        {activeSubmodule === 'commissions' && <CommissionsView sales={sales} />}
        {activeSubmodule === 'timecard' && <TimecardView />}
        {activeSubmodule === 'users' && <UsersPermissionsView />}
      </div>
    </div>
  );
};
