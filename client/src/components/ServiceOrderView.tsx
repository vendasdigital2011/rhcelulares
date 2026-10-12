import { useState } from 'react';
import { Check, Plus, Search, Send, X } from 'lucide-react';
import type { ServiceOrder } from '../types.js';

interface ServiceOrderViewProps {
  serviceOrders: ServiceOrder[];
  onAddServiceOrder: (os: ServiceOrder) => void;
}

const CHECKLIST_ITEMS = [
  'Tela e vidro',
  'Sensibilidade do touch',
  'Câmeras e flash',
  'Alto-falantes e áudio',
  'Microfone',
  'Botões físicos',
  'Vibração',
  'Face ID, Touch ID ou biometria',
  'Wi-Fi e Bluetooth',
  'Chip, sinal e rede móvel',
  'Conector de carga',
  'Bateria e carregamento',
  'Carcaça e estrutura',
];

export const ServiceOrderView = ({
  serviceOrders,
  onAddServiceOrder,
}: ServiceOrderViewProps) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [customerName, setCustomerName] = useState('Juliana Paes');
  const [customerPhone, setCustomerPhone] = useState('+55 77 99933-4455');
  const [technician, setTechnician] = useState('André Técnico');
  const [status, setStatus] = useState<any>('received');
  const [brand, setBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('iPhone 12');
  const [color, setColor] = useState('Azul');
  const [imei, setImei] = useState('359182736451029');
  const [accessoriesReceived, setAccessoriesReceived] = useState('Capa, película trincada');
  const [physicalCondition, setPhysicalCondition] = useState('Marcas leves na lateral, tela original sem riscos');
  const [reportedIssue, setReportedIssue] = useState('Aparelho descarregando muito rápido e esquentando na carga');
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState('Bateria degradada com 78% de saúde');
  const [serviceExecuted, setServiceExecuted] = useState('Troca de Bateria Premium');
  const [estimatedValue, setEstimatedValue] = useState(280);

  // Checklist de 13 itens
  const [checklist, setChecklist] = useState<Record<string, 'ok' | 'issue' | 'na' | 'untested'>>(
    CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item]: 'ok' }), {})
  );

  const handleApproveAllChecklist = () => {
    const approved: Record<string, 'ok'> = {};
    CHECKLIST_ITEMS.forEach(item => { approved[item] = 'ok'; });
    setChecklist(approved);
  };

  const handleSaveOS = (e: React.FormEvent) => {
    e.preventDefault();

    const newOS: ServiceOrder = {
      id: `os-${Date.now()}`,
      osNumber: `OS-${1026 + serviceOrders.length}`,
      customerName,
      customerPhone,
      deviceModel,
      imei,
      color,
      technician,
      status: status === 'received' ? 'received' : 'diagnosing',
      checklistCount: 13,
      reportedIssue,
      technicalDiagnosis,
      serviceExecuted,
      estimatedValue,
      entryDate: new Date().toLocaleDateString('pt-BR'),
    };

    onAddServiceOrder(newOS);
    setShowForm(false);
  };

  const handleSendViaWhatsApp = (os: ServiceOrder) => {
    const text = encodeURIComponent(
      `🔧 *COMPROVANTE DE ORDEM DE SERVIÇO - HIAGO IPHONES* 🔧\n\n` +
      `📋 *O.S.:* ${os.osNumber}\n` +
      `👤 *Cliente:* ${os.customerName}\n` +
      `📱 *Aparelho:* ${os.deviceModel}\n` +
      `⚠️ *Defeito Relatado:* ${os.reportedIssue}\n` +
      `💰 *Valor Previsto:* R$ ${os.estimatedValue.toFixed(2).replace('.', ',')}\n\n` +
      `✅ Checklist de entrada concluído (13 itens testados).\n` +
      `Acompanharemos seu reparo e avisaremos assim que estiver pronto para retirada!`
    );
    window.open(`https://wa.me/${os.customerPhone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  const filteredOrders = serviceOrders.filter(os =>
    !searchTerm || 
    os.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.osNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.deviceModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#f97316',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            ASSISTÊNCIA TÉCNICA
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            Ordens de Serviço & Checklist
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
            Registre a entrada do smartphone, faça o checklist obrigatório de 13 testes e gere a via no WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: showForm ? 'rgba(255, 255, 255, 0.1)' : '#06b6d4',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: showForm ? 'none' : '0 2px 10px rgba(6, 182, 212, 0.4)',
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Fechar O.S.' : '+ Nova O.S.'}
        </button>
      </div>

      {/* FORMULÁRIO DE NOVA O.S. IDÊNTICO AOS PRINTS */}
      {showForm && (
        <form onSubmit={handleSaveOS} className="glass-panel animate-fade-in" style={{ padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
            Nova O.S. (Ordem de Serviço)
          </h2>

          {/* 1. Entrada da O.S. */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc', marginBottom: 12 }}>
              1. Entrada da O.S. (Cliente e Técnico)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Cliente da O.S. *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Telefone / WhatsApp *</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Técnico responsável</label>
                <select
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0d121f',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                >
                  <option value="André Técnico">André Técnico</option>
                  <option value="Hiago">Hiago</option>
                  <option value="Sem técnico definido">Sem técnico definido</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Situação *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0d121f',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                >
                  <option value="received">Entrada realizada</option>
                  <option value="diagnosing">Em diagnóstico</option>
                  <option value="waiting_parts">Aguardando peça</option>
                  <option value="ready">Pronta</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Aparelho */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc', marginBottom: 12 }}>
              2. Aparelho e Estado Físico
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Marca</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Modelo *</label>
                <input
                  type="text"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Cor</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>IMEI (opcional)</label>
                <input
                  type="text"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Acessórios recebidos junto</label>
                <input
                  type="text"
                  value={accessoriesReceived}
                  onChange={(e) => setAccessoriesReceived(e.target.value)}
                  placeholder="Ex: Capa, chip, carregador"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Situação física do aparelho</label>
                <input
                  type="text"
                  value={physicalCondition}
                  onChange={(e) => setPhysicalCondition(e.target.value)}
                  placeholder="Ex: Tela trincada, marcas na tampa traseira"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 3. CHECKLIST OBRIGATÓRIO DE 13 TESTES (EXATAMENTE COMO NO PRINT 16.23.11.jpeg) */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                  3. Checklist de entrada do aparelho (13 Testes Obrigatórios)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  O checklist ficará registrado na O.S. e será enviado ao cliente pelo WhatsApp para segurança jurídica da loja.
                </div>
              </div>

              <button
                type="button"
                onClick={handleApproveAllChecklist}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Check size={14} /> Aprovar todo o checklist
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {CHECKLIST_ITEMS.map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 6,
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 600 }}>{item}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => setChecklist(prev => ({ ...prev, [item]: 'ok' }))}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: checklist[item] === 'ok' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                        color: checklist[item] === 'ok' ? '#fff' : '#94a3b8',
                      }}
                    >
                      ✓ OK
                    </button>
                    <button
                      type="button"
                      onClick={() => setChecklist(prev => ({ ...prev, [item]: 'issue' }))}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: checklist[item] === 'issue' ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                        color: checklist[item] === 'issue' ? '#fff' : '#94a3b8',
                      }}
                    >
                      ✕ Avaria
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Defeito, Laudo e Valores */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc', marginBottom: 12 }}>
              4. Defeito relatado e Orçamento
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Defeito relatado pelo cliente *</label>
                <textarea
                  rows={2}
                  value={reportedIssue}
                  onChange={(e) => setReportedIssue(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Laudo técnico</label>
                <input
                  type="text"
                  value={technicalDiagnosis}
                  onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                  placeholder="Ex: Bateria estufada com alta resistência interna"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Serviço a executar</label>
                  <input
                    type="text"
                    value={serviceExecuted}
                    onChange={(e) => setServiceExecuted(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      marginTop: 4,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Valor previsto do reparo (R$)</label>
                  <input
                    type="number"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#10b981',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      marginTop: 4,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                background: '#06b6d4',
                color: '#fff',
                border: 'none',
                padding: '9px 24px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Salvar O.S.
            </button>
          </div>
        </form>
      )}

      {/* TABELA DE ORDENS DE SERVIÇO EM ANDAMENTO */}
      <div className="glass-panel" style={{ padding: 20, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            width: 320,
          }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por O.S., cliente ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            {serviceOrders.length} Ordens de Serviço cadastradas
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 12px' }}>O.S.</th>
              <th style={{ padding: '10px 12px' }}>Cliente</th>
              <th style={{ padding: '10px 12px' }}>Aparelho</th>
              <th style={{ padding: '10px 12px' }}>Técnico</th>
              <th style={{ padding: '10px 12px' }}>Checklist</th>
              <th style={{ padding: '10px 12px' }}>Valor</th>
              <th style={{ padding: '10px 12px' }}>Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Ação WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((os) => (
              <tr key={os.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '12px', fontWeight: 800, color: '#06b6d4' }}>
                  {os.osNumber}
                </td>
                <td style={{ padding: '12px', fontWeight: 600, color: '#f8fafc' }}>
                  {os.customerName}
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{os.customerPhone}</div>
                </td>
                <td style={{ padding: '12px', color: '#f8fafc' }}>
                  {os.deviceModel} ({os.color || 'Padrão'})
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{os.reportedIssue}</div>
                </td>
                <td style={{ padding: '12px', color: '#94a3b8' }}>
                  {os.technician}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                    13/13 Aprovado
                  </span>
                </td>
                <td style={{ padding: '12px', fontWeight: 800, color: '#10b981' }}>
                  R$ {os.finalValue || os.estimatedValue}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: os.status === 'ready' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                    color: os.status === 'ready' ? '#10b981' : '#06b6d4',
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}>
                    {os.status === 'ready' ? 'Pronta p/ Entrega' : 'Em Diagnóstico'}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleSendViaWhatsApp(os)}
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Send size={12} /> Via WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
