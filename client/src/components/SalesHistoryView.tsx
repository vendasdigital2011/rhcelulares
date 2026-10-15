import React, { useState } from 'react';
import { 
  Search, FileText, Eye, XCircle, Printer, 
  ChevronLeft, ChevronRight, AlertTriangle, X
} from 'lucide-react';
import type { Sale } from '../types.js';

interface SalesHistoryViewProps {
  sales: Sale[];
  onOpenWarranty: (saleId: string) => void;
  onCancelSale?: (sale: Sale, reason: string) => Promise<void>;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({ 
  sales, 
  onOpenWarranty,
  onCancelSale 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [selectedSaleDetails, setSelectedSaleDetails] = useState<Sale | null>(null);
  
  // Modal de Cancelamento
  const [cancellingSale, setCancellingSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('Desistência do cliente no balcão');
  const [isCancelling, setIsCancelling] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtragem
  const filteredSales = sales.filter(s => {
    // 1. Busca textual
    const matchesSearch = 
      s.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerPhone?.includes(searchTerm) ||
      s.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.imei?.includes(searchTerm));

    if (!matchesSearch) return false;

    // 2. Filtro de Status
    const saleStatus = s.status || 'completed';
    if (statusFilter !== 'all' && saleStatus !== statusFilter) return false;

    // 3. Filtro de Período
    if (periodFilter === 'today') {
      const todayStr = new Date().toLocaleDateString('pt-BR');
      return s.date === todayStr;
    }

    return true;
  });

  // Volume faturado considera apenas vendas concluídas
  const completedSales = filteredSales.filter(s => (s.status || 'completed') !== 'cancelled');
  const totalVolume = completedSales.reduce((acc, s) => acc + s.total, 0);

  // Paginação dos registros
  const totalPages = Math.ceil(filteredSales.length / pageSize) || 1;
  const paginatedSales = filteredSales.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleConfirmCancel = async () => {
    if (!cancellingSale || !onCancelSale) return;
    setIsCancelling(true);
    try {
      await onCancelSale(cancellingSale, cancelReason);
      setCancellingSale(null);
    } catch (err: any) {
      alert('Erro ao cancelar venda: ' + err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Vendas & Histórico
            </span>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
              {sales.length} Vendas Registradas
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', marginTop: 4 }}>
            Histórico Geral de Vendas
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
            Consulte operações de balcão, estornos, emissão de termos de garantia e reimpressão de comprovantes.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '12px 20px', borderRadius: 12, textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Volume Líquido Concluído</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>
            R$ {totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            {completedSales.length} faturadas • {filteredSales.length - completedSales.length} canceladas
          </div>
        </div>
      </div>

      {/* BARRA DE PESQUISA E FILTROS */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 12 }} />
          <input
            type="text"
            placeholder="Buscar por nº da venda, cliente, vendedor, telefone ou IMEI..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              borderRadius: 10,
              padding: '10px 14px 10px 42px',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Filtro Período */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: 3 }}>
          {(['all', 'today', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => { setPeriodFilter(p); setCurrentPage(1); }}
              style={{
                background: periodFilter === p ? '#f97316' : 'transparent',
                color: periodFilter === p ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {p === 'all' ? 'Todos' : p === 'today' ? 'Hoje' : p === 'week' ? '7 Dias' : 'Este Mês'}
            </button>
          ))}
        </div>

        {/* Filtro Status */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: 3 }}>
          {(['all', 'completed', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              style={{
                background: statusFilter === s ? (s === 'cancelled' ? '#ef4444' : '#10b981') : 'transparent',
                color: statusFilter === s ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {s === 'all' ? 'Todas' : s === 'completed' ? 'Concluídas' : 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA DE VENDAS */}
      <div className="glass-panel" style={{ borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Nº Venda</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Data</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Cliente</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Itens Vendidos</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Trade-In</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Total Final</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Pagamento</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSales.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
                  Nenhuma venda encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              paginatedSales.map((sale) => {
                const isCancelled = (sale.status || 'completed') === 'cancelled';
                return (
                  <tr
                    key={sale.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      opacity: isCancelled ? 0.6 : 1,
                      background: isCancelled ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: isCancelled ? '#ef4444' : '#f97316' }}>
                      {sale.saleNumber}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isCancelled ? '#ef4444' : '#10b981',
                        border: `1px solid ${isCancelled ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                      }}>
                        {isCancelled ? 'Cancelada' : 'Concluída'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                      {sale.date}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{sale.customerName}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{sale.customerPhone || 'S/ telefone'}</div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {sale.items.map((item, idx) => (
                        <div key={idx} style={{ color: '#cbd5e1', fontSize: '0.76rem' }}>
                          • {item.quantity}x {item.name}
                        </div>
                      ))}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {sale.tradeIn ? (
                        <div>
                          <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.76rem' }}>
                            {sale.tradeIn.model}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            Entrada: R$ {sale.tradeIn.evaluatedValue.toLocaleString('pt-BR')}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Sem troca</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', fontWeight: 800, color: isCancelled ? '#64748b' : '#10b981', fontSize: '0.92rem', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                      R$ {sale.total.toLocaleString('pt-BR')}
                    </td>

                    <td style={{ padding: '12px 16px', color: '#cbd5e1', fontSize: '0.76rem' }}>
                      {sale.paymentMethod}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => setSelectedSaleDetails(sale)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#cbd5e1',
                            borderRadius: 6,
                            padding: '5px 8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                          title="Ver Detalhes da Venda"
                        >
                          <Eye size={12} />
                          Ver
                        </button>

                        <button
                          onClick={() => onOpenWarranty(sale.id)}
                          style={{
                            background: 'rgba(249, 115, 22, 0.12)',
                            border: '1px solid rgba(249, 115, 22, 0.3)',
                            color: '#f97316',
                            borderRadius: 6,
                            padding: '5px 8px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          title="Emitir Termo de Garantia"
                        >
                          <FileText size={12} />
                          Garantia
                        </button>

                        {!isCancelled && onCancelSale && (
                          <button
                            onClick={() => setCancellingSale(sale)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              borderRadius: 6,
                              padding: '5px 8px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Cancelar / Estornar Venda"
                          >
                            <XCircle size={12} />
                            Estornar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* PAGINAÇÃO */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.78rem',
            color: '#94a3b8',
          }}>
            <span>Página {currentPage} de {totalPages}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: currentPage === 1 ? '#475569' : '#fff',
                  borderRadius: 6,
                  padding: '4px 8px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: currentPage === totalPages ? '#475569' : '#fff',
                  borderRadius: 6,
                  padding: '4px 8px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: DETALHES COMPLETOS DA VENDA */}
      {selectedSaleDetails && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20,
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 16,
            maxWidth: 520,
            width: '100%',
            padding: 24,
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316' }}>DETALHES DA OPERAÇÃO</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', marginTop: 2 }}>
                  {selectedSaleDetails.saleNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSaleDetails(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Informações Gerais */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 10,
              padding: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              fontSize: '0.78rem',
            }}>
              <div>
                <span style={{ color: '#64748b' }}>Cliente:</span>
                <div style={{ fontWeight: 700, color: '#f8fafc' }}>{selectedSaleDetails.customerName}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{selectedSaleDetails.customerPhone || 'Não informado'}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Vendedor / Data:</span>
                <div style={{ fontWeight: 700, color: '#f8fafc' }}>{selectedSaleDetails.sellerName}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{selectedSaleDetails.date}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Status:</span>
                <div>
                  <span style={{
                    color: selectedSaleDetails.status === 'cancelled' ? '#ef4444' : '#10b981',
                    fontWeight: 700,
                  }}>
                    {selectedSaleDetails.status === 'cancelled' ? 'Cancelada / Estornada' : 'Faturada com Sucesso'}
                  </span>
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Pagamento:</span>
                <div style={{ fontWeight: 700, color: '#cbd5e1' }}>{selectedSaleDetails.paymentMethod}</div>
              </div>
            </div>

            {/* Itens */}
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#cbd5e1', marginBottom: 6 }}>
                PRODUTOS / APARELHOS VENDIDOS:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedSaleDetails.items.map((it, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{it.name}</div>
                      {it.imei && <div style={{ fontSize: '0.68rem', color: '#f97316' }}>IMEI: {it.imei}</div>}
                    </div>
                    <div style={{ fontWeight: 800, color: '#10b981' }}>
                      R$ {(it.price * it.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Se teve Trade-in */}
            {selectedSaleDetails.tradeIn && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: '0.76rem',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Aparelho de Entrada (Trade-In):</span>
                  <div style={{ color: '#f8fafc' }}>{selectedSaleDetails.tradeIn.model}</div>
                </div>
                <div style={{ fontWeight: 800, color: '#10b981' }}>
                  - R$ {Number(selectedSaleDetails.tradeIn.evaluatedValue).toFixed(2)}
                </div>
              </div>
            )}

            {/* Total e Ações */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Valor Total da Operação:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>
                R$ {selectedSaleDetails.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '9px',
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
                <Printer size={14} />
                Reimprimir Cupom
              </button>
              <button
                onClick={() => setSelectedSaleDetails(null)}
                style={{
                  flex: 1,
                  background: '#f97316',
                  color: '#fff',
                  border: 'none',
                  padding: '9px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMAÇÃO DE CANCELAMENTO / ESTORNO */}
      {cancellingSale && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20,
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 16,
            maxWidth: 460,
            width: '100%',
            padding: 24,
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ef4444',
              }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc' }}>
                  Cancelar Venda {cancellingSale.saleNumber}?
                </h3>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Esta operação é irreversível e acionará os efeitos de estorno.
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 8,
              padding: 12,
              fontSize: '0.75rem',
              color: '#fca5a5',
              lineHeight: '1.4',
            }}>
              <b>Efeitos do cancelamento:</b>
              <br />• Os aparelhos vendidos retornarão imediatamente ao estoque disponível.
              <br />• Será lançado um estorno de saída no caixa de <b>R$ {cancellingSale.total.toFixed(2)}</b>.
              <br />• O valor será abatido do histórico de compras do cliente.
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Motivo do cancelamento / estorno:</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  marginTop: 4,
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: isCancelling ? 'not-allowed' : 'pointer',
                }}
              >
                {isCancelling ? 'Estornando...' : 'Confirmar Cancelamento'}
              </button>
              <button
                onClick={() => setCancellingSale(null)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
