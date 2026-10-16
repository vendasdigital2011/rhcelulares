import React, { useState } from 'react';
import {
  X,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  DollarSign,
  Tag,
  AlertCircle,
  Calendar,
  Save,
} from 'lucide-react';
import type { Lead, LeadStage, LeadOrigin, LeadPriority, BusinessType } from '../../types.js';
import { checkLeadDuplicatesApi } from '../../api/erpApi.js';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Partial<Lead>) => Promise<void>;
  initialData?: Lead | null;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState<'identificacao' | 'qualificacao' | 'prospeccao'>('identificacao');

  // Identificação
  const [contactName, setContactName] = useState(initialData?.contactName || '');
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [city, setCity] = useState(initialData?.city || 'Manaus');
  const [state, setState] = useState(initialData?.state || 'AM');
  const [website, setWebsite] = useState(initialData?.website || '');

  // Qualificação
  const [businessType, setBusinessType] = useState<BusinessType>(initialData?.businessType || 'consumidor_final');
  const [commercialInterest, setCommercialInterest] = useState(initialData?.commercialInterest || '');
  const [potentialValue, setPotentialValue] = useState(initialData?.potentialValue ? String(initialData.potentialValue) : '');
  const [priority, setPriority] = useState<LeadPriority>(initialData?.priority || 'media');
  const [stage, setStage] = useState<LeadStage>(initialData?.stage || 'novo_lead');
  const [assignedUserName, setAssignedUserName] = useState(initialData?.assignedUserName || 'Robson Oliveira');

  // Prospecção
  const [origin, setOrigin] = useState<LeadOrigin>(initialData?.origin || 'pesquisa_manual');
  const [entryDate, setEntryDate] = useState(initialData?.entryDate || new Date().toISOString().split('T')[0]);
  const [nextAction, setNextAction] = useState(initialData?.nextAction || '');
  const [nextReturnDate, setNextReturnDate] = useState(initialData?.nextReturnDate ? initialData.nextReturnDate.split('T')[0] : '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Validação & Duplicidade
  const [errorMsg, setErrorMsg] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePhoneBlur = async () => {
    if (phone.trim().length >= 8) {
      const res = await checkLeadDuplicatesApi(phone, email, initialData?.id);
      if (res.isDuplicate) {
        setDuplicateWarning(
          `Atenção: Já existe outro lead cadastrado com este telefone/e-mail (${res.matches[0].contactName} - ${res.matches[0].stage}).`
        );
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!contactName.trim()) {
      setErrorMsg('O nome do contato é obrigatório.');
      setActiveTab('identificacao');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('O telefone do contato é obrigatório.');
      setActiveTab('identificacao');
      return;
    }

    if (!commercialInterest.trim()) {
      setErrorMsg('Informe o interesse comercial (ex: modelo de aparelho ou lote).');
      setActiveTab('qualificacao');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        contactName: contactName.trim(),
        companyName: companyName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: city.trim() || 'Manaus',
        state: state.trim() || 'AM',
        website: website.trim() || undefined,
        businessType,
        commercialInterest: commercialInterest.trim(),
        potentialValue: potentialValue ? parseFloat(potentialValue) : 0,
        priority,
        stage,
        assignedUserName,
        origin,
        entryDate,
        nextAction: nextAction.trim() || undefined,
        nextReturnDate: nextReturnDate ? `${nextReturnDate}T12:00:00Z` : undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16,
    }}>
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 14,
        width: '100%',
        maxWidth: 720,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
      }}>
        {/* CABEÇALHO MODAL */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.015)',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              PROSPECÇÃO COMERCIAL
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
              {initialData ? 'Editar Lead Comercial' : 'Novo Lead / Oportunidade'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ABAS */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(0, 0, 0, 0.15)' }}>
          {[
            { id: 'identificacao', label: '1. Identificação' },
            { id: 'qualificacao', label: '2. Qualificação' },
            { id: 'prospeccao', label: '3. Prospecção & Retorno' },
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: active ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid #f97316' : '2px solid transparent',
                  color: active ? '#f97316' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errorMsg && (
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {duplicateWarning && (
            <div style={{ padding: '10px 14px', background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 8, color: '#eab308', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* TAB 1: IDENTIFICAÇÃO */}
          {activeTab === 'identificacao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Nome do Contato *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#64748b' }} />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Silva"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      style={{ width: '100%', padding: '9px 10px 9px 34px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Nome da Empresa / Loja
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="Ex: Silva Smartphones"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      style={{ width: '100%', padding: '9px 10px 9px 34px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Telefone / WhatsApp *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#64748b' }} />
                    <input
                      type="text"
                      required
                      placeholder="92999990000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onBlur={handlePhoneBlur}
                      style={{ width: '100%', padding: '9px 10px 9px 34px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    E-mail do Lead
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#64748b' }} />
                    <input
                      type="email"
                      placeholder="carlos@empresa.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '9px 10px 9px 34px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Cidade
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="Manaus"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      style={{ width: '100%', padding: '9px 10px 9px 34px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    UF
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="AM"
                    value={state}
                    onChange={e => setState(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '9px 10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem', textAlign: 'center' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Site ou Perfil Público
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Globe size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="@instagram ou site"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      style={{ width: '100%', padding: '9px 10px 9px 34px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUALIFICAÇÃO */}
          {activeTab === 'qualificacao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Tipo de Negócio / Perfil
                  </label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value as BusinessType)}
                    style={{ width: '100%', padding: '9px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                  >
                    <option value="consumidor_final">Consumidor Final (Pessoa Física)</option>
                    <option value="b2b">B2B (Empresa / Corporativo)</option>
                    <option value="revenda">Lojista / Revendedor</option>
                    <option value="assistencia">Técnico / Assistência</option>
                    <option value="outro">Outro Perfil</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Potencial Estimado da Venda (R$)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#10b981' }} />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={potentialValue}
                      onChange={e => setPotentialValue(e.target.value)}
                      style={{ width: '100%', padding: '9px 10px 9px 34px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                  Interesse Comercial * (Modelo ou Demanda)
                </label>
                <div style={{ position: 'relative' }}>
                  <Tag size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#64748b' }} />
                  <input
                    type="text"
                    required
                    placeholder="Ex: iPhone 15 Pro 128GB ou Lote de Películas 3D"
                    value={commercialInterest}
                    onChange={e => setCommercialInterest(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px 9px 34px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as LeadPriority)}
                    style={{ width: '100%', padding: '9px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente 🔥</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Etapa Inicial no Funil
                  </label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as LeadStage)}
                    style={{ width: '100%', padding: '9px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                  >
                    <option value="novo_lead">1. Novo lead</option>
                    <option value="qualificacao">2. Qualificação</option>
                    <option value="primeiro_contato">3. Primeiro contato</option>
                    <option value="em_negociacao">4. Em negociação</option>
                    <option value="aguardando_retorno">5. Aguardando retorno</option>
                    <option value="convertido">6. Convertido</option>
                    <option value="perdido">7. Perdido</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Vendedor Responsável
                  </label>
                  <input
                    type="text"
                    value={assignedUserName}
                    onChange={e => setAssignedUserName(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROSPECÇÃO & RETORNO */}
          {activeTab === 'prospeccao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Origem do Lead
                  </label>
                  <select
                    value={origin}
                    onChange={e => setOrigin(e.target.value as LeadOrigin)}
                    style={{ width: '100%', padding: '9px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                  >
                    <option value="pesquisa_manual">Pesquisa comercial manual</option>
                    <option value="indicacao">Indicação de cliente</option>
                    <option value="formulario">Formulário / Landing Page</option>
                    <option value="importacao">Importação de base</option>
                    <option value="evento">Evento / Feirão</option>
                    <option value="fonte_autorizada">Fonte comercial autorizada</option>
                    <option value="outros">Outros canais</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Data de Entrada
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Próxima Ação Planejada
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ligar para apresentar simulação de troca"
                    value={nextAction}
                    onChange={e => setNextAction(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Data Prevista de Retorno
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#f97316' }} />
                    <input
                      type="date"
                      value={nextReturnDate}
                      onChange={e => setNextReturnDate(e.target.value)}
                      style={{ width: '100%', padding: '9px 10px 9px 34px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                  Observações Comerciais
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes sobre forma de pagamento pretendida, aparelhos usados para troca, exigências do cliente..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem', resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* RODAPÉ DO FORMULÁRIO */}
          <div style={{
            marginTop: 10,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: '#f97316',
                border: 'none',
                color: '#fff',
                padding: '9px 24px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
