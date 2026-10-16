import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Building,
  FileText,
  X,
} from 'lucide-react';
import type {
  FinancialAccount,
  BillToPay,
  BillToReceive,
  FinancialTransaction,
  FinancialDashboardSummary,
} from '../../types.js';
import {
  fetchFinancialAccounts,
  fetchBillsToPay,
  fetchBillsToReceive,
  fetchFinancialTransactions,
  fetchFinancialDashboardSummary,
  createFinancialAccountApi,
  createBillToPayApi,
  payBillApi,
  createBillToReceiveApi,
  receiveBillApi,
  transferBetweenAccountsApi,
} from '../../api/erpApi.js';

type FinancialSubtab = 'dashboard' | 'bills_pay' | 'bills_receive' | 'accounts' | 'transactions';

export const FinancialManagementView: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState<FinancialSubtab>('dashboard');
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [billsPay, setBillsPay] = useState<BillToPay[]>([]);
  const [billsReceive, setBillsReceive] = useState<BillToReceive[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [summary, setSummary] = useState<FinancialDashboardSummary | null>(null);

  // Modais
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showNewBillPayModal, setShowNewBillPayModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<BillToPay | null>(null);
  const [showNewBillReceiveModal, setShowNewBillReceiveModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState<BillToReceive | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Formulário Nova Conta Bancária
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<FinancialAccount['type']>('checking');
  const [newAccBank, setNewAccBank] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');

  // Formulário Nova Conta a Pagar
  const [newBpSupplier, setNewBpSupplier] = useState('');
  const [newBpCategory, setNewBpCategory] = useState('Fornecedores');
  const [newBpDescription, setNewBpDescription] = useState('');
  const [newBpAmount, setNewBpAmount] = useState('');
  const [newBpDueDate, setNewBpDueDate] = useState('');

  // Formulário Nova Conta a Receber
  const [newBrCustomer, setNewBrCustomer] = useState('');
  const [newBrCategory, setNewBrCategory] = useState('Venda');
  const [newBrDescription, setNewBrDescription] = useState('');
  const [newBrAmount, setNewBrAmount] = useState('');
  const [newBrDueDate, setNewBrDueDate] = useState('');

  // Formulário Pagamento de Conta
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Pix');
  const [payAccountId, setPayAccountId] = useState('');

  // Formulário Recebimento de Conta
  const [recAmount, setRecAmount] = useState('');
  const [recMethod, setRecMethod] = useState('Pix');
  const [recAccountId, setRecAccountId] = useState('');

  // Formulário Transferência
  const [trFromAcc, setTrFromAcc] = useState('');
  const [trToAcc, setTrToAcc] = useState('');
  const [trAmount, setTrAmount] = useState('');
  const [trDescription, setTrDescription] = useState('');

  const loadData = async () => {
    try {
      const [accs, bps, brs, txs, sum] = await Promise.all([
        fetchFinancialAccounts(),
        fetchBillsToPay(),
        fetchBillsToReceive(),
        fetchFinancialTransactions(),
        fetchFinancialDashboardSummary(),
      ]);
      setAccounts(accs);
      setBillsPay(bps);
      setBillsReceive(brs);
      setTransactions(txs);
      setSummary(sum);
      if (accs.length > 0) {
        setPayAccountId(accs[0].id);
        setRecAccountId(accs[0].id);
        setTrFromAcc(accs[0].id);
        if (accs.length > 1) setTrToAcc(accs[1].id);
      }
    } catch (e) {
      console.warn('Erro ao carregar dados financeiros:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccBalance) return;
    await createFinancialAccountApi({
      name: newAccName,
      type: newAccType,
      bankName: newAccBank,
      initialBalance: Number(newAccBalance),
      initialBalanceDate: new Date().toISOString().split('T')[0],
      currentBalance: Number(newAccBalance),
      status: 'active',
    });
    setShowNewAccountModal(false);
    setNewAccName('');
    setNewAccBalance('');
    setNewAccBank('');
    loadData();
  };

  const handleCreateBillPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBpSupplier || !newBpAmount || !newBpDueDate) return;
    const amount = Number(newBpAmount);
    await createBillToPayApi({
      supplierName: newBpSupplier,
      category: newBpCategory,
      description: newBpDescription || `Despesa com ${newBpSupplier}`,
      originalAmount: amount,
      finalAmount: amount,
      paidAmount: 0,
      remainingAmount: amount,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newBpDueDate,
      status: 'pending',
      installmentsCount: 1,
      installmentNumber: 1,
    });
    setShowNewBillPayModal(false);
    setNewBpSupplier('');
    setNewBpAmount('');
    setNewBpDescription('');
    setNewBpDueDate('');
    loadData();
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal || !payAmount || !payAccountId) return;
    await payBillApi(showPayModal.id, {
      paidAmount: Number(payAmount),
      paymentMethod: payMethod,
      accountId: payAccountId,
      paymentDate: new Date().toISOString().split('T')[0],
      operatorName: 'Robson Macedo',
    });
    setShowPayModal(null);
    setPayAmount('');
    loadData();
  };

  const handleCreateBillReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrCustomer || !newBrAmount || !newBrDueDate) return;
    const amount = Number(newBrAmount);
    await createBillToReceiveApi({
      customerName: newBrCustomer,
      category: newBrCategory,
      description: newBrDescription || `Faturamento ${newBrCustomer}`,
      originalAmount: amount,
      receivedAmount: 0,
      remainingAmount: amount,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newBrDueDate,
      status: 'pending',
      installmentsCount: 1,
      installmentNumber: 1,
    });
    setShowNewBillReceiveModal(false);
    setNewBrCustomer('');
    setNewBrAmount('');
    setNewBrDescription('');
    setNewBrDueDate('');
    loadData();
  };

  const handleExecuteReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReceiveModal || !recAmount || !recAccountId) return;
    await receiveBillApi(showReceiveModal.id, {
      receivedAmount: Number(recAmount),
      paymentMethod: recMethod,
      accountId: recAccountId,
      receiveDate: new Date().toISOString().split('T')[0],
      operatorName: 'Robson Macedo',
    });
    setShowReceiveModal(null);
    setRecAmount('');
    loadData();
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trFromAcc || !trToAcc || !trAmount || trFromAcc === trToAcc) return;
    await transferBetweenAccountsApi({
      fromAccountId: trFromAcc,
      toAccountId: trToAcc,
      amount: Number(trAmount),
      description: trDescription,
      operatorName: 'Robson Macedo',
    });
    setShowTransferModal(false);
    setTrAmount('');
    setTrDescription('');
    loadData();
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            GESTÃO / FINANCEIRO
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Controle Financeiro & Fluxo de Caixa
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Gestão de contas bancárias, contas a pagar, contas a receber, conciliação e DRE em tempo real.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowTransferModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Repeat size={14} />
            <span>Transferência</span>
          </button>

          <button
            onClick={() => setShowNewBillPayModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            <span>Conta a Pagar</span>
          </button>

          <button
            onClick={() => setShowNewBillReceiveModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
            }}
          >
            <Plus size={14} />
            <span>Conta a Receber</span>
          </button>
        </div>
      </div>

      {/* SUB-ABAS DA GESTÃO FINANCEIRA */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 12 }}>
        {[
          { id: 'dashboard', label: 'Dashboard & Indicadores', icon: TrendingUp },
          { id: 'bills_pay', label: `Contas a Pagar (${billsPay.filter(b => b.status === 'pending' || b.status === 'partial').length})`, icon: TrendingDown },
          { id: 'bills_receive', label: `Contas a Receber (${billsReceive.filter(b => b.status === 'pending' || b.status === 'partial').length})`, icon: ArrowUpRight },
          { id: 'accounts', label: `Contas Bancárias (${accounts.length})`, icon: Building },
          { id: 'transactions', label: 'Extrato & Conciliação', icon: FileText },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeSubtab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubtab(item.id as FinancialSubtab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#f97316' : 'rgba(255, 255, 255, 0.04)',
                color: isActive ? '#fff' : '#94a3b8',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. DASHBOARD & INDICADORES FINANCEIROS */}
      {activeSubtab === 'dashboard' && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* CARDS INDICADORES PRINCIPAIS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700 }}>
                <span>SALDO REGISTRADO</span>
                <Wallet size={16} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: 8 }}>
                R$ {summary.registeredBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                Soma de todas as contas ativas
              </div>
            </div>

            <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700 }}>
                <span>CONTAS A RECEBER</span>
                <ArrowUpRight size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: 8 }}>
                R$ {summary.pendingToReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 4 }}>
                Valores pendentes de vendas e OS
              </div>
            </div>

            <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700 }}>
                <span>CONTAS A PAGAR</span>
                <ArrowDownRight size={16} color="#ef4444" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: 8 }}>
                R$ {summary.pendingToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>
                Obrigações e fornecedores
              </div>
            </div>

            <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700 }}>
                <span>SALDO PREVISTO</span>
                <DollarSign size={16} color="#f97316" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
                R$ {summary.projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
                Saldo atual + receber - pagar
              </div>
            </div>
          </div>

          {/* INDICADORES SECUNDÁRIOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 700 }}>TÍTULOS VENCIDOS</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444', marginTop: 4 }}>
                R$ {summary.overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: 700 }}>RECEBIMENTOS DO DIA</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                R$ {summary.todayInflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 700 }}>PAGAMENTOS DO DIA</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444', marginTop: 4 }}>
                R$ {summary.todayOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ background: 'rgba(249, 115, 22, 0.06)', border: '1px solid rgba(249, 115, 22, 0.2)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '0.7rem', color: '#fdba74', fontWeight: 700 }}>RESULTADO DO PERÍODO</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: summary.periodResult >= 0 ? '#10b981' : '#ef4444', marginTop: 4 }}>
                R$ {summary.periodResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* CONTAS BANCÁRIAS DISPONÍVEIS */}
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
              Saldos das Contas da Empresa
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {accounts.map(acc => (
                <div key={acc.id} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>{acc.name}</span>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}>
                      {acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'cash' ? 'Caixa Físico' : 'Liquidação Cartão'}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: 10 }}>
                    R$ {acc.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                    {acc.bankName || 'Instituição não informada'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTAS A PAGAR */}
      {activeSubtab === 'bills_pay' && (
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
              Relação de Obrigações e Despesas
            </div>
            <button
              onClick={() => setShowNewBillPayModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              <span>Nova Despesa</span>
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Vencimento</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Fornecedor / Favorecido</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Categoria</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Descrição</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Valor Total</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Pago</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Saldo Devedor</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {billsPay.map(bp => {
                const isOverdue = bp.dueDate < new Date().toISOString().split('T')[0] && bp.status !== 'paid';
                return (
                  <tr key={bp.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#f8fafc' }}>
                    <td style={{ padding: '14px 18px', color: isOverdue ? '#ef4444' : '#94a3b8', fontWeight: isOverdue ? 800 : 500 }}>
                      {bp.dueDate}
                      {isOverdue && <span style={{ marginLeft: 6, fontSize: '0.7rem' }}>⚠️ Vencida</span>}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>{bp.supplierName}</td>
                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{bp.category}</td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>{bp.description}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>R$ {bp.finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '14px 18px', color: '#10b981' }}>R$ {bp.paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#ef4444' }}>R$ {bp.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: bp.status === 'paid' ? 'rgba(16, 185, 129, 0.15)' : bp.status === 'partial' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: bp.status === 'paid' ? '#10b981' : bp.status === 'partial' ? '#eab308' : '#ef4444',
                      }}>
                        {bp.status === 'paid' ? 'Pago' : bp.status === 'partial' ? 'Parcial' : 'Pendente'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {bp.status !== 'paid' && (
                        <button
                          onClick={() => {
                            setShowPayModal(bp);
                            setPayAmount(String(bp.remainingAmount));
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. CONTAS A RECEBER */}
      {activeSubtab === 'bills_receive' && (
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
              Relação de Títulos a Receber (Vendas & Serviços)
            </div>
            <button
              onClick={() => setShowNewBillReceiveModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#f97316',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              <span>Novo Recebível</span>
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Vencimento</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Cliente</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Origem</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Descrição</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Valor Total</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Recebido</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Saldo Aberto</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {billsReceive.map(br => {
                const isOverdue = br.dueDate < new Date().toISOString().split('T')[0] && br.status !== 'received';
                return (
                  <tr key={br.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#f8fafc' }}>
                    <td style={{ padding: '14px 18px', color: isOverdue ? '#ef4444' : '#94a3b8', fontWeight: isOverdue ? 800 : 500 }}>
                      {br.dueDate}
                      {isOverdue && <span style={{ marginLeft: 6, fontSize: '0.7rem' }}>⚠️ Atrasado</span>}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>{br.customerName}</td>
                    <td style={{ padding: '14px 18px', color: '#f97316', fontWeight: 600 }}>{br.saleNumber || br.osNumber || 'Manual'}</td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>{br.description}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>R$ {br.originalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '14px 18px', color: '#10b981' }}>R$ {br.receivedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#f8fafc' }}>R$ {br.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: br.status === 'received' ? 'rgba(16, 185, 129, 0.15)' : br.status === 'partial' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                        color: br.status === 'received' ? '#10b981' : br.status === 'partial' ? '#eab308' : '#f97316',
                      }}>
                        {br.status === 'received' ? 'Recebido' : br.status === 'partial' ? 'Parcial' : 'Pendente'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {br.status !== 'received' && (
                        <button
                          onClick={() => {
                            setShowReceiveModal(br);
                            setRecAmount(String(br.remainingAmount));
                          }}
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Receber
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. CONTAS BANCÁRIAS */}
      {activeSubtab === 'accounts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowNewAccountModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#f97316',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              <span>Cadastrar Nova Conta</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {accounts.map(acc => (
              <div key={acc.id} style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{acc.bankName || 'Caixa Interno'}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                    {acc.status === 'active' ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Saldo Atual Conciliado</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', marginTop: 2 }}>
                    R$ {acc.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span>Saldo Abertura: R$ {acc.initialBalance.toFixed(2)}</span>
                  <span>Data: {acc.initialBalanceDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. EXTRATO & TRANSAÇÕES */}
      {activeSubtab === 'transactions' && (
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
              Extrato Geral de Movimentações
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {transactions.length} lançamentos registrados
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Data</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Tipo</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Conta</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Categoria</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Descrição</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Origem</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Valor</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Operador</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#f8fafc' }}>
                  <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{tx.date}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: tx.type === 'inflow' ? 'rgba(16, 185, 129, 0.15)' : tx.type === 'outflow' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      color: tx.type === 'inflow' ? '#10b981' : tx.type === 'outflow' ? '#ef4444' : '#38bdf8',
                    }}>
                      {tx.type === 'inflow' ? 'Entrada' : tx.type === 'outflow' ? 'Saída' : 'Transferência'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>{tx.accountName}</td>
                  <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{tx.category}</td>
                  <td style={{ padding: '14px 18px', color: '#f8fafc', fontWeight: 600 }}>{tx.description}</td>
                  <td style={{ padding: '14px 18px', color: '#f97316' }}>{tx.origin}</td>
                  <td style={{
                    padding: '14px 18px',
                    fontWeight: 800,
                    color: tx.type === 'inflow' ? '#10b981' : tx.type === 'outflow' ? '#ef4444' : '#38bdf8'
                  }}>
                    {tx.type === 'outflow' ? '-' : '+'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{tx.operatorName}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: '0.72rem', fontWeight: 700 }}>
                      <CheckCircle2 size={12} />
                      <span>Conciliado</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: NOVA CONTA BANCÁRIA */}
      {showNewAccountModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 450 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>Nova Conta Bancária</h3>
              <button onClick={() => setShowNewAccountModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Nome da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Santander PJ, Gaveta Balcão"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Tipo de Conta</label>
                <select
                  value={newAccType}
                  onChange={e => setNewAccType(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="cash">Caixa Físico</option>
                  <option value="card_settlement">Liquidação de Cartão / D+1</option>
                  <option value="digital_wallet">Carteira Digital</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Instituição / Banco</label>
                <input
                  type="text"
                  placeholder="Ex: Santander, Stone, Bradesco"
                  value={newAccBank}
                  onChange={e => setNewAccBank(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Saldo Inicial (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newAccBalance}
                  onChange={e => setNewAccBalance(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: 8,
                }}
              >
                Cadastrar Conta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA CONTA A PAGAR */}
      {showNewBillPayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 450 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>Nova Conta a Pagar</h3>
              <button onClick={() => setShowNewBillPayModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateBillPay} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Fornecedor / Favorecido</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Distribuidora SP, Aluguel"
                  value={newBpSupplier}
                  onChange={e => setNewBpSupplier(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Categoria</label>
                <select
                  value={newBpCategory}
                  onChange={e => setNewBpCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                >
                  <option value="Fornecedores de Aparelhos">Fornecedores de Aparelhos</option>
                  <option value="Peças & Telas">Peças & Telas</option>
                  <option value="Aluguel & Condomínio">Aluguel & Condomínio</option>
                  <option value="Energia & Água">Energia & Água</option>
                  <option value="Internet & Telefonia">Internet & Telefonia</option>
                  <option value="Pró-labore & Salários">Pró-labore & Salários</option>
                  <option value="Outras Despesas">Outras Despesas</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Descrição</label>
                <input
                  type="text"
                  placeholder="Detalhes da despesa"
                  value={newBpDescription}
                  onChange={e => setNewBpDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newBpAmount}
                    onChange={e => setNewBpAmount(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Vencimento</label>
                  <input
                    type="date"
                    required
                    value={newBpDueDate}
                    onChange={e => setNewBpDueDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: 8,
                }}
              >
                Salvar Despesa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXECUTAR PAGAMENTO */}
      {showPayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>Liquidar Conta a Pagar</h3>
              <button onClick={() => setShowPayModal(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 14 }}>
              <strong>{showPayModal.supplierName}</strong> - {showPayModal.description}
            </p>
            <form onSubmit={handleExecutePayment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Valor a Pagar (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Forma de Pagamento</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                >
                  <option value="Pix">Pix</option>
                  <option value="Transferência Bancária">Transferência TED/DOC</option>
                  <option value="Dinheiro">Dinheiro Espécie</option>
                  <option value="Boleto">Boleto Bancário</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Conta Bancária de Origem</label>
                <select
                  value={payAccountId}
                  onChange={e => setPayAccountId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Saldo: R$ {a.currentBalance.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: 8,
                }}
              >
                Confirmar Pagamento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA CONTA A RECEBER */}
      {showNewBillReceiveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 450 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f97316' }}>Nova Conta a Receber</h3>
              <button onClick={() => setShowNewBillReceiveModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateBillReceive} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={newBrCustomer}
                  onChange={e => setNewBrCustomer(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Categoria</label>
                <select
                  value={newBrCategory}
                  onChange={e => setNewBrCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                >
                  <option value="Venda Aparelho">Venda Aparelho</option>
                  <option value="Assistência Técnica">Assistência Técnica</option>
                  <option value="Acessórios">Acessórios</option>
                  <option value="Outros Recebíveis">Outros Recebíveis</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Descrição</label>
                <input
                  type="text"
                  placeholder="Detalhes do faturamento"
                  value={newBrDescription}
                  onChange={e => setNewBrDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newBrAmount}
                    onChange={e => setNewBrAmount(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Vencimento</label>
                  <input
                    type="date"
                    required
                    value={newBrDueDate}
                    onChange={e => setNewBrDueDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: '#f97316',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: 8,
                }}
              >
                Salvar Título a Receber
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXECUTAR RECEBIMENTO */}
      {showReceiveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>Registrar Recebimento</h3>
              <button onClick={() => setShowReceiveModal(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 14 }}>
              <strong>{showReceiveModal.customerName}</strong> - {showReceiveModal.description}
            </p>
            <form onSubmit={handleExecuteReceive} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Valor Recebido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={recAmount}
                  onChange={e => setRecAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Forma de Pagamento</label>
                <select
                  value={recMethod}
                  onChange={e => setRecMethod(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                >
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro Espécie</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Transferência Bancária">Transferência TED</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Conta Financeira de Destino</label>
                <select
                  value={recAccountId}
                  onChange={e => setRecAccountId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Saldo: R$ {a.currentBalance.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: 8,
                }}
              >
                Confirmar Recebimento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFERÊNCIA ENTRE CONTAS */}
      {showTransferModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 450 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>Transferência entre Contas</h3>
              <button onClick={() => setShowTransferModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Conta de Origem (Sai Dinheiro)</label>
                <select
                  value={trFromAcc}
                  onChange={e => setTrFromAcc(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (R$ {a.currentBalance.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Conta de Destino (Entra Dinheiro)</label>
                <select
                  value={trToAcc}
                  onChange={e => setTrToAcc(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (R$ {a.currentBalance.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Valor a Transferir (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={trAmount}
                  onChange={e => setTrAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Descrição / Justificativa</label>
                <input
                  type="text"
                  placeholder="Ex: Depósito do caixa na conta corrente"
                  value={trDescription}
                  onChange={e => setTrDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', marginTop: 4 }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#38bdf8',
                  color: '#090d16',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: 8,
                }}
              >
                Concluir Transferência
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
