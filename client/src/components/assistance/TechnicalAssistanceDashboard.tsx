import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  User, 
  Plus, 
  Filter, 
  ChevronRight,
  Cpu
} from 'lucide-react';
import type { ServiceOrder, WarrantyEntry, TechnicalService } from '../../types.js';

interface DashboardProps {
  serviceOrders: ServiceOrder[];
  warranties: WarrantyEntry[];
  services: TechnicalService[];
  onNavigateSubmodule: (tab: 'service_order' | 'services' | 'warranty') => void;
  onOpenNewOS: () => void;
}

export const TechnicalAssistanceDashboard: React.FC<DashboardProps> = ({
  serviceOrders,
  warranties,
  services,
  onNavigateSubmodule,
  onOpenNewOS,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'today' | '7days' | 'month' | 'all'>('month');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('all');

  // Técnicos únicos reais para filtro
  const uniqueTechnicians = useMemo(() => {
    const set = new Set<string>();
    serviceOrders.forEach(os => {
      if (os.technician) set.add(os.technician);
    });
    return Array.from(set);
  }, [serviceOrders]);

  // Tipos de equipamento únicos
  const uniqueDeviceTypes = useMemo(() => {
    const set = new Set<string>();
    serviceOrders.forEach(os => {
      if (os.deviceType) set.add(os.deviceType);
      else set.add('Smartphone');
    });
    return Array.from(set);
  }, [serviceOrders]);

  // Filtragem dos dados reais
  const filteredOrders = useMemo(() => {
    return serviceOrders.filter(os => {
      if (technicianFilter !== 'all' && os.technician !== technicianFilter) return false;
      if (deviceTypeFilter !== 'all' && (os.deviceType || 'Smartphone') !== deviceTypeFilter) return false;
      return true;
    });
  }, [serviceOrders, technicianFilter, deviceTypeFilter]);

  // Indicadores calculados a partir de dados reais
  const metrics = useMemo(() => {
    const total = filteredOrders.length;
    
    // Status counts
    const openOrders = filteredOrders.filter(o => 
      !['entregue', 'delivered', 'cancelada'].includes(o.status)
    ).length;

    const awaitingDiagnosis = filteredOrders.filter(o => 
      ['aberta', 'received', 'aguardando_diagnostico'].includes(o.status)
    ).length;

    const inDiagnosis = filteredOrders.filter(o => 
      ['em_diagnostico', 'diagnosing'].includes(o.status)
    ).length;

    const awaitingApproval = filteredOrders.filter(o => 
      ['aguardando_aprovacao', 'aguardando_orcamento'].includes(o.status)
    ).length;

    const approvedWaitingExec = filteredOrders.filter(o => 
      o.status === 'aprovada'
    ).length;

    const inRepair = filteredOrders.filter(o => 
      o.status === 'em_reparo'
    ).length;

    const waitingParts = filteredOrders.filter(o => 
      ['aguardando_pecas', 'waiting_parts'].includes(o.status)
    ).length;

    const readyForPickup = filteredOrders.filter(o => 
      ['pronta', 'ready'].includes(o.status)
    ).length;

    const completed = filteredOrders.filter(o => 
      ['entregue', 'delivered'].includes(o.status)
    ).length;

    // Ordens atrasadas (se tiver estimatedDeliveryDate e ainda não entregue)
    const todayStr = new Date().toISOString().split('T')[0];
    const delayed = filteredOrders.filter(o => {
      if (['entregue', 'delivered', 'cancelada'].includes(o.status)) return false;
      if (!o.estimatedDeliveryDate) return false;
      // Trata formato dd/mm/yyyy ou yyyy-mm-dd
      let estDate = o.estimatedDeliveryDate;
      if (estDate.includes('/')) {
        const [d, m, y] = estDate.split('/');
        estDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      return estDate < todayStr;
    }).length;

    // Garantias reais
    const activeWarranties = warranties.filter(w => w.status === 'active').length;
    const expiringWarranties = warranties.filter(w => w.status === 'expiring_soon').length;

    // Financeiro real dos serviços
    let totalServiceRevenue = 0;
    let totalPartsCost = 0;
    let totalReceived = 0;
    let totalPending = 0;

    filteredOrders.forEach(os => {
      const val = os.finalValue || os.estimatedValue || 0;
      totalServiceRevenue += val;

      if (os.paymentStatus === 'paid' || ['entregue', 'delivered'].includes(os.status)) {
        totalReceived += val;
      } else {
        totalPending += val;
      }

      // Custo de peças reais
      if (os.quoteParts && os.quoteParts.length > 0) {
        os.quoteParts.forEach(p => {
          totalPartsCost += (p.unitCost || 0) * (p.quantity || 1);
        });
      }
    });

    const estimatedNetProfit = Math.max(0, totalServiceRevenue - totalPartsCost);

    // Contagem de reparos por técnico
    const technicianVolume: Record<string, number> = {};
    filteredOrders.forEach(os => {
      const tech = os.technician || 'Não Atribuído';
      technicianVolume[tech] = (technicianVolume[tech] || 0) + 1;
    });

    return {
      total,
      openOrders,
      awaitingDiagnosis,
      inDiagnosis,
      awaitingApproval,
      approvedWaitingExec,
      inRepair,
      waitingParts,
      readyForPickup,
      completed,
      delayed,
      activeWarranties,
      expiringWarranties,
      totalServiceRevenue,
      totalPartsCost,
      totalReceived,
      totalPending,
      estimatedNetProfit,
      technicianVolume,
    };
  }, [filteredOrders, warranties]);

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1440, margin: '0 auto' }}>
      
      {/* CABEÇALHO DO DASHBOARD OPERACIONAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ASSISTÊNCIA TÉCNICA ESPECIALIZADA
            </span>
            <span style={{ background: 'rgba(249, 115, 22, 0.12)', color: '#f97316', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
              Bancada de Manutenção
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
            Painel Geral da Assistência
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Indicadores de ordens de serviço, execução de bancada, garantias ativas e resultado financeiro consolidado.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => onNavigateSubmodule('services')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Cpu size={16} color="#60a5fa" />
            Catálogo ({services.length})
          </button>

          <button
            onClick={() => onNavigateSubmodule('warranty')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShieldCheck size={16} color="#10b981" />
            Garantias ({warranties.length})
          </button>

          <button
            onClick={onOpenNewOS}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
            }}
          >
            <Plus size={16} />
            Nova Ordem de Serviço
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS REAIS */}
      <div
        style={{
          background: '#0d121f',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          padding: '14px 20px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={16} color="#94a3b8" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>Filtros Operacionais:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Período */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Período:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              style={{
                background: '#151b2b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: '0.78rem',
              }}
            >
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="month">Este Mês</option>
              <option value="all">Todo Histórico</option>
            </select>
          </div>

          {/* Técnico */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Técnico:</span>
            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              style={{
                background: '#151b2b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: '0.78rem',
              }}
            >
              <option value="all">Todos os Técnicos</option>
              {uniqueTechnicians.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Equipamento */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Equipamento:</span>
            <select
              value={deviceTypeFilter}
              onChange={(e) => setDeviceTypeFilter(e.target.value)}
              style={{
                background: '#151b2b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: '0.78rem',
              }}
            >
              <option value="all">Todos os Tipos</option>
              {uniqueDeviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CARDS PRINCIPAIS DE FLUXO OPERACIONAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        
        {/* Total Abertas */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Em Andamento</span>
            <Clock size={16} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#f8fafc', marginTop: 8 }}>
            {metrics.openOrders}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 4 }}>
            Ordens ativas na assistência
          </div>
        </div>

        {/* Aguardando Diagnóstico */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Diagnóstico</span>
            <Wrench size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#f59e0b', marginTop: 8 }}>
            {metrics.awaitingDiagnosis + metrics.inDiagnosis}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 4 }}>
            {metrics.awaitingDiagnosis} na fila • {metrics.inDiagnosis} em bancada
          </div>
        </div>

        {/* Orçamentos Aguardando Aprovação */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Aguardando Cliente</span>
            <DollarSign size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#a855f7', marginTop: 8 }}>
            {metrics.awaitingApproval}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 4 }}>
            Orçamentos enviados para aprovação
          </div>
        </div>

        {/* Reparos em Execução */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Em Execução</span>
            <Cpu size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#06b6d4', marginTop: 8 }}>
            {metrics.inRepair}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 4 }}>
            {metrics.approvedWaitingExec} aprovadas na fila • {metrics.waitingParts} aguardando peça
          </div>
        </div>

        {/* Prontas para Retirada */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Prontas</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#10b981', marginTop: 8 }}>
            {metrics.readyForPickup}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 4 }}>
            Testadas e aguardando retirada
          </div>
        </div>

        {/* Ordens Atrasadas */}
        <div style={{ background: '#0d121f', border: `1px solid ${metrics.delayed > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`, borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Atrasadas</span>
            <AlertTriangle size={16} color={metrics.delayed > 0 ? '#ef4444' : '#64748b'} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: metrics.delayed > 0 ? '#ef4444' : '#94a3b8', marginTop: 8 }}>
            {metrics.delayed}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 4 }}>
            {metrics.delayed > 0 ? 'Prazo prometido expirado!' : 'Nenhuma ordem em atraso'}
          </div>
        </div>
      </div>

      {/* PAINEL FINANCEIRO & RENTABILIDADE REAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        
        {/* Rentabilidade de Serviços */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Resultado Financeiro de Serviços
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Cálculo real: Receita bruta - Custo de peças de bancada</span>
            </div>
            <TrendingUp size={20} color="#10b981" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Receita Bruta</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
                R$ {metrics.totalServiceRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Custo Peças</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>
                R$ {metrics.totalPartsCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Resultado Est.</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981', marginTop: 2 }}>
                R$ {metrics.estimatedNetProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 12 }}>
            <span style={{ color: '#94a3b8' }}>Valores Efetivamente Recebidos:</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>R$ {metrics.totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#94a3b8' }}>Valores Pendentes / A Receber:</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>R$ {metrics.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Garantias & Controle de Qualidade */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Garantias e Retornos de Bancada
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Resguardo CDC 90 dias e política de fidelização</span>
            </div>
            <ShieldCheck size={20} color="#3b82f6" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Garantias Ativas</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: 4 }}>
                {metrics.activeWarranties}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>Cobertura vigente</div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>Vencimento Próximo</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b', marginTop: 4 }}>
                {metrics.expiringWarranties}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>Vencem em até 15 dias</div>
            </div>
          </div>

          <button
            onClick={() => onNavigateSubmodule('warranty')}
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              padding: '10px',
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
            <span>Consultar Todas as Garantias</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* VOLUME DE REPAROS POR TÉCNICO & ÚLTIMAS ORDENS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        
        {/* Distribuição por Técnico */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 14px' }}>
            Reparos por Técnico Responsável
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(metrics.technicianVolume).map(([tech, count]) => {
              const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
              return (
                <div key={tech} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={13} color="#f97316" />
                      {tech}
                    </span>
                    <span style={{ color: '#94a3b8' }}>{count} OS ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#f97316', borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Atalho para Ordens Recentes */}
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Ordens de Serviço Recentes
            </h3>
            <button
              onClick={() => onNavigateSubmodule('service_order')}
              style={{
                background: 'none',
                border: 'none',
                color: '#f97316',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Ver todas ({serviceOrders.length})
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {serviceOrders.slice(0, 4).map(os => (
              <div
                key={os.id}
                onClick={() => onNavigateSubmodule('service_order')}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f97316' }}>{os.osNumber}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>{os.customerName}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                    {os.deviceModel} • {os.reportedIssue.substring(0, 45)}...
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                    R$ {(os.finalValue || os.estimatedValue).toFixed(2)}
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: os.status === 'pronta' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: os.status === 'pronta' ? '#10b981' : '#f59e0b',
                    }}
                  >
                    {os.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
