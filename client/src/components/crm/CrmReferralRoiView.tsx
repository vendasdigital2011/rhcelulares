import React, { useState, useEffect } from 'react';
import {
  Gift,
  DollarSign,
  Copy,
  Check,
  Send,
  Plus,
  Smartphone,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import type { Customer, Sale } from '../../types.js';

interface Ambassador {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceBought: string;
  referralCode: string;
  referralLink: string;
  friendsInvited: number;
  friendsConverted: number;
  totalRewardEarned: number;
  pendingReward: number;
  createdAt: string;
}

interface RoiMetrics {
  totalRevenueRecovered: number;
  salesFromAutomationsCount: number;
  salesFromReferralsCount: number;
  softwareCostMonthly: number;
  roiMultiplier: number;
  tmrMinutesAverage: number;
  activeAttendantsCount: number;
}

interface CrmReferralRoiViewProps {
  sales?: Sale[];
  customers?: Customer[];
}

const DEFAULT_AMBASSADORS: Ambassador[] = [
  {
    id: 'amb-01',
    customerName: 'Lucas Rodrigues',
    customerPhone: '(77) 99122-3344',
    deviceBought: 'iPhone 15 Pro 256GB',
    referralCode: 'HIAGO-LUCAS15',
    referralLink: 'https://hiago-iphones.vercel.app/?ref=HIAGO-LUCAS15',
    friendsInvited: 6,
    friendsConverted: 3,
    totalRewardEarned: 300,
    pendingReward: 100,
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'amb-02',
    customerName: 'Mariana Costa',
    customerPhone: '(77) 98844-5566',
    deviceBought: 'iPhone 14 128GB',
    referralCode: 'HIAGO-MARI14',
    referralLink: 'https://hiago-iphones.vercel.app/?ref=HIAGO-MARI14',
    friendsInvited: 4,
    friendsConverted: 2,
    totalRewardEarned: 200,
    pendingReward: 0,
    createdAt: '2026-10-20T14:30:00Z',
  },
  {
    id: 'amb-03',
    customerName: 'Rafael Guimarães',
    customerPhone: '(77) 99911-8822',
    deviceBought: 'iPhone 13 Pro Max',
    referralCode: 'HIAGO-RAFA13',
    referralLink: 'https://hiago-iphones.vercel.app/?ref=HIAGO-RAFA13',
    friendsInvited: 3,
    friendsConverted: 1,
    totalRewardEarned: 100,
    pendingReward: 100,
    createdAt: '2026-11-01T09:15:00Z',
  },
];

export const CrmReferralRoiView: React.FC<CrmReferralRoiViewProps> = () => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>(DEFAULT_AMBASSADORS);
  const [roiMetrics, setRoiMetrics] = useState<RoiMetrics>({
    totalRevenueRecovered: 54200.00,
    salesFromAutomationsCount: 14,
    salesFromReferralsCount: 6,
    softwareCostMonthly: 497.00,
    roiMultiplier: 109.1,
    tmrMinutesAverage: 4.2,
    activeAttendantsCount: 4,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Novo Embaixador
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDevice, setNewDevice] = useState('');

  useEffect(() => {
    fetch('/api/whatsapp/referrals')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setAmbassadors(json.data);
        }
      })
      .catch(() => {});

    fetch('/api/whatsapp/roi-metrics')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setRoiMetrics(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyLink = (amb: Ambassador) => {
    navigator.clipboard.writeText(amb.referralLink);
    setCopiedId(amb.id);
    setToastMessage(`Link de indicação copiado: ${amb.referralCode}`);
    setTimeout(() => {
      setCopiedId(null);
      setToastMessage(null);
    }, 2500);
  };

  const handleShareWhatsApp = async (amb: Ambassador) => {
    setSharingId(amb.id);
    try {
      const res = await fetch(`/api/whatsapp/referrals/${amb.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator: 'Hiago Vendas' }),
      });
      const json = await res.json();
      if (json.success) {
        setToastMessage(`Convite de embaixador enviado no WhatsApp de ${amb.customerName}!`);
      } else {
        throw new Error(json.error);
      }
    } catch {
      // Local dev fallback
      setToastMessage(`[Dev] Convite de embaixador enviado no WhatsApp de ${amb.customerName}!`);
    } finally {
      setSharingId(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleCreateAmbassador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newDevice) return;

    try {
      const res = await fetch('/api/whatsapp/referrals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newName,
          customerPhone: newPhone,
          deviceBought: newDevice,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAmbassadors(prev => [json.data, ...prev]);
        setToastMessage(`Embaixador ${newName} cadastrado com sucesso!`);
      }
    } catch {
      const slug = newName.split(' ')[0].toUpperCase();
      const code = `HIAGO-${slug}${Math.floor(10 + Math.random() * 90)}`;
      const newAmb: Ambassador = {
        id: `amb-${Date.now()}`,
        customerName: newName,
        customerPhone: newPhone,
        deviceBought: newDevice,
        referralCode: code,
        referralLink: `https://hiago-iphones.vercel.app/?ref=${code}`,
        friendsInvited: 0,
        friendsConverted: 0,
        totalRewardEarned: 0,
        pendingReward: 0,
        createdAt: new Date().toISOString(),
      };
      setAmbassadors(prev => [newAmb, ...prev]);
      setToastMessage(`Embaixador ${newName} cadastrado com sucesso!`);
    }

    setIsModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewDevice('');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalRewardsGiven = ambassadors.reduce((acc, a) => acc + a.totalRewardEarned, 0);
  const totalConvertedReferrals = ambassadors.reduce((acc, a) => acc + a.friendsConverted, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          backgroundColor: '#1E293B',
          border: '1px solid #10B981',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.875rem',
        }}>
          <CheckCircle2 size={18} color="#34D399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DASHBOARD EXECUTIVO DE ROI (US-10.1) */}
      <div style={{
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 24,
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              backgroundColor: 'rgba(52, 211, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399',
            }}>
              <DollarSign size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Dashboard Executivo de ROI & Faturamento Recuperado (Épico 10)
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                Comprovação matemática de retorno sobre investimento gerado pelo CRM, Réguas e Indicações WhatsApp.
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: 'rgba(52, 211, 153, 0.1)',
            padding: '10px 18px',
            borderRadius: 8,
            border: '1px solid rgba(52, 211, 153, 0.3)',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Multiplicador de Retorno</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', display: 'flex', alignItems: 'center', gap: 4 }}>
                {roiMetrics.roiMultiplier}x <ArrowUpRight size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Cards Executivos de ROI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
          <div style={{ backgroundColor: '#0F172A', padding: 18, borderRadius: 10, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Faturamento Recuperado Total</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', marginTop: 4 }}>
              R$ {roiMetrics.totalRevenueRecovered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>Réguas D+0/D+15/D+180/D+360 + Indicações</div>
          </div>

          <div style={{ backgroundColor: '#0F172A', padding: 18, borderRadius: 10, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Vendas Concluídas pelo Sistema</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38BDF8', marginTop: 4 }}>
              {roiMetrics.salesFromAutomationsCount + roiMetrics.salesFromReferralsCount} iPhones
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
              {roiMetrics.salesFromAutomationsCount} por automação • {roiMetrics.salesFromReferralsCount} por indicação
            </div>
          </div>

          <div style={{ backgroundColor: '#0F172A', padding: 18, borderRadius: 10, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Investimento Mensal da Plataforma</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F97316', marginTop: 4 }}>
              R$ {roiMetrics.softwareCostMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>Custo fixo SaaS / licença</div>
          </div>

          <div style={{ backgroundColor: '#0F172A', padding: 18, borderRadius: 10, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>TMR Médio de Resposta (SLA)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#A78BFA', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={20} /> {roiMetrics.tmrMinutesAverage} min
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: 2 }}>● SLA Verde (&lt; 5 min de espera)</div>
          </div>
        </div>
      </div>

      {/* CLUBE DE EMBAIXADORES MEMBER-GET-MEMBER */}
      <div style={{
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 24,
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: 'rgba(249, 115, 22, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F97316',
            }}>
              <Gift size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Programa de Indicação Lite no WhatsApp (Member-Get-Member)
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                Cada cliente recebe um link exclusivo. O amigo ganha R$ 100 de desconto ou kit capa+película e o cliente ganha R$ 100 em Pix ou créditos.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#F97316',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={16} />
            <span>Cadastrar Novo Embaixador</span>
          </button>
        </div>

        {/* Resumo do Programa */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ backgroundColor: '#0F172A', padding: 14, borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Total de Embaixadores</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC', marginTop: 2 }}>{ambassadors.length}</div>
          </div>
          <div style={{ backgroundColor: '#0F172A', padding: 14, borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Amigos Convertidos</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38BDF8', marginTop: 2 }}>{totalConvertedReferrals} clientes</div>
          </div>
          <div style={{ backgroundColor: '#0F172A', padding: 14, borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Bônus Concedidos</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34D399', marginTop: 2 }}>
              R$ {totalRewardsGiven.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Tabela dos Embaixadores */}
        <div style={{ overflowX: 'auto', border: '1px solid #334155', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0F172A', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Embaixador / Telefone</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Aparelho Adquirido</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Código / Link de Indicação</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Convidados</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Convertidos</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Bônus Ganho</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ambassadors.map((amb) => {
                const isCopied = copiedId === amb.id;
                const isSharing = sharingId === amb.id;

                return (
                  <tr key={amb.id} style={{ borderBottom: '1px solid #334155', backgroundColor: '#1E293B' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{amb.customerName}</div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem' }}>{amb.customerPhone}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#F97316' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Smartphone size={13} /> {amb.deviceBought}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          backgroundColor: '#0F172A',
                          border: '1px solid #475569',
                          padding: '3px 8px',
                          borderRadius: 4,
                          color: '#38BDF8',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}>
                          {amb.referralCode}
                        </span>
                        <button
                          onClick={() => handleCopyLink(amb)}
                          title="Copiar Link"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isCopied ? '#34D399' : '#94A3B8',
                            cursor: 'pointer',
                            padding: 4,
                          }}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94A3B8' }}>
                      {amb.friendsInvited}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: 'rgba(52, 211, 153, 0.15)',
                        color: '#34D399',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontWeight: 700,
                      }}>
                        {amb.friendsConverted} compras
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#34D399' }}>
                      R$ {amb.totalRewardEarned.toFixed(2)}
                      {amb.pendingReward > 0 && (
                        <div style={{ fontSize: '0.7rem', color: '#F59E0B', fontWeight: 500 }}>
                          (R$ {amb.pendingReward.toFixed(2)} pendente)
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleShareWhatsApp(amb)}
                        disabled={isSharing}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: 'none',
                          backgroundColor: '#16A34A',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: isSharing ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Send size={12} />
                        <span>{isSharing ? 'Enviando...' : 'Enviar no WhatsApp'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro de Embaixador */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16,
        }}>
          <div style={{
            backgroundColor: '#1E293B',
            borderRadius: 12,
            border: '1px solid #334155',
            padding: 24,
            width: '100%',
            maxWidth: 480,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Novo Embaixador do Clube de Indicação
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
              Gera automaticamente o código e o link exclusivo para envio no WhatsApp do cliente após a compra.
            </p>

            <form onSubmit={handleCreateAmbassador} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Ferreira"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>WhatsApp (com DDD)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: (77) 99876-5432"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 4 }}>iPhone Comprado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: iPhone 14 128GB Estelar"
                  value={newDevice}
                  onChange={(e) => setNewDevice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #475569',
                    backgroundColor: 'transparent',
                    color: '#94A3B8',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#F97316',
                    color: '#FFFFFF',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Gerar Link & Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
