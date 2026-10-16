import React, { useState, useEffect } from 'react';
import {
  Store,
  Upload,
  Globe,
  CreditCard,
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Save,
} from 'lucide-react';
import type { StoreSettings, CardMachineConfig } from '../../types.js';
import { fetchStoreSettings, updateStoreSettingsApi } from '../../api/erpApi.js';

type SettingsTab = 'store_data' | 'card_machines' | 'terms' | 'customers';

export const StoreSettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('store_data');
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Formulário Dados da Loja
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [uf, setUf] = useState('');
  const [warrantyDays, setWarrantyDays] = useState(90);
  const [isPublicShowcase, setIsPublicShowcase] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  // Termos de Venda e Garantia
  const [termsSale, setTermsSale] = useState('');
  const [termsNew, setTermsNew] = useState('');
  const [termsUsed, setTermsUsed] = useState('');
  const [termsAssistance, setTermsAssistance] = useState('');

  // Maquininhas
  const [machines, setMachines] = useState<CardMachineConfig[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const s = await fetchStoreSettings();
      setSettings(s);
      setStoreName(s.storeName);
      setSlug(s.slug);
      setCnpjCpf(s.cnpjCpf || '');
      setPhone(s.phone || '');
      setWhatsapp(s.whatsapp || '');
      setInstagram(s.instagram || '');
      setCep(s.cep || '');
      setStreet(s.street || '');
      setNumber(s.number || '');
      setComplement(s.complement || '');
      setNeighborhood(s.neighborhood || '');
      setCity(s.city || '');
      setUf(s.uf || '');
      setWarrantyDays(s.warrantyReservationDays || 90);
      setIsPublicShowcase(s.isShowcaseActive);
      setLogoUrl(s.logoUrl || '');
      setTermsSale(s.termsSale || '');
      setTermsNew(s.termsWarrantyNew || '');
      setTermsUsed(s.termsWarrantyUsed || '');
      setTermsAssistance(s.termsAssistance || '');
      setMachines(s.cardMachines || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStoreData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const updated = await updateStoreSettingsApi({
      storeName,
      slug,
      cnpjCpf,
      phone,
      whatsapp,
      instagram,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      uf,
      warrantyReservationDays: Number(warrantyDays),
      isShowcaseActive: isPublicShowcase,
      logoUrl,
      termsSale,
      termsWarrantyNew: termsNew,
      termsWarrantyUsed: termsUsed,
      termsAssistance,
      cardMachines: machines,
    });

    setSettings(updated);
    setSuccessMsg('Configurações da loja salvas com sucesso no banco de dados!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
        Carregando configurações da loja...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* CABEÇALHO */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          ADMINISTRAÇÃO
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
          Configurações
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
          Edite os dados usados em vendas, comprovantes, garantias e vitrine.
        </p>
      </div>

      {/* TABS CONFORME IMAGEM 1 */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { id: 'store_data', label: 'Dados da loja', icon: Store },
          { id: 'card_machines', label: 'Maquininhas e taxas', icon: CreditCard },
          { id: 'terms', label: 'Termos de venda', icon: FileText },
          { id: 'customers', label: 'Clientes', icon: Users },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as SettingsTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#f97316' : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#fff' : '#94a3b8',
                boxShadow: isActive ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {successMsg && (
        <div style={{ padding: '12px 18px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, color: '#10b981', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ABA 1: DADOS DA LOJA (EXATAMENTE COMO NA IMAGEM 1) */}
      {activeTab === 'store_data' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(280px, 1fr)', gap: 24, alignItems: 'start' }}>
          {/* COLUNA ESQUERDA: FORMULÁRIO PRINCIPAL */}
          <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                <Store size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>Dados da loja</h3>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Altere a identificação exibida no sistema e nos comprovantes.</p>
              </div>
            </div>

            <form onSubmit={handleSaveStoreData} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* LOGOMARCA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 18, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10 }}>
                <div style={{ width: 72, height: 72, borderRadius: 12, background: '#131b2e', border: '1px dashed rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Store size={28} color="#64748b" />
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>Logomarca da loja</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                    Essa imagem aparece no cabeçalho do sistema. Use PNG ou JPG, preferencialmente em formato quadrado.
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '7px 14px', background: '#f97316', color: '#fff', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    <Upload size={13} />
                    <span>Enviar logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* NOME E SLUG */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Nome da loja</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Link público (slug da vitrine)</label>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 4, background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, overflow: 'hidden' }}>
                    <span style={{ padding: '10px 12px', background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8', fontSize: '0.8rem', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>/loja/</span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* CPF / CNPJ E TELEFONE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>CPF/CNPJ da conta (opcional)</label>
                  <input
                    type="text"
                    placeholder="CNPJ ou CPF"
                    value={cnpjCpf}
                    onChange={e => setCnpjCpf(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>
                    Ao informar um CNPJ válido, os dados públicos da empresa serão preenchidos.
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Telefone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* WHATSAPP E INSTAGRAM */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Instagram</label>
                  <input
                    type="text"
                    placeholder="@sualoja"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* ENDEREÇO: CEP E RUA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>CEP</label>
                  <input
                    type="text"
                    value={cep}
                    onChange={e => setCep(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Rua / Avenida</label>
                  <input
                    type="text"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* NÚMERO E COMPLEMENTO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Número</label>
                  <input
                    type="text"
                    value={number}
                    onChange={e => setNumber(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Complemento</label>
                  <input
                    type="text"
                    placeholder="Sala, bloco, referência"
                    value={complement}
                    onChange={e => setComplement(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* BAIRRO, CIDADE E UF */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Bairro</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={e => setNeighborhood(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Cidade</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>UF</label>
                  <input
                    type="text"
                    value={uf}
                    maxLength={2}
                    onChange={e => setUf(e.target.value.toUpperCase())}
                    style={{ width: '100%', marginTop: 4, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5 }}>
                Fuso da loja: <strong>America/Manaus</strong>. O ponto e os horários operacionais seguem a cidade e a UF salvas.
              </div>

              {/* PRAZO DE GARANTIA E VITRINE ATIVA */}
              <div style={{ padding: 18, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Prazo de reserva da garantia (dias)</label>
                  <input
                    type="number"
                    value={warrantyDays}
                    onChange={e => setWarrantyDays(Number(e.target.value))}
                    style={{ display: 'block', marginTop: 4, width: 140, padding: '8px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    id="vitrineAtiva"
                    checked={isPublicShowcase}
                    onChange={e => setIsPublicShowcase(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#f97316', cursor: 'pointer' }}
                  />
                  <label htmlFor="vitrineAtiva" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', cursor: 'pointer' }}>
                    Vitrine pública ativa
                  </label>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                  marginTop: 6,
                }}
              >
                <Save size={16} />
                <span>Salvar configurações</span>
              </button>
            </form>
          </div>

          {/* COLUNA DIREITA: CARDS RESUMO (CONFORME IMAGEM 1) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* CARD USUÁRIO */}
            <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', marginBottom: 12 }}>
                <Users size={16} color="#f97316" />
                <span>Usuário</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 14 }}>Acesso conectado pelo login atual.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.75rem' }}>
                <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6 }}>
                  <div style={{ color: '#64748b', fontSize: '0.68rem' }}>NOME</div>
                  <div style={{ color: '#f8fafc', fontWeight: 700 }}>Robson Oliveira Macedo</div>
                </div>

                <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6 }}>
                  <div style={{ color: '#64748b', fontSize: '0.68rem' }}>EMAIL</div>
                  <div style={{ color: '#f8fafc', fontWeight: 700 }}>vendasdigital2011@gmail.com</div>
                </div>

                <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6 }}>
                  <div style={{ color: '#64748b', fontSize: '0.68rem' }}>PERFIL</div>
                  <div style={{ color: '#f97316', fontWeight: 800 }}>Dono</div>
                </div>

                <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6 }}>
                  <div style={{ color: '#64748b', fontSize: '0.68rem' }}>CONTA GOOGLE</div>
                  <div style={{ color: '#f8fafc', fontWeight: 700 }}>vendasdigital2011@gmail.com</div>
                </div>
              </div>
            </div>

            {/* CARD TERMOS DE VENDA */}
            <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
                <ShieldCheck size={16} color="#f97316" />
                <span>Termos de venda</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Prazos e termos impressos nos comprovantes.</p>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: 14 }}>
                Garantia por tipo e item
              </h4>

              <button
                onClick={() => setActiveTab('terms')}
                style={{
                  width: '100%',
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <ShieldCheck size={14} />
                <span>Personalizar termos e comprovante</span>
              </button>
            </div>

            {/* CARD VITRINE */}
            <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
                <Globe size={16} color="#f97316" />
                <span>Vitrine</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Status da vitrine pública.</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: isPublicShowcase ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: isPublicShowcase ? '#10b981' : '#94a3b8',
                  fontWeight: 700,
                }}>
                  {isPublicShowcase ? 'Ativa' : 'Desativada'}
                </span>

                <button
                  onClick={() => window.open(`/loja/${slug}`, '_blank')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Abrir vitrine</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: MAQUININHAS E TAXAS */}
      {activeTab === 'card_machines' && (
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
            Maquininhas, Adquirentes & Taxas de Parcelamento
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 20 }}>
            Configure as adquirentes ativas (Stone, Cielo, PagBank, InfinitePay) para cálculo do parcelamento no balcão e prazos de liquidação.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {machines.map((m) => (
              <div key={m.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>{m.name}</div>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                    {m.acquirer} • D+{m.payoutDays}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                  <div style={{ padding: 10, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Taxa Débito</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>{m.debitFee}%</div>
                  </div>
                  <div style={{ padding: 10, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Crédito à Vista</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>{m.creditCashFee}%</div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, marginBottom: 6 }}>Faixas de Parcelamento:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(m.installmentFees).map(([parcel, fee]) => (
                      <span key={parcel} style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, color: '#94a3b8' }}>
                        {parcel}x: <strong style={{ color: '#f8fafc' }}>{fee}%</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: TERMOS DE VENDA E GARANTIA */}
      {activeTab === 'terms' && (
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
            Termos de Venda, Comprovantes e Políticas de Garantia
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 20 }}>
            Personalize os textos jurídicos impressos nos recibos do balcão e ordens de serviço.
          </p>

          <form onSubmit={handleSaveStoreData} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Termo Geral de Venda e Comprovante de Pagamento</label>
              <textarea
                rows={3}
                value={termsSale}
                onChange={e => setTermsSale(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Garantia para Aparelhos Novos Lacrados (Apple 1 Ano)</label>
              <textarea
                rows={2}
                value={termsNew}
                onChange={e => setTermsNew(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Garantia para Aparelhos Seminovos / Revisados da Loja (CDC 90 Dias)</label>
              <textarea
                rows={2}
                value={termsUsed}
                onChange={e => setTermsUsed(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Termo de Garantia de Assistência Técnica & Peças</label>
              <textarea
                rows={2}
                value={termsAssistance}
                onChange={e => setTermsAssistance(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, color: '#fff', fontSize: '0.82rem' }}
              />
            </div>

            <button
              type="submit"
              style={{
                alignSelf: 'flex-start',
                padding: '10px 22px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Salvar Termos de Garantia
            </button>
          </form>
        </div>
      )}

      {/* ABA 4: CLIENTES (REDIRECIONAMENTO / LINK RÁPIDO) */}
      {activeTab === 'customers' && (
        <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <Users size={32} color="#f97316" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>Gestão de Base de Clientes</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: 450, margin: '8px auto 16px' }}>
            A base unificada de clientes está disponível diretamente pelo menu lateral "Clientes", com histórico de compras, garantias e pós-venda.
          </p>
        </div>
      )}
    </div>
  );
};
