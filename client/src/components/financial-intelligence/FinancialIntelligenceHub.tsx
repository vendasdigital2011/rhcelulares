import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Wallet,
  Clock,
  PieChart,
  Layers,
  CheckCircle2,
  Sliders,
  TrendingUp,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import type {
  FinancialIntelligenceSubtab,
  FinancialConsolidatedData,
  PeriodFilter,
  Sale,
  ServiceOrder,
  Device,
  Product,
} from '../../types.js';
import { FinancialIntelligenceRepository } from '../../repositories/financialIntelligenceRepository.js';
import { ExecutiveDashboardView } from './ExecutiveDashboardView.js';
import { CashFlowView } from './CashFlowView.js';
import { PayablesReceivablesView } from './PayablesReceivablesView.js';
import { ProfitabilityView } from './ProfitabilityView.js';
import { ForecastScenariosView } from './ForecastScenariosView.js';
import { AiAnalystView } from './AiAnalystView.js';
import { ActionPlansView } from './ActionPlansView.js';
import { AnalysisHistoryView } from './AnalysisHistoryView.js';
import { FinancialSettingsView } from './FinancialSettingsView.js';

interface FinancialIntelligenceHubProps {
  initialSubtab?: FinancialIntelligenceSubtab;
  sales?: Sale[];
  serviceOrders?: ServiceOrder[];
  devices?: Device[];
  products?: Product[];
}

export const FinancialIntelligenceHub: React.FC<FinancialIntelligenceHubProps> = ({
  initialSubtab = 'executive_dashboard',
  sales = [],
  serviceOrders = [],
  devices = [],
  products = [],
}) => {
  const [activeSubtab, setActiveSubtab] = useState<FinancialIntelligenceSubtab>(initialSubtab);
  const [period, setPeriod] = useState<PeriodFilter>('this_month');
  const [data, setData] = useState<FinancialConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const consolidated = await FinancialIntelligenceRepository.getConsolidatedData(
        period,
        sales,
        serviceOrders,
        devices,
        products
      );
      setData(consolidated);
    } catch (e) {
      console.error('Erro ao consolidar dados da Inteligência Financeira:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period, sales, serviceOrders, devices, products]);

  const SUBTABS: Array<{ id: FinancialIntelligenceSubtab; label: string; icon: React.ComponentType<{ size?: number; color?: string }> }> = [
    { id: 'executive_dashboard', label: 'Visão Financeira', icon: LayoutDashboard },
    { id: 'cash_flow', label: 'Fluxo de Caixa', icon: Wallet },
    { id: 'payables_receivables', label: 'Contas a Pagar / Receber', icon: Clock },
    { id: 'profitability', label: 'Análise de Rentabilidade', icon: PieChart },
    { id: 'forecast_scenarios', label: 'Previsão & Cenários', icon: Layers },
    { id: 'ai_analyst', label: 'Analista de IA', icon: Sparkles },
    { id: 'action_plans', label: 'Planos de Ação', icon: CheckCircle2 },
    { id: 'analysis_history', label: 'Histórico de Análises', icon: TrendingUp },
    { id: 'financial_settings', label: 'Configurações', icon: Sliders },
  ];

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. BARRA SUPERIOR DO MÓDULO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            width: 42,
            height: 42,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>
                Inteligência Financeira com IA
              </h1>
              <span style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}>
                OpenAI + Motor Determinístico
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
              Controladoria, fluxo de caixa, DRE gerencial e suporte à tomada de decisão para Hiago iPhones.
            </p>
          </div>
        </div>

        {/* CONTROLES: PERÍODO & ATUALIZAR */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#0d1322',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            padding: '4px 10px',
            gap: 6,
          }}>
            <Calendar size={14} color="#94a3b8" />
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as PeriodFilter)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="this_month">Mês Vigente (Out/2026)</option>
              <option value="last_30_days">Últimos 30 Dias</option>
              <option value="last_90_days">Últimos 90 Dias</option>
              <option value="year_to_date">Ano Atual (2026)</option>
            </select>
          </div>

          <button
            onClick={loadData}
            title="Recalcular Métricas"
            style={{
              background: '#0d1322',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* 2. MENU DE NAVEGAÇÃO ENTRE AS 9 SUBSEÇÕES */}
      <div style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: 8,
      }}>
        {SUBTABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubtab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubtab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#fff' : '#94a3b8',
                fontSize: '0.78rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} color={isActive ? '#fff' : '#94a3b8'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. CONTEÚDO DA SUBSEÇÃO ATIVA */}
      {loading && !data ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <div>Consolidando indicadores de liquidez, DRE e projeções...</div>
        </div>
      ) : data ? (
        <div>
          {activeSubtab === 'executive_dashboard' && (
            <ExecutiveDashboardView
              data={data}
              onNavigate={setActiveSubtab}
              onRequestAI={() => setActiveSubtab('ai_analyst')}
            />
          )}

          {activeSubtab === 'cash_flow' && (
            <CashFlowView data={data} />
          )}

          {activeSubtab === 'payables_receivables' && (
            <PayablesReceivablesView data={data} />
          )}

          {activeSubtab === 'profitability' && (
            <ProfitabilityView data={data} />
          )}

          {activeSubtab === 'forecast_scenarios' && (
            <ForecastScenariosView data={data} />
          )}

          {activeSubtab === 'ai_analyst' && (
            <AiAnalystView data={data} />
          )}

          {activeSubtab === 'action_plans' && (
            <ActionPlansView data={data} />
          )}

          {activeSubtab === 'analysis_history' && (
            <AnalysisHistoryView />
          )}

          {activeSubtab === 'financial_settings' && (
            <FinancialSettingsView />
          )}
        </div>
      ) : null}
    </div>
  );
};
