import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  CheckCircle2,
  Target,
  Save,
  DollarSign,
  X,
} from 'lucide-react';
import type { Sale, AppUser, FinancialAccount, CommissionRule } from '../../types.js';
import {
  fetchCommissionRules,
  saveCommissionRuleApi,
  calculateCommissionsApi,
  payCommissionApi,
  fetchAppUsers,
  fetchFinancialAccounts,
} from '../../api/erpApi.js';

interface CommissionsViewProps {
  sales: Sale[];
}

export const CommissionsView: React.FC<CommissionsViewProps> = ({ sales = [] }) => {
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-15');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [, setRules] = useState<CommissionRule[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [summary, setSummary] = useState<{
    bestSellerName: string;
    commissionableRevenue: number;
    unlockedCommission: number;
    belowTargetCount: number;
  }>({
    bestSellerName: 'Sem vendas',
    commissionableRevenue: 0,
    unlockedCommission: 0,
    belowTargetCount: 0,
  });

  // Formulário de Regra
  const [selectedUserId, setSelectedUserId] = useState('');
  const [fixedAmount, setFixedAmount] = useState('20.00');
  const [minDevices, setMinDevices] = useState('10');
  const [periodType, setPeriodType] = useState<'mes' | 'semana' | 'quinzena'>('mes');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Modal Pagar Comissão
  const [payoutModal, setPayoutModal] = useState<{ userName: string; amount: number } | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');

  const loadData = async () => {
    const [userList, ruleList, accs] = await Promise.all([
      fetchAppUsers(),
      fetchCommissionRules(),
      fetchFinancialAccounts(),
    ]);
    setUsers(userList);
    setRules(ruleList);
    setAccounts(accs);
    if (userList.length > 0 && !selectedUserId) setSelectedUserId(userList[0].id);
    if (accs.length > 0 && !selectedAccountId) setSelectedAccountId(accs[0].id);

    const calc = await calculateCommissionsApi(sales, startDate, endDate);
    setRanking(calc.ranking);
    setSummary(calc.summary);
  };

  useEffect(() => {
    loadData();
  }, [sales, startDate, endDate]);

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find(u => u.id === selectedUserId);
    if (!targetUser) return;

    await saveCommissionRuleApi({
      userId: targetUser.id,
      userName: targetUser.name,
      fixedPerDevice: Number(fixedAmount),
      minDevices: Number(minDevices),
      period: periodType,
      active: true,
    });

    setSaveSuccessMsg(`Regra de comissão para ${targetUser.name} salva com sucesso!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    loadData();
  };

  const handleExecutePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutModal || !selectedAccountId) return;

    await payCommissionApi({
      userName: payoutModal.userName,
      amount: payoutModal.amount,
      paidBy: 'Robson Macedo (Dono)',
      accountId: selectedAccountId,
      periodLabel: `${startDate} a ${endDate}`,
    });

    setPayoutSuccessMsg(`Pagamento de R$ ${payoutModal.amount.toFixed(2)} registrado e debitado da conta com sucesso!`);
    setPayoutModal(null);
    setTimeout(() => setPayoutSuccessMsg(''), 5000);
    loadData();
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* CABEÇALHO */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          DESEMPENHO DA EQUIPE
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
          Comissões
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
          Defina o valor por aparelho, o mínimo de vendas e o período necessário para liberar a comissão.
        </p>
      </div>

      {payoutSuccessMsg && (
        <div style={{ padding: '12px 18px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, color: '#10b981', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          <span>{payoutSuccessMsg}</span>
        </div>
      )}

      {/* FILTROS DE DATA NO TOPO */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Data inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ display: 'block', marginTop: 4, padding: '9px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Data final</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ display: 'block', marginTop: 4, padding: '9px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <button
          onClick={loadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#fff',
            border: 'none',
            padding: '11px 22px',
            borderRadius: 8,
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
          }}
        >
          <TrendingUp size={16} />
          <span>Atualizar dashboard</span>
        </button>
      </div>

      {/* 4 CARDS DE INDICADORES (CONFORME IMAGEM 4) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700 }}>
            <span>Melhor vendedor</span>
            <Award size={18} color="#f97316" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
            {summary.bestSellerName}
          </div>
        </div>

        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700 }}>
            <span>Faturamento comissionado</span>
            <TrendingUp size={18} color="#f97316" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
            R$ {summary.commissionableRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700 }}>
            <span>Comissão liberada</span>
            <CheckCircle2 size={18} color="#f97316" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
            R$ {summary.unlockedCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700 }}>
            <span>Ainda abaixo da meta</span>
            <Target size={18} color="#f97316" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>
            {summary.belowTargetCount}
          </div>
        </div>
      </div>

      {/* CARD: CONFIGURAR COMISSÃO DO FUNCIONÁRIO (CONFORME IMAGEM 4) */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
            <DollarSign size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>Configurar comissão do funcionário</h3>
          </div>
        </div>

        {saveSuccessMsg && (
          <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, color: '#10b981', fontSize: '0.78rem', marginBottom: 14 }}>
            {saveSuccessMsg}
          </div>
        )}

        <form onSubmit={handleSaveCommission}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Funcionário</label>
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Comissão por aparelho (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={fixedAmount}
                onChange={e => setFixedAmount(e.target.value)}
                placeholder="20.00"
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Mínimo de aparelhos</label>
              <input
                type="number"
                required
                value={minDevices}
                onChange={e => setMinDevices(e.target.value)}
                placeholder="10"
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Período do mínimo</label>
              <select
                value={periodType}
                onChange={e => setPeriodType(e.target.value as any)}
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
              >
                <option value="mes">Por mês</option>
                <option value="semana">Por semana</option>
                <option value="quinzena">Por quinzena</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 8, padding: '12px 16px', maxWidth: 700, fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Exemplo: R$ 20 por aparelho e mínimo de 10 por semana. Com 9 aparelhos, o funcionário recebe R$ 0. Com 15, recebe 15 × R$ 20 = R$ 300. Se a consulta abranger vários períodos, o mínimo de aparelhos será acumulado.
            </div>

            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#fff',
                border: 'none',
                padding: '11px 24px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
              }}
            >
              <Save size={15} />
              <span>Salvar comissão</span>
            </button>
          </div>
        </form>
      </div>

      {/* CARD: RANKING E METAS DA EQUIPE (CONFORME IMAGEM 4) */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', marginBottom: 16 }}>
          Ranking e metas da equipe
        </div>

        {ranking.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>
            Nenhum funcionário com vendas no período consultado.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Vendedor</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Aparelhos Vendidos</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Meta Mínima</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status da Meta</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Faturamento Gerado</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Comissão Calculada</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Comissão Liberada</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((row, index) => (
                <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#f8fafc' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.userName}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#f97316' }}>{row.devicesSold} un</td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{row.minDevices} un</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: row.targetReached ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: row.targetReached ? '#10b981' : '#eab308',
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>R$ {row.totalRevenue.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8' }}>R$ {row.calculatedAmount.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: row.unlockedAmount > 0 ? '#10b981' : '#94a3b8' }}>
                    R$ {row.unlockedAmount.toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    {row.pendingPayoutAmount > 0 ? (
                      <button
                        onClick={() => setPayoutModal({ userName: row.userName, amount: row.pendingPayoutAmount })}
                        style={{
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '5px 12px',
                          borderRadius: 6,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Pagar Comissão
                      </button>
                    ) : row.targetReached ? (
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>✓ Quitado</span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Abaixo da meta</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL PAGAMENTO DE COMISSÃO */}
      {payoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>Pagar Comissão</h3>
              <button onClick={() => setPayoutModal(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: 14 }}>
              Pagamento de <strong>R$ {payoutModal.amount.toFixed(2)}</strong> para <strong>{payoutModal.userName}</strong>.
            </p>

            <form onSubmit={handleExecutePayout} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Conta Bancária de Saída</label>
                <select
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  style={{ width: '100%', marginTop: 6, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Saldo: R$ {a.currentBalance.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                💡 O pagamento gerará automaticamente um lançamento de despesa operacional na conta selecionada e atualizará o extrato financeiro.
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '11px',
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: 6,
                }}
              >
                Confirmar Saída Financeira
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
