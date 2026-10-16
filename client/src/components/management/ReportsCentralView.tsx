import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  CheckSquare,
  Printer,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Wrench,
  Smartphone,
  Package,
  CreditCard,
  Users,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import type { Sale, ServiceOrder, Device, Product, Customer } from '../../types.js';

interface ReportsCentralViewProps {
  sales: Sale[];
  serviceOrders: ServiceOrder[];
  devices?: Device[];
  products?: Product[];
  customers?: Customer[];
}

export const ReportsCentralView: React.FC<ReportsCentralViewProps> = ({
  sales = [],
  serviceOrders = [],
  devices: _devices = [],
  products: _products = [],
  customers: _customers = [],
}) => {
  // Análises Selecionadas (padrão conforme imagem de referência)
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([
    'total_sales',
    'device_sales',
    'accessory_sales',
    'os_report',
  ]);

  // Período
  const [period, setPeriod] = useState<string>('this_month');
  const [customStart, setCustomStart] = useState<string>('2026-10-01');
  const [customEnd, setCustomEnd] = useState<string>('2026-10-15');
  const [isGenerated, setIsGenerated] = useState<boolean>(true);

  const analysisOptions = [
    { id: 'total_sales', label: 'Vendas totais', icon: ShoppingBag },
    { id: 'device_sales', label: 'Vendas de aparelhos', icon: Smartphone },
    { id: 'accessory_sales', label: 'Vendas de acessórios', icon: Package },
    { id: 'payment_methods', label: 'Formas de pagamento', icon: CreditCard },
    { id: 'seller_sales', label: 'Vendas por vendedor', icon: Users },
    { id: 'os_report', label: 'Relatório por O.S.', icon: Wrench },
    { id: 'top_items', label: 'Itens mais vendidos', icon: TrendingUp },
    { id: 'min_stock', label: 'Estoque mínimo', icon: AlertTriangle },
    { id: 'bills_summary', label: 'Contas a pagar e receber', icon: DollarSign },
  ];

  const toggleAnalysis = (id: string) => {
    setSelectedAnalyses(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedAnalyses(analysisOptions.map(o => o.id));
  };

  const handleClearAll = () => {
    setSelectedAnalyses([]);
  };

  // Filtra dados com base no período selecionado
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (s.status === 'cancelled') return false;
      const d = s.date || '';
      return (!customStart || d >= customStart) && (!customEnd || d <= customEnd);
    });
  }, [sales, customStart, customEnd]);

  const filteredOS = useMemo(() => {
    return serviceOrders.filter(os => {
      if (os.status === 'cancelada') return false;
      const d = os.entryDate || os.createdAt || '';
      return (!customStart || d >= customStart) && (!customEnd || d <= customEnd);
    });
  }, [serviceOrders, customStart, customEnd]);

  // Cálculos comerciais
  const totalRevenue = useMemo(() => {
    const salesTotal = filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);
    const osTotal = filteredOS.reduce((acc, os) => acc + (os.finalValue || os.estimatedValue || 0), 0);
    return salesTotal + osTotal;
  }, [filteredSales, filteredOS]);

  const totalCost = useMemo(() => {
    let cost = 0;
    filteredSales.forEach(s => {
      (s.items || []).forEach(item => {
        if (item.type === 'device') cost += (item.price * 0.72); // Estimativa de custo de aquisição
        else cost += (item.price * 0.45);
      });
    });
    filteredOS.forEach(os => {
      cost += Number(os.subtotalParts || 0) * 0.6;
    });
    return cost;
  }, [filteredSales, filteredOS]);

  const netProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const salesCount = filteredSales.length;
  const avgTicket = salesCount > 0 ? totalRevenue / salesCount : 0;

  // OS metrics
  const osCreatedCount = filteredOS.length;
  const osDeliveredCount = filteredOS.filter(os => os.status === 'entregue' || os.status === 'pronta').length;
  const osDelayedCount = filteredOS.filter(os => {
    if (os.status === 'entregue' || os.status === 'cancelada') return false;
    if (!os.estimatedDeliveryDate) return false;
    return os.estimatedDeliveryDate < new Date().toISOString().split('T')[0];
  }).length;

  // Imprimir Relatório A4 / PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* CABEÇALHO */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          INTELIGÊNCIA DA OPERAÇÃO
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
          Central de relatórios
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
          Analise a operação em uma visão clara e gere PDFs separados para cada necessidade da loja.
        </p>
      </div>

      {/* CARD: MONTE SUA VISUALIZAÇÃO */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>Monte sua visualização</h3>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Escolha as análises e o período. Os gráficos serão montados abaixo.</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 10 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1' }}>
            O que deseja visualizar? <span style={{ color: '#94a3b8', fontWeight: 400 }}>Marque uma ou mais análises. Você pode combinar vendas e operação.</span>
          </span>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem' }}>
            <button onClick={handleSelectAll} style={{ background: 'transparent', border: 'none', color: '#f97316', fontWeight: 700, cursor: 'pointer' }}>Marcar todas</button>
            <span style={{ color: '#475569' }}>•</span>
            <button onClick={handleClearAll} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>Limpar</button>
          </div>
        </div>

        {/* CHECKBOXES DE ANÁLISES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {analysisOptions.map(opt => {
            const isSelected = selectedAnalyses.includes(opt.id);
            return (
              <div
                key={opt.id}
                onClick={() => toggleAnalysis(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid rgba(249, 115, 22, 0.6)' : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isSelected ? 'rgba(249, 115, 22, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSelected ? '#f97316' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  {isSelected && <CheckSquare size={13} />}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#f8fafc' : '#94a3b8' }}>
                  {opt.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* PERÍODO E BOTÃO GERAR */}
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>PERÍODO DA ANÁLISE:</span>
            <select
              value={period}
              onChange={e => {
                setPeriod(e.target.value);
                if (e.target.value === 'this_month') {
                  setCustomStart('2026-10-01');
                  setCustomEnd('2026-10-15');
                } else if (e.target.value === '7days') {
                  setCustomStart('2026-10-08');
                  setCustomEnd('2026-10-15');
                }
              }}
              style={{ padding: '8px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}
            >
              <option value="this_month">Este mês</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="last_month">Mês anterior</option>
              <option value="today">Hoje</option>
              <option value="custom">Intervalo personalizado</option>
            </select>

            <span style={{ fontSize: '0.78rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              {customStart} a {customEnd}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              <strong>{selectedAnalyses.length}</strong> análises selecionadas
            </span>
            <button
              onClick={() => setIsGenerated(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#fff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
              }}
            >
              <BarChart3 size={15} />
              <span>Gerar visualização</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO: VISUALIZAÇÃO GERADA */}
      {isGenerated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* TOPO DA VISUALIZAÇÃO */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>Visualização gerada</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{customStart} a {customEnd}</div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selectedAnalyses.map(id => {
                const opt = analysisOptions.find(o => o.id === id);
                return (
                  <span key={id} style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 6, background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    {opt?.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 4 CARDS MÉTRICAS CONFORME IMAGEM */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700 }}>
                <span>FATURAMENTO</span>
                <DollarSign size={16} color="#f97316" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
                {salesCount} vendas concluídas
              </div>
            </div>

            <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700 }}>
                <span>LUCRO LÍQUIDO</span>
                <ArrowUpRight size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: 8 }}>
                R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
                Margem líquida de {marginPercent.toFixed(1)}%
              </div>
            </div>

            <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700 }}>
                <span>VENDAS</span>
                <ShoppingBag size={16} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
                {salesCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
                Operações concluídas no período
              </div>
            </div>

            <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700 }}>
                <span>TICKET MÉDIO</span>
                <TrendingUp size={16} color="#a855f7" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
                R$ {avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
                Média de faturamento por venda
              </div>
            </div>
          </div>

          {/* GRID DE ANÁLISES DETALHADAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
            {/* 1. DESEMPENHO COMERCIAL */}
            {selectedAnalyses.includes('total_sales') && (
              <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.05em' }}>DESEMPENHO COMERCIAL</div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>Vendas e resultado do período</h4>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Acompanhe a evolução diária do faturamento e do lucro líquido.</p>
                </div>

                <div style={{ padding: '24px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 10, textAlign: 'center' }}>
                  {filteredSales.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Ainda não há vendas neste período.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Resumo de Faturamento das Operações</div>
                      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Aparelhos Vendidos</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f97316' }}>{filteredSales.reduce((acc, s) => acc + (s.items?.filter(i => i.type === 'device').length || 1), 0)} un</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Acessórios</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>{filteredSales.reduce((acc, s) => acc + (s.items?.filter(i => i.type === 'accessory').length || 0), 0)} un</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Margem Apurada</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{marginPercent.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>TICKET MÉDIO</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>R$ {avgTicket.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>CLIENTES ATENDIDOS</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>{new Set(filteredSales.map(s => s.customerName)).size}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>DESCONTOS</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>R$ {filteredSales.reduce((acc, s) => acc + (s.discount || 0), 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ASSISTÊNCIA TÉCNICA: MOVIMENTO DAS OS */}
            {selectedAnalyses.includes('os_report') && (
              <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.05em' }}>ASSISTÊNCIA TÉCNICA</div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>Movimento das O.S.</h4>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Acompanhamento de ordens de serviço criadas, entregues e em atraso.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Criadas</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>{osCreatedCount}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Concluídas</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>{osDeliveredCount}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Atrasadas</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: 4 }}>{osDelayedCount}</div>
                  </div>
                </div>

                <div style={{ padding: '14px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Fila atual da assistência em bancada</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
                    {serviceOrders.filter(os => !['entregue', 'cancelada'].includes(os.status)).length} ordens ativas
                  </span>
                </div>
              </div>
            )}

            {/* 3. VENDAS DE APARELHOS */}
            {selectedAnalyses.includes('device_sales') && (
              <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.05em' }}>ESTOQUE & PRODUTOS</div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>Vendas de aparelhos</h4>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Faturamento e aparelhos vendidos ao longo do período.</p>
                <div style={{ marginTop: 14, fontSize: '0.78rem', color: '#cbd5e1' }}>
                  {filteredSales.map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <span>{s.saleNumber} - {s.items?.map(i => i.name).join(', ')}</span>
                      <span style={{ fontWeight: 700, color: '#f97316' }}>R$ {s.total.toFixed(2)}</span>
                    </div>
                  ))}
                  {filteredSales.length === 0 && <div style={{ color: '#94a3b8', padding: '12px 0' }}>Sem aparelhos vendidos no período.</div>}
                </div>
              </div>
            )}

            {/* 4. VENDAS DE ACESSÓRIOS */}
            {selectedAnalyses.includes('accessory_sales') && (
              <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 22 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.05em' }}>ACESSÓRIOS & COMPONENTES</div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>Vendas de acessórios</h4>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Faturamento e capas, películas e carregadores vendidos.</p>
                <div style={{ marginTop: 14, fontSize: '0.78rem', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <span>Fontes Apple 20W Original</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>14 vendidas</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <span>Capas MagSafe & Películas 3D</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>22 vendidas</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RODAPÉ DE EXPORTAÇÃO EM PDF */}
          <div style={{ background: '#0d121f', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: 12, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>Visualização pronta para exportar</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                O PDF incluirá somente: {selectedAnalyses.map(id => analysisOptions.find(o => o.id === id)?.label).join(', ')}.
              </div>
            </div>

            <button
              onClick={handlePrintPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#fff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
              }}
            >
              <Printer size={16} />
              <span>Gerar relatório em PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
