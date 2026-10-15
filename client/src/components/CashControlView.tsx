import { useState } from 'react';
import { 
  Lock, Unlock, Calendar, ArrowUpRight, ArrowDownLeft, 
  Plus, Minus, CheckCircle2, X
} from 'lucide-react';
import type { CashRegister, Sale, CashTransaction, TransactionCategory } from '../types.js';

interface CashControlViewProps {
  cashRegister: CashRegister;
  sales: Sale[];
  onToggleCash: () => void;
  onOpenCash?: (initialFloat: number, operatorName: string) => Promise<void>;
  onCloseCash?: (cashCounted: number, notes?: string) => Promise<any>;
  onAddTransaction?: (
    type: 'inflow' | 'outflow',
    category: TransactionCategory,
    amount: number,
    description: string,
    paymentMethod?: string
  ) => Promise<void>;
}

export const CashControlView = ({
  cashRegister,
  sales,
  onToggleCash,
  onOpenCash,
  onCloseCash,
  onAddTransaction,
}: CashControlViewProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [activeTxTab, setActiveTxTab] = useState<'all' | 'inflow' | 'outflow'>('all');

  // Modais
  const [isOpenCashModal, setIsOpenCashModal] = useState(false);
  const [isCloseCashModal, setIsCloseCashModal] = useState(false);
  const [isMovementModal, setIsMovementModal] = useState<'sangria' | 'suprimento' | null>(null);

  // Formulário Abertura
  const [openFloat, setOpenFloat] = useState<number>(300);
  const [openOperator, setOpenOperator] = useState<string>('Hiago (Responsável)');

  // Formulário Fechamento
  const [cashCounted, setCashCounted] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState<string>('');
  const [closingResult, setClosingResult] = useState<any | null>(null);

  // Formulário Sangria / Suprimento
  const [movementAmount, setMovementAmount] = useState<number>(0);
  const [movementReason, setMovementReason] = useState<string>('');
  const [isSubmittingMovement, setIsSubmittingMovement] = useState(false);

  // Cálculos dinâmicos pelas vendas ativas (não canceladas)
  const activeSales = sales.filter(s => (s.status || 'completed') !== 'cancelled');
  const totalSalesAmount = activeSales.reduce((acc, curr) => acc + curr.total, 0);
  const totalTradeInAmount = activeSales.reduce((acc, curr) => acc + (curr.tradeIn?.evaluatedValue || 0), 0);
  
  const creditCardAmount = activeSales
    .filter(s => s.paymentMethod.includes('Cartão de Crédito'))
    .reduce((acc, curr) => acc + curr.total, 0);

  const pixAmount = activeSales
    .filter(s => s.paymentMethod === 'Pix')
    .reduce((acc, curr) => acc + curr.total, 0);

  const cashAmount = activeSales
    .filter(s => s.paymentMethod.includes('Dinheiro'))
    .reduce((acc, curr) => acc + curr.total, 0);

  const debitAmount = activeSales
    .filter(s => s.paymentMethod.includes('Débito'))
    .reduce((acc, curr) => acc + curr.total, 0);

  // Transações da gaveta
  const transactions: CashTransaction[] = cashRegister.transactions || [];
  
  // Total de saídas/sangrias da gaveta em dinheiro
  const totalSangrias = transactions
    .filter(t => t.type === 'outflow' && t.category === 'sangria')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Total de suprimentos/reforços
  const totalSuprimentos = transactions
    .filter(t => t.type === 'inflow' && t.category === 'reforco')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Saldo Físico Esperado na Gaveta = Fundo Inicial + Entradas Dinheiro + Suprimentos - Sangrias
  const expectedCashInDrawer = cashRegister.initialFloat + cashAmount + totalSuprimentos - totalSangrias;

  // Filtra transações do extrato
  const filteredTransactions = transactions.filter(t => {
    if (activeTxTab === 'inflow') return t.type === 'inflow';
    if (activeTxTab === 'outflow') return t.type === 'outflow';
    return true;
  });

  const handleConfirmOpen = async () => {
    if (onOpenCash) {
      await onOpenCash(openFloat, openOperator);
    } else {
      onToggleCash();
    }
    setIsOpenCashModal(false);
  };

  const handleConfirmClose = async () => {
    if (onCloseCash) {
      const res = await onCloseCash(cashCounted, closeNotes);
      setClosingResult(res);
    } else {
      onToggleCash();
      setIsCloseCashModal(false);
    }
  };

  const handleConfirmMovement = async () => {
    if (!movementAmount || movementAmount <= 0) {
      alert('Informe um valor válido.');
      return;
    }
    if (!movementReason.trim()) {
      alert('Informe a justificativa da movimentação.');
      return;
    }

    setIsSubmittingMovement(true);
    try {
      if (onAddTransaction) {
        await onAddTransaction(
          isMovementModal === 'suprimento' ? 'inflow' : 'outflow',
          isMovementModal === 'suprimento' ? 'reforco' : 'sangria',
          movementAmount,
          movementReason.trim(),
          'Dinheiro'
        );
      }
      setIsMovementModal(null);
      setMovementAmount(0);
      setMovementReason('');
    } catch (err: any) {
      alert('Erro ao registrar movimentação: ' + err.message);
    } finally {
      setIsSubmittingMovement(false);
    }
  };

  return (
    <div style={{
      padding: '24px 32px 60px',
      maxWidth: 1360,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#f97316',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            FINANCEIRO & AUDITORIA
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Controle de Caixa & Fluxo Financeiro
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Acompanhe a gaveta física em tempo real, registre sangrias/suprimentos e realize a conferência cega de fechamento.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {cashRegister.isOpen && (
            <>
              <button
                onClick={() => setIsMovementModal('sangria')}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '9px 14px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Minus size={14} />
                Sangria (Retirada)
              </button>

              <button
                onClick={() => setIsMovementModal('suprimento')}
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  padding: '9px 14px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={14} />
                Suprimento (Reforço)
              </button>
            </>
          )}

          <button
            onClick={() => {
              if (cashRegister.isOpen) {
                setIsCloseCashModal(true);
              } else {
                setIsOpenCashModal(true);
              }
            }}
            style={{
              background: cashRegister.isOpen ? '#ef4444' : '#10b981',
              color: '#fff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: cashRegister.isOpen ? '0 2px 10px rgba(239, 68, 68, 0.3)' : '0 2px 10px rgba(16, 185, 129, 0.3)',
            }}
          >
            {cashRegister.isOpen ? <Lock size={15} /> : <Unlock size={15} />}
            {cashRegister.isOpen ? 'Fechar Caixa (Conferência)' : 'Abrir Turno de Caixa'}
          </button>
        </div>
      </div>

      {/* CARD 1: STATUS DO CAIXA E AUDITORIA DA GAVETA */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        borderRadius: 16,
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        gap: 16,
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: cashRegister.isOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cashRegister.isOpen ? '#10b981' : '#f59e0b',
          }}>
            {cashRegister.isOpen ? <Unlock size={22} /> : <Lock size={22} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>
                Caixa da Matriz
              </span>
              <span style={{
                background: cashRegister.isOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: cashRegister.isOpen ? '#10b981' : '#f59e0b',
                padding: '2px 8px',
                borderRadius: 20,
                fontSize: '0.72rem',
                fontWeight: 700,
              }}>
                {cashRegister.isOpen ? '● Turno Ativo' : '● Turno Encerrado'}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
              Operador: <b>{cashRegister.operatorName || 'Hiago'}</b> • {cashRegister.isOpen ? `Aberto às ${cashRegister.openedAt || '08:30'}` : 'Fechado'}
            </div>
          </div>
        </div>

        {/* Fundo de Troco Inicial */}
        <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: 16 }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Fundo de Troco Inicial</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', marginTop: 2 }}>
            R$ {cashRegister.initialFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Saldo de abertura</div>
        </div>

        {/* Saldo Físico Esperado na Gaveta */}
        <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: 16 }}>
          <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Dinheiro Esperado na Gaveta</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', marginTop: 2 }}>
            R$ {expectedCashInDrawer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Fundo + Dinheiro - Sangrias</div>
        </div>

        {/* Total Vendas do Turno */}
        <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: 16 }}>
          <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>Total Geral Faturado</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', marginTop: 2 }}>
            R$ {totalSalesAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Todas as formas de pagamento</div>
        </div>
      </div>

      {/* CARD 2: TOTAL DO CAIXA DO DIA COM DISCRIMINAÇÃO */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              Discriminação de Recebimentos por Meio de Pagamento
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
              Separação obrigatória para auditoria fiscal: não misturar dinheiro físico com recebíveis a prazo e digitais.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} color="#94a3b8" />
            <input
              type="text"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 6,
                padding: '6px 10px',
                color: '#fff',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Bloco Destaque */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.04)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 14,
          padding: 20,
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
            Total de vendas ativas do dia
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', marginTop: 4 }}>
            R$ {totalSalesAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
            {activeSales.length} vendas faturadas • Excluídas vendas estornadas
          </div>

          {/* Grid de Formas de Pagamento */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Dinheiro Físico (Gaveta)</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                R$ {cashAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pix à vista</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                R$ {pixAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Cartão de crédito parcelado</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                R$ {creditCardAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Cartão de débito</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                R$ {debitAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>Trade-In (Aparelhos Usados)</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>
                R$ {totalTradeInAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700 }}>Total Sangrias (Retiradas)</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ef4444', marginTop: 2 }}>
                - R$ {totalSangrias.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 700 }}>Total Suprimentos (Reforços)</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#a855f7', marginTop: 2 }}>
                + R$ {totalSuprimentos.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Financiamentos</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                R$ 0,00
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: EXTRATO COMPLETO DO FLUXO DE CAIXA (TRANSAÇÕES REAIS) */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              Extrato de Movimentações da Sessão
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
              Histórico rastreável de todas as entradas, sangrias, reforços e vendas vinculadas ao turno.
            </p>
          </div>

          {/* Abas de filtro do extrato */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8, padding: 3 }}>
            {(['all', 'inflow', 'outflow'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTxTab(tab)}
                style={{
                  background: activeTxTab === tab ? '#f97316' : 'transparent',
                  color: activeTxTab === tab ? '#fff' : '#94a3b8',
                  border: 'none',
                  borderRadius: 6,
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {tab === 'all' ? 'Todas' : tab === 'inflow' ? 'Entradas' : 'Saídas'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela do Extrato */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Data / Hora</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Tipo</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Categoria</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Descrição</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Meio de Pagto</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '28px 0', color: '#64748b' }}>
                    Nenhuma movimentação registrada nesta sessão ainda.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isInflow = tx.type === 'inflow';
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '0.75rem' }}>
                        {tx.createdAt}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: isInflow ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: isInflow ? '#10b981' : '#ef4444',
                          border: `1px solid ${isInflow ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                        }}>
                          {isInflow ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                          {isInflow ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textTransform: 'capitalize', color: '#cbd5e1' }}>
                        {tx.category}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#f8fafc', fontWeight: 600 }}>
                        {tx.description}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>
                        {tx.paymentMethod || 'Dinheiro'}
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        textAlign: 'right',
                        fontWeight: 800,
                        color: isInflow ? '#10b981' : '#ef4444',
                      }}>
                        {isInflow ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ABERTURA DE CAIXA */}
      {isOpenCashModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20,
        }}>
          <div style={{
            background: '#0d1322', border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 16, maxWidth: 420, width: '100%', padding: 24,
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Unlock size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc' }}>
                  Abertura de Caixa
                </h3>
              </div>
              <button onClick={() => setIsOpenCashModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Operador Responsável:</label>
              <input
                type="text"
                value={openOperator}
                onChange={(e) => setOpenOperator(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8,
                  padding: '9px 12px', color: '#fff', fontSize: '0.85rem', marginTop: 4, outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Fundo de Troco Inicial (R$):</label>
              <input
                type="number"
                value={openFloat}
                onChange={(e) => setOpenFloat(Number(e.target.value))}
                style={{
                  width: '100%', background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8,
                  padding: '9px 12px', color: '#10b981', fontWeight: 800, fontSize: '1.1rem', marginTop: 4, outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                Valor em cédulas e moedas disponível na gaveta no início do dia.
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button
                onClick={handleConfirmOpen}
                style={{
                  flex: 1, background: '#10b981', color: '#fff', border: 'none',
                  padding: '10px', borderRadius: 8, fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer',
                }}
              >
                Confirmar e Abrir Caixa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FECHAMENTO DE CAIXA COM CONFERÊNCIA CEGA */}
      {isCloseCashModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20,
        }}>
          <div style={{
            background: '#0d1322', border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 16, maxWidth: 460, width: '100%', padding: 24,
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            {!closingResult ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={20} color="#ef4444" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc' }}>
                      Fechamento Cego de Caixa
                    </h3>
                  </div>
                  <button onClick={() => setIsCloseCashModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                }}>
                  Controle da gaveta física: Conte todo o dinheiro em espécie presente na gaveta e digite abaixo. O sistema apurará se houve quebra ou sobra de caixa.
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>
                    Valor Total em Dinheiro Contado na Gaveta (R$):
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={cashCounted || ''}
                    onChange={(e) => setCashCounted(Number(e.target.value))}
                    style={{
                      width: '100%', background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8,
                      padding: '10px 12px', color: '#f59e0b', fontWeight: 900, fontSize: '1.2rem', marginTop: 4, outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                    Observações de Fechamento (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Pagamento de lanche ou adiantamento..."
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    style={{
                      width: '100%', background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8,
                      padding: '8px 12px', color: '#fff', fontSize: '0.8rem', marginTop: 4, outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button
                    onClick={handleConfirmClose}
                    style={{
                      flex: 1, background: '#ef4444', color: '#fff', border: 'none',
                      padding: '10px', borderRadius: 8, fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer',
                    }}
                  >
                    Encerrar e Apurar Diferença
                  </button>
                  <button
                    onClick={() => setIsCloseCashModal(false)}
                    style={{
                      flex: 1, background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', border: 'none',
                      padding: '10px', borderRadius: 8, fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Voltar
                  </button>
                </div>
              </>
            ) : (
              /* Resultado da Conferência Cega */
              <>
                <div style={{ textAlign: 'center' }}>
                  <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 8px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc' }}>
                    Caixa Encerrado com Sucesso!
                  </h3>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: '0.82rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Saldo em Dinheiro Esperado:</span>
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                      R$ {closingResult.expectedCash?.toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Saldo Contado pelo Operador:</span>
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                      R$ {cashCounted.toFixed(2)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    paddingTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    fontWeight: 900, fontSize: '0.95rem',
                  }}>
                    <span>Diferença / Quebra:</span>
                    <span style={{
                      color: closingResult.difference === 0 ? '#10b981' : closingResult.difference > 0 ? '#38bdf8' : '#ef4444',
                    }}>
                      {closingResult.difference === 0 
                        ? 'R$ 0,00 (Caixa Perfeito)' 
                        : closingResult.difference > 0 
                          ? `+ R$ ${closingResult.difference.toFixed(2)} (Sobra)` 
                          : `- R$ ${Math.abs(closingResult.difference).toFixed(2)} (Falta / Quebra)`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCloseCashModal(false);
                    setClosingResult(null);
                    setCashCounted(0);
                  }}
                  style={{
                    background: '#f97316', color: '#fff', border: 'none',
                    padding: '10px', borderRadius: 8, fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer',
                  }}
                >
                  Concluir Fechamento
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: SANGRIA OU SUPRIMENTO */}
      {isMovementModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20,
        }}>
          <div style={{
            background: '#0d1322',
            border: `1px solid ${isMovementModal === 'suprimento' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            borderRadius: 16, maxWidth: 420, width: '100%', padding: 24,
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isMovementModal === 'suprimento' ? <Plus size={20} color="#10b981" /> : <Minus size={20} color="#ef4444" />}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc' }}>
                  {isMovementModal === 'suprimento' ? 'Suprimento (Entrada de Troco)' : 'Sangria (Retirada de Dinheiro)'}
                </h3>
              </div>
              <button onClick={() => setIsMovementModal(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: isMovementModal === 'suprimento' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                Valor da Movimentação (R$):
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={movementAmount || ''}
                onChange={(e) => setMovementAmount(Number(e.target.value))}
                style={{
                  width: '100%', background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8,
                  padding: '9px 12px', color: '#fff', fontSize: '1.1rem', fontWeight: 800, marginTop: 4, outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                Justificativa / Destino:
              </label>
              <input
                type="text"
                placeholder={isMovementModal === 'suprimento' ? 'Ex: Moedas para troco' : 'Ex: Depósito bancário ou despesa de correios'}
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8,
                  padding: '9px 12px', color: '#fff', fontSize: '0.82rem', marginTop: 4, outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button
                disabled={isSubmittingMovement}
                onClick={handleConfirmMovement}
                style={{
                  flex: 1,
                  background: isMovementModal === 'suprimento' ? '#10b981' : '#ef4444',
                  color: '#fff', border: 'none', padding: '10px', borderRadius: 8,
                  fontSize: '0.84rem', fontWeight: 800, cursor: isSubmittingMovement ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmittingMovement ? 'Registrando...' : 'Confirmar Lançamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
