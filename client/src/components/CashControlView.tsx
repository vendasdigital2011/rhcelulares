import { useState } from 'react';
import { Lock, Unlock, Calendar } from 'lucide-react';
import type { CashRegister, Sale } from '../types.js';

interface CashControlViewProps {
  cashRegister: CashRegister;
  sales: Sale[];
  onToggleCash: () => void;
}

export const CashControlView = ({
  cashRegister,
  sales,
  onToggleCash,
}: CashControlViewProps) => {
  const [selectedDate, setSelectedDate] = useState('12/10/2026');

  // Cálculos dinâmicos pelas vendas realizadas
  const totalSalesAmount = sales.reduce((acc, curr) => acc + curr.total, 0);
  const totalTradeInAmount = sales.reduce((acc, curr) => acc + (curr.tradeIn?.evaluatedValue || 0), 0);
  
  const creditCardAmount = sales
    .filter(s => s.paymentMethod.includes('Cartão de Crédito'))
    .reduce((acc, curr) => acc + curr.total, 0);

  const pixAmount = sales
    .filter(s => s.paymentMethod === 'Pix')
    .reduce((acc, curr) => acc + curr.total, 0);

  const cashAmount = sales
    .filter(s => s.paymentMethod === 'Dinheiro')
    .reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div style={{
      padding: '24px 32px',
      maxWidth: 1280,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* Cabeçalho */}
      <div>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#f97316',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          FINANCEIRO
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
          Controle de Caixa
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
          Acompanhe a gaveta em tempo real, registre sangrias e suprimentos, e realize o fechamento com conferência de quebra de caixa.
        </p>
      </div>

      {/* CARD 1: STATUS DO CAIXA E BOTÃO ABRIR/FECHAR */}
      <div className="glass-panel" style={{
        padding: '18px 24px',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: cashRegister.isOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cashRegister.isOpen ? '#10b981' : '#f59e0b',
          }}>
            {cashRegister.isOpen ? <Unlock size={20} /> : <Lock size={20} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>
                Controle de Caixa
              </span>
              <span style={{
                background: cashRegister.isOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: cashRegister.isOpen ? '#10b981' : '#f59e0b',
                padding: '2px 8px',
                borderRadius: 20,
                fontSize: '0.72rem',
                fontWeight: 700,
              }}>
                {cashRegister.isOpen ? '● Caixa Aberto' : '● Caixa Fechado'}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
              {cashRegister.isOpen ? `Turno aberto às ${cashRegister.openedAt || '09:00'} com fundo de R$ ${cashRegister.initialFloat}` : 'Nenhum turno registrado recentemente.'}
            </div>
          </div>
        </div>

        <button
          onClick={onToggleCash}
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
          {cashRegister.isOpen ? 'Fechar Caixa' : 'Abrir Caixa Agora'}
        </button>
      </div>

      {/* CARD 2: TOTAL DO CAIXA DO DIA COM DISCRIMINAÇÃO IDÊNTICA AO PRINT 16.26.13.jpeg */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              Total do caixa do dia
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
              Todas as vendas da loja na data selecionada, inclusive as realizadas sem turno aberto.
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

        {/* Bloco Destaque com o Total e Discriminação Detalhada */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.04)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 14,
          padding: 20,
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
            Total de vendas do dia
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', marginTop: 4 }}>
            R$ {totalSalesAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
            {sales.length} vendas concluídas • Todas as formas de pagamento
          </div>

          {/* Grid de Formas de Pagamento dos Prints */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Dinheiro</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                R$ {cashAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pix</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                R$ {pixAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Cartão de crédito</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                R$ {creditCardAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Cartão de débito</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                R$ 0,00
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Transferência</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                R$ 0,00
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Financiamento</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                R$ 0,00
              </div>
            </div>

            {/* APARELHO DE ENTRADA (TRADE-IN) */}
            <div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Aparelho de entrada (Trade-in)</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                R$ {totalTradeInAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Outros</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                R$ 0,00
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 14 }}>
            * Total de vendas sem incluir fundo de troco, suprimentos ou sangrias. A conferência da gaveta considera apenas dinheiro físico.
          </div>
        </div>
      </div>
    </div>
  );
};
