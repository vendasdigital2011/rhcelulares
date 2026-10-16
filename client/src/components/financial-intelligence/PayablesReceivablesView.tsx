import React, { useState, useEffect } from 'react';
import {
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
} from 'lucide-react';
import type { FinancialConsolidatedData, BillToPay, BillToReceive } from '../../types.js';
import { FinancialRepository } from '../../repositories/financialRepository.js';

interface PayablesReceivablesViewProps {
  data: FinancialConsolidatedData;
}

export const PayablesReceivablesView: React.FC<PayablesReceivablesViewProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'payables' | 'receivables'>('payables');
  const [billsPay, setBillsPay] = useState<BillToPay[]>([]);
  const [billsReceive, setBillsReceive] = useState<BillToReceive[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      const [bp, br] = await Promise.all([
        FinancialRepository.getBillsToPay(),
        FinancialRepository.getBillsToReceive(),
      ]);
      setBillsPay(bp);
      setBillsReceive(br);
    }
    load();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBillsPay = billsPay.filter(b => {
    const isOverdue = b.dueDate < todayStr && (b.status === 'pending' || b.status === 'partial');
    if (filterStatus === 'pending' && b.status !== 'pending' && b.status !== 'partial') return false;
    if (filterStatus === 'overdue' && !isOverdue) return false;
    if (filterStatus === 'paid' && b.status !== 'paid') return false;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return (
        b.supplierName.toLowerCase().includes(term) ||
        b.description.toLowerCase().includes(term) ||
        b.category.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const filteredBillsReceive = billsReceive.filter(b => {
    const isOverdue = b.dueDate < todayStr && (b.status === 'pending' || b.status === 'partial');
    if (filterStatus === 'pending' && b.status !== 'pending' && b.status !== 'partial') return false;
    if (filterStatus === 'overdue' && !isOverdue) return false;
    if (filterStatus === 'paid' && b.status !== 'received') return false;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(term) ||
        b.description.toLowerCase().includes(term) ||
        b.category.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. TOPO DA SEÇÃO: CONTAS A PAGAR & A RECEBER */}
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
            Compromissos Operacionais: Contas a Pagar & a Receber
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
            Monitoramento preventivo de vencimentos com fornecedores e controle de inadimplência de clientes.
          </p>
        </div>

        {/* ABAS PAGAR / RECEBER */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          padding: 3,
        }}>
          <button
            onClick={() => setActiveTab('payables')}
            style={{
              background: activeTab === 'payables' ? '#ef4444' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: 6,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowUpRight size={15} />
            <span>Contas a Pagar ({data.summary.pendingBillsToPayAmount > 0 ? `R$ ${data.summary.pendingBillsToPayAmount.toFixed(0)}` : 'R$ 0'})</span>
          </button>

          <button
            onClick={() => setActiveTab('receivables')}
            style={{
              background: activeTab === 'receivables' ? '#06b6d4' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: 6,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowDownRight size={15} />
            <span>Contas a Receber ({data.summary.pendingBillsToReceiveAmount > 0 ? `R$ ${data.summary.pendingBillsToReceiveAmount.toFixed(0)}` : 'R$ 0'})</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE BUSCA E FILTROS */}
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
        padding: '12px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 10, color: '#64748b' }} />
          <input
            type="text"
            placeholder={activeTab === 'payables' ? 'Buscar por fornecedor, descrição...' : 'Buscar por cliente, serviço...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              color: '#fff',
              fontSize: '0.8rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'pending', 'overdue', 'paid'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                background: filterStatus === st ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: filterStatus === st ? '#fff' : '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {st === 'all' ? 'Todos' : st === 'pending' ? 'Em Aberto' : st === 'overdue' ? 'Vencidos ⚠️' : 'Quitados'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TABELA DE TÍTULOS (PAGAR OU RECEBER) */}
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {activeTab === 'payables' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 16px' }}>Fornecedor / Beneficiário</th>
                <th style={{ padding: '12px 16px' }}>Descrição & Categoria</th>
                <th style={{ padding: '12px 16px' }}>Vencimento</th>
                <th style={{ padding: '12px 16px' }}>Valor Original</th>
                <th style={{ padding: '12px 16px' }}>Saldo a Pagar</th>
                <th style={{ padding: '12px 16px' }}>Situação</th>
              </tr>
            </thead>
            <tbody>
              {filteredBillsPay.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                    Nenhuma conta a pagar encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredBillsPay.map(b => {
                  const isOverdue = b.dueDate < todayStr && b.status !== 'paid';
                  return (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isOverdue ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>
                        {b.supplierName}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                        <div>{b.description}</div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{b.category}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: isOverdue ? '#ef4444' : '#cbd5e1', fontWeight: isOverdue ? 800 : 500 }}>
                        {new Date(b.dueDate).toLocaleDateString('pt-BR')}
                        {isOverdue && <span style={{ marginLeft: 6, fontSize: '0.68rem' }}>(Vencida!)</span>}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                        R$ {b.finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#f8fafc' }}>
                        R$ {b.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          background: b.status === 'paid' ? 'rgba(16, 185, 129, 0.2)' : isOverdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: b.status === 'paid' ? '#10b981' : isOverdue ? '#ef4444' : '#f59e0b',
                        }}>
                          {b.status === 'paid' ? 'Pago' : isOverdue ? 'Vencido' : b.status === 'partial' ? 'Parcial' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 16px' }}>Cliente</th>
                <th style={{ padding: '12px 16px' }}>Origem da Receita & Descrição</th>
                <th style={{ padding: '12px 16px' }}>Vencimento Previsto</th>
                <th style={{ padding: '12px 16px' }}>Valor Original</th>
                <th style={{ padding: '12px 16px' }}>Saldo a Receber</th>
                <th style={{ padding: '12px 16px' }}>Situação</th>
              </tr>
            </thead>
            <tbody>
              {filteredBillsReceive.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                    Nenhuma conta a receber encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredBillsReceive.map(b => {
                  const isOverdue = b.dueDate < todayStr && b.status !== 'received';
                  return (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isOverdue ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>
                        {b.customerName}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                        <div>{b.description}</div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{b.category}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: isOverdue ? '#ef4444' : '#cbd5e1', fontWeight: isOverdue ? 800 : 500 }}>
                        {new Date(b.dueDate).toLocaleDateString('pt-BR')}
                        {isOverdue && <span style={{ marginLeft: 6, fontSize: '0.68rem' }}>(Atrasado!)</span>}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                        R$ {b.originalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#10b981' }}>
                        R$ {b.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          background: b.status === 'received' ? 'rgba(16, 185, 129, 0.2)' : isOverdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                          color: b.status === 'received' ? '#10b981' : isOverdue ? '#ef4444' : '#06b6d4',
                        }}>
                          {b.status === 'received' ? 'Recebido' : isOverdue ? 'Inadimplente' : 'A Vencer'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        padding: 12,
        fontSize: '0.75rem',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <Clock size={16} />
        <span>
          <strong>Diretriz de Controle Humano:</strong> O sistema apenas sinaliza alertas e prazos. Nenhuma baixa ou cobrança é disparada automaticamente sem seu consentimento explícito.
        </span>
      </div>
    </div>
  );
};
