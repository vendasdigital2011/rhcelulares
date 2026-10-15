import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Printer, 
  Send, 
  FileText, 
  X, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import type { WarrantyEntry, WarrantyClaim, ServiceOrder, WarrantyType } from '../../types.js';

interface WarrantyProps {
  warranties: WarrantyEntry[];
  claims: WarrantyClaim[];
  serviceOrders: ServiceOrder[];
  onCreateClaim: (claim: Omit<WarrantyClaim, 'id' | 'createdAt'>) => Promise<any>;
  onUpdateClaim?: (id: string, updates: Partial<WarrantyClaim>) => Promise<any>;
  onNavigateToOS?: (osNumber: string) => void;
}

export const WarrantyManagementView: React.FC<WarrantyProps> = ({
  warranties,
  claims,
  serviceOrders,
  onCreateClaim,
  onNavigateToOS,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring_soon' | 'expired' | 'claimed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | WarrantyType>('all');
  
  // Modais
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyEntry | null>(null);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [targetWarrantyForClaim, setTargetWarrantyForClaim] = useState<WarrantyEntry | null>(null);

  // Form de Atendimento em Garantia (Retorno do Cliente)
  const [claimReportedDefect, setClaimReportedDefect] = useState('');
  const [claimEntryCondition, setClaimEntryCondition] = useState('Aparelho sem trincas, selos intactos.');
  const [claimTechnicalAssessment, setClaimTechnicalAssessment] = useState('');
  const [claimDecision, setClaimDecision] = useState<'analyzing' | 'approved' | 'rejected'>('analyzing');
  const [claimDecisionReason, setClaimDecisionReason] = useState('');

  const filteredWarranties = useMemo(() => {
    return warranties.filter(w => {
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;
      if (typeFilter !== 'all' && w.warrantyType !== typeFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchNum = w.warrantyNumber.toLowerCase().includes(query);
        const matchOS = (w.osNumber || '').toLowerCase().includes(query);
        const matchCust = w.customerName.toLowerCase().includes(query);
        const matchPhone = w.customerPhone.replace(/\D/g, '').includes(query.replace(/\D/g, ''));
        const matchImei = (w.imei || '').includes(query);
        const matchModel = w.deviceModel.toLowerCase().includes(query);
        return matchNum || matchOS || matchCust || matchPhone || matchImei || matchModel;
      }
      return true;
    });
  }, [warranties, statusFilter, typeFilter, searchTerm]);

  // Contadores
  const counts = useMemo(() => {
    return {
      total: warranties.length,
      active: warranties.filter(w => w.status === 'active').length,
      expiring: warranties.filter(w => w.status === 'expiring_soon').length,
      expired: warranties.filter(w => w.status === 'expired').length,
      claimed: warranties.filter(w => w.status === 'claimed').length,
    };
  }, [warranties]);

  const handleOpenClaimModal = (warranty: WarrantyEntry) => {
    setTargetWarrantyForClaim(warranty);
    setClaimReportedDefect('');
    setClaimEntryCondition('Aparelho em bom estado, sem sinais de queda ou umidade.');
    setClaimTechnicalAssessment('');
    setClaimDecision('analyzing');
    setClaimDecisionReason('');
    setIsClaimModalOpen(true);
  };

  const handleSaveClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWarrantyForClaim) return;

    const claimCount = claims.length + 1;
    const claimNumber = `RET-2026-${String(claimCount).padStart(3, '0')}`;
    const newOsNumber = claimDecision === 'approved' ? `OS-${1030 + serviceOrders.length}` : undefined;

    await onCreateClaim({
      claimNumber,
      warrantyId: targetWarrantyForClaim.id,
      warrantyNumber: targetWarrantyForClaim.warrantyNumber,
      originalOsNumber: targetWarrantyForClaim.osNumber,
      newOsNumber,
      customerName: targetWarrantyForClaim.customerName,
      customerPhone: targetWarrantyForClaim.customerPhone,
      deviceModel: targetWarrantyForClaim.deviceModel,
      imei: targetWarrantyForClaim.imei,
      reportedDefect: claimReportedDefect,
      entryCondition: claimEntryCondition,
      technicalAssessment: claimTechnicalAssessment,
      decision: claimDecision,
      decisionReason: claimDecisionReason,
      isCovered: claimDecision === 'approved',
      createdBy: 'André Técnico',
    });

    setIsClaimModalOpen(false);
  };

  const handleSendWarrantyWhatsApp = (w: WarrantyEntry) => {
    const text = encodeURIComponent(
      `🛡️ *CERTIFICADO DE GARANTIA - HIAGO IPHONES* 🛡️\n\n` +
      `Olá *${w.customerName}*!\n` +
      `Segue a confirmação da garantia referente à sua manutenção:\n\n` +
      `📜 *Termo de Garantia:* ${w.warrantyNumber}\n` +
      `🔧 *Ordem de Serviço de Origem:* ${w.osNumber || 'Balcão'}\n` +
      `📱 *Aparelho:* ${w.deviceModel}\n` +
      `🔢 *IMEI:* ${w.imei || 'Registrado'}\n` +
      `⚙️ *Serviço Coberto:* ${w.serviceName || 'Manutenção Especializada'}\n` +
      `📅 *Início:* ${w.startDate} • *Vencimento:* ${w.endDate} (${w.warrantyDays} dias)\n\n` +
      `*Condições Gerais de Cobertura:*\n` +
      `- Cobertura para defeitos funcionais de peças substituídas e mão de obra.\n` +
      `- Excluem-se: telas/vidros trincados por impacto, danos por líquidos e umidade, ou violação do selo de bancada.\n\n` +
      `Agradecemos pela confiança na Hiago iPhones!`
    );
    window.open(`https://wa.me/${w.customerPhone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1440, margin: '0 auto' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ASSISTÊNCIA TÉCNICA & PÓS-VENDA
            </span>
            <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
              Controle Legal CDC Art. 26
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
            Gestão de Garantias & Retornos
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Acompanhe prazos de garantia emitidos por OS, receba retornos de clientes e avalie cobertura técnica fundamentada.
          </p>
        </div>
      </div>

      {/* STRIP DE INDICADORES DE GARANTIA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div 
          onClick={() => setStatusFilter('all')}
          style={{ 
            background: statusFilter === 'all' ? '#151b2b' : '#0d121f', 
            border: `1px solid ${statusFilter === 'all' ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)'}`, 
            borderRadius: 10, 
            padding: 14, 
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Todas Emitidas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', marginTop: 2 }}>{counts.total}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('active')}
          style={{ 
            background: statusFilter === 'active' ? 'rgba(16, 185, 129, 0.1)' : '#0d121f', 
            border: `1px solid ${statusFilter === 'active' ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`, 
            borderRadius: 10, 
            padding: 14, 
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Garantias Ativas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', marginTop: 2 }}>{counts.active}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('expiring_soon')}
          style={{ 
            background: statusFilter === 'expiring_soon' ? 'rgba(245, 158, 11, 0.1)' : '#0d121f', 
            border: `1px solid ${statusFilter === 'expiring_soon' ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)'}`, 
            borderRadius: 10, 
            padding: 14, 
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>Vence em até 15 dias</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', marginTop: 2 }}>{counts.expiring}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('expired')}
          style={{ 
            background: statusFilter === 'expired' ? 'rgba(148, 163, 184, 0.1)' : '#0d121f', 
            border: `1px solid ${statusFilter === 'expired' ? '#94a3b8' : 'rgba(255, 255, 255, 0.08)'}`, 
            borderRadius: 10, 
            padding: 14, 
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Expiradas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#94a3b8', marginTop: 2 }}>{counts.expired}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('claimed')}
          style={{ 
            background: statusFilter === 'claimed' ? 'rgba(239, 68, 68, 0.1)' : '#0d121f', 
            border: `1px solid ${statusFilter === 'claimed' ? '#ef4444' : 'rgba(255, 255, 255, 0.08)'}`, 
            borderRadius: 10, 
            padding: 14, 
            cursor: 'pointer' 
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>Atendidas / Reclamadas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444', marginTop: 2 }}>{counts.claimed}</div>
        </div>
      </div>

      {/* BARRA DE PESQUISA & FILTRO DE MODALIDADE */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: 12 }} />
          <input
            type="text"
            placeholder="Pesquisar por nº da garantia, OS original, cliente, telefone ou IMEI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: '#0d121f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '10px 14px 10px 40px',
              borderRadius: 8,
              color: '#f8fafc',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          style={{
            background: '#0d121f',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '10px 14px',
            borderRadius: 8,
            color: '#f8fafc',
            fontSize: '0.85rem',
          }}
        >
          <option value="all">Todas as Modalidades</option>
          <option value="service">Garantia de Serviço (Mão de Obra)</option>
          <option value="part">Garantia de Peça</option>
          <option value="legal">Garantia Legal CDC</option>
          <option value="commercial">Garantia Comercial Loja</option>
          <option value="supplier">Garantia de Fornecedor</option>
        </select>
      </div>

      {/* TABELA DE GARANTIAS */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Certificado</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>OS Origem</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Cliente / Contato</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Aparelho / IMEI</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Cobertura</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Vigência</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Situação</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredWarranties.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
                  Nenhuma garantia encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredWarranties.map(w => {
                let badgeBg = 'rgba(16, 185, 129, 0.15)';
                let badgeColor = '#10b981';
                let badgeText = 'Ativa';

                if (w.status === 'expiring_soon') {
                  badgeBg = 'rgba(245, 158, 11, 0.15)';
                  badgeColor = '#f59e0b';
                  badgeText = 'Vence em Breve';
                } else if (w.status === 'expired') {
                  badgeBg = 'rgba(148, 163, 184, 0.15)';
                  badgeColor = '#94a3b8';
                  badgeText = 'Expirada';
                } else if (w.status === 'claimed') {
                  badgeBg = 'rgba(239, 68, 68, 0.15)';
                  badgeColor = '#ef4444';
                  badgeText = 'Reclamada';
                }

                return (
                  <tr key={w.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981' }}>
                        {w.warrantyNumber}
                      </span>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {w.warrantyType === 'service' ? 'Mão de Obra' : w.warrantyType === 'part' ? 'Peça Instalada' : 'Legal CDC'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      {w.osNumber ? (
                        <button
                          onClick={() => onNavigateToOS && onNavigateToOS(w.osNumber!)}
                          style={{
                            background: 'rgba(249, 115, 22, 0.1)',
                            border: '1px solid rgba(249, 115, 22, 0.25)',
                            color: '#f97316',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span>{w.osNumber}</span>
                          <ExternalLink size={11} />
                        </button>
                      ) : (
                        <span style={{ color: '#64748b' }}>Balcão Venda</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{w.customerName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{w.customerPhone}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600 }}>{w.deviceModel}</div>
                      {w.imei && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                          IMEI: {w.imei}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', maxWidth: 220 }}>
                        {w.serviceName || 'Manutenção Geral'}
                      </div>
                      {w.partsCovered && w.partsCovered.length > 0 && (
                        <div style={{ fontSize: '0.68rem', color: '#f97316', marginTop: 2 }}>
                          {w.partsCovered.length} peça(s) coberta(s)
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>Até {w.endDate}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>({w.warrantyDays} dias totais)</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          background: badgeBg,
                          color: badgeColor,
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {badgeText}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        {/* Atendimento / Retorno em Garantia */}
                        <button
                          onClick={() => handleOpenClaimModal(w)}
                          title="Registrar Retorno de Cliente em Garantia"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#ef4444',
                            padding: '6px 10px',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <RotateCcw size={12} />
                          <span>Retorno</span>
                        </button>

                        {/* WhatsApp */}
                        <button
                          onClick={() => handleSendWarrantyWhatsApp(w)}
                          title="Enviar Termo no WhatsApp"
                          style={{
                            background: '#25d366',
                            border: 'none',
                            color: '#fff',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <Send size={13} />
                        </button>

                        {/* Ver Termo */}
                        <button
                          onClick={() => {
                            setSelectedWarranty(w);
                            setIsTermModalOpen(true);
                          }}
                          title="Visualizar Termo de Garantia"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <FileText size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* SEÇÃO: HISTÓRICO DE ATENDIMENTOS DE RETORNO / RECLAMAÇÕES */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px' }}>
          Atendimentos de Retorno Registrados ({claims.length})
        </h3>
        {claims.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.8rem', padding: '12px 0' }}>
            Nenhum retorno ou contestação de garantia registrado no momento.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {claims.map(claim => (
              <div
                key={claim.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '12px 16px',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ef4444' }}>{claim.claimNumber}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Garantia: {claim.warrantyNumber}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>{claim.customerName}</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: 4 }}>
                    <strong>Relato:</strong> {claim.reportedDefect}
                  </div>
                  {claim.technicalAssessment && (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                      <strong>Parecer Técnico:</strong> {claim.technicalAssessment}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: claim.decision === 'approved' ? 'rgba(16, 185, 129, 0.15)' : claim.decision === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: claim.decision === 'approved' ? '#10b981' : claim.decision === 'rejected' ? '#ef4444' : '#f59e0b',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {claim.decision === 'approved' ? 'Cobertura Aprovada' : claim.decision === 'rejected' ? 'Recusada (Mau Uso)' : 'Em Análise Técnica'}
                  </span>
                  {claim.newOsNumber && (
                    <div style={{ fontSize: '0.72rem', color: '#f97316', fontWeight: 700, marginTop: 4 }}>
                      Nova OS: {claim.newOsNumber}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: REGISTRAR ATENDIMENTO EM GARANTIA (RETORNO) */}
      {isClaimModalOpen && targetWarrantyForClaim && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#0d121f',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 14,
              width: '100%',
              maxWidth: 600,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Registrar Retorno de Cliente em Garantia
                </h2>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                  Garantia {targetWarrantyForClaim.warrantyNumber} • OS {targetWarrantyForClaim.osNumber}
                </div>
              </div>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveClaim} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 8, fontSize: '0.8rem' }}>
                <div><strong>Cliente:</strong> {targetWarrantyForClaim.customerName} ({targetWarrantyForClaim.customerPhone})</div>
                <div><strong>Aparelho:</strong> {targetWarrantyForClaim.deviceModel} • IMEI: {targetWarrantyForClaim.imei || 'N/A'}</div>
                <div><strong>Serviço Original:</strong> {targetWarrantyForClaim.serviceName}</div>
                <div><strong>Vigência:</strong> {targetWarrantyForClaim.startDate} até {targetWarrantyForClaim.endDate}</div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Defeito Relatado pelo Cliente *
                </label>
                <textarea
                  rows={2}
                  required
                  value={claimReportedDefect}
                  onChange={(e) => setClaimReportedDefect(e.target.value)}
                  placeholder="Ex: Touch da tela travando após 2 semanas de uso..."
                  style={{
                    width: '100%',
                    background: '#151b2b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#f8fafc',
                    fontSize: '0.82rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Condições Físicas de Entrada
                </label>
                <input
                  type="text"
                  value={claimEntryCondition}
                  onChange={(e) => setClaimEntryCondition(e.target.value)}
                  placeholder="Aparelho íntegro, sem sinais de queda, lacres preservados..."
                  style={{
                    width: '100%',
                    background: '#151b2b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#f8fafc',
                    fontSize: '0.82rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Parecer Técnico Inicial
                </label>
                <textarea
                  rows={2}
                  value={claimTechnicalAssessment}
                  onChange={(e) => setClaimTechnicalAssessment(e.target.value)}
                  placeholder="Resultado da verificação do técnico na bancada..."
                  style={{
                    width: '100%',
                    background: '#151b2b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#f8fafc',
                    fontSize: '0.82rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Decisão de Cobertura
                  </label>
                  <select
                    value={claimDecision}
                    onChange={(e) => setClaimDecision(e.target.value as any)}
                    style={{
                      width: '100%',
                      background: '#151b2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      color: '#f8fafc',
                      fontSize: '0.82rem',
                    }}
                  >
                    <option value="analyzing">Em Análise Técnica</option>
                    <option value="approved">Aprovada (Gera Nova OS Vinculada)</option>
                    <option value="rejected">Recusada (Mau Uso / Dano Físico)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Justificativa / Motivo
                  </label>
                  <input
                    type="text"
                    value={claimDecisionReason}
                    onChange={(e) => setClaimDecisionReason(e.target.value)}
                    placeholder="Ex: Falha no lote do touch / Queda comprovada com vidro quebrado"
                    style={{
                      width: '100%',
                      background: '#151b2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      color: '#f8fafc',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 20px',
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirmar Retorno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZAR & IMPRIMIR TERMO DE GARANTIA COMPLETO */}
      {isTermModalOpen && selectedWarranty && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 14,
              width: '100%',
              maxWidth: 700,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                  Certificado & Termo de Garantia CDC
                </h2>
                <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700, marginTop: 2 }}>
                  {selectedWarranty.warrantyNumber} • Validade até {selectedWarranty.endDate}
                </div>
              </div>
              <button
                onClick={() => setIsTermModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* DOCUMENTO IMPRESSO ESTILIZADO */}
            <div
              style={{
                background: '#fff',
                color: '#0f172a',
                padding: 24,
                borderRadius: 8,
                fontSize: '0.8rem',
                lineHeight: 1.5,
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 10, marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>HIAGO iPHONES ASSISTÊNCIA ESPECIALIZADA</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#475569' }}>
                  CNPJ: 00.000.000/0001-00 • Matriz Centro • Tel/WhatsApp: (77) 99933-4455
                </p>
                <div style={{ marginTop: 6, fontWeight: 800, fontSize: '0.85rem' }}>
                  CERTIFICADO DE GARANTIA Nº {selectedWarranty.warrantyNumber}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14, background: '#f8fafc', padding: 10, borderRadius: 6 }}>
                <div><strong>Cliente:</strong> {selectedWarranty.customerName}</div>
                <div><strong>Telefone:</strong> {selectedWarranty.customerPhone}</div>
                <div><strong>Aparelho:</strong> {selectedWarranty.deviceModel}</div>
                <div><strong>IMEI:</strong> {selectedWarranty.imei || 'Não informado'}</div>
                <div><strong>OS de Origem:</strong> {selectedWarranty.osNumber || 'N/A'}</div>
                <div><strong>Prazo Concedido:</strong> {selectedWarranty.warrantyDays} dias</div>
                <div><strong>Data Início:</strong> {selectedWarranty.startDate}</div>
                <div><strong>Data Término:</strong> {selectedWarranty.endDate}</div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>Serviço Coberto:</strong>
                <p style={{ margin: '2px 0 6px', color: '#334155' }}>{selectedWarranty.serviceName}</p>
                {selectedWarranty.partsCovered && selectedWarranty.partsCovered.length > 0 && (
                  <div>
                    <strong>Peças Inclusas:</strong> {selectedWarranty.partsCovered.join(', ')}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 10, fontSize: '0.72rem', color: '#334155' }}>
                <strong style={{ display: 'block', marginBottom: 4 }}>CLÁUSULAS E CONDIÇÕES DE GARANTIA (CDC ART. 26):</strong>
                <p style={{ margin: 0 }}>{selectedWarranty.terms}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 30, textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: 6, fontSize: '0.7rem' }}>
                  Assinatura do Técnico / Loja
                </div>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: 6, fontSize: '0.7rem' }}>
                  Assinatura do Cliente
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => window.print()}
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: 6,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Printer size={16} />
                Imprimir Certificado
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
