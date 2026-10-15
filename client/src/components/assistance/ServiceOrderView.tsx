import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  X, 
  Send, 
  Printer, 
  User, 
  Eye 
} from 'lucide-react';
import type { 
  ServiceOrder, 
  OSStatus, 
  Customer, 
  TechnicalService, 
  Part, 
  Device, 
  OSQuoteServiceItem, 
  OSQuotePartItem, 
  OSChecklistItem 
} from '../../types.js';

interface ServiceOrderViewProps {
  serviceOrders: ServiceOrder[];
  customers: Customer[];
  servicesCatalog: TechnicalService[];
  partsInventory: Part[];
  stockDevices: Device[];
  onAddServiceOrder: (os: ServiceOrder) => Promise<any>;
  onUpdateStatus: (id: string, status: OSStatus, notes?: string, operator?: string, extra?: Partial<ServiceOrder>) => Promise<any>;
  onUpdateQuote: (id: string, services: OSQuoteServiceItem[], parts: OSQuotePartItem[], discount: number) => Promise<any>;
  onRecordApproval: (id: string, approval: any) => Promise<any>;
  onAddCustomer?: (customer: Customer) => Promise<any>;
}

const CHECKLIST_ITEMS_LIST = [
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

export const ServiceOrderView: React.FC<ServiceOrderViewProps> = ({
  serviceOrders,
  customers,
  servicesCatalog,
  partsInventory,
  stockDevices,
  onAddServiceOrder,
  onUpdateStatus,
  onUpdateQuote,
  onRecordApproval,
  onAddCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');

  // Modais
  const [isNewOSModalOpen, setIsNewOSModalOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [detailTab, setDetailTab] = useState<'summary' | 'checklist' | 'quote' | 'approval' | 'execution' | 'delivery' | 'history'>('summary');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocType, setPrintDocType] = useState<'entry' | 'quote' | 'delivery'>('entry');

  // FORM NOVA OS
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [deviceOwnerType, setDeviceOwnerType] = useState<'customer' | 'store_stock'>('customer');
  const [selectedStockDeviceId, setSelectedStockDeviceId] = useState('');
  const [deviceType, setDeviceType] = useState('Smartphone');
  const [brand, setBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('iPhone 12');
  const [imei, setImei] = useState('');
  const [imei2, setImei2] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [color, setColor] = useState('Preto');
  const [physicalCondition, setPhysicalCondition] = useState('Vidro sem trincas, marcas leves de uso.');
  const [reportedIssue, setReportedIssue] = useState('');
  const [accessoriesReceived, setAccessoriesReceived] = useState('Sem acessórios');
  const [technician, setTechnician] = useState('André Técnico');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [initialEstimatedValue, setInitialEstimatedValue] = useState(250);

  // Checklist de 13 itens da nova OS
  const [newOSChecklist, setNewOSChecklist] = useState<Record<string, 'ok' | 'issue' | 'na' | 'untested'>>(
    CHECKLIST_ITEMS_LIST.reduce((acc, item) => ({ ...acc, [item]: 'ok' }), {})
  );

  // FORM DE EDIÇÃO DE ORÇAMENTO NO DETALHE
  const [quoteServicesList, setQuoteServicesList] = useState<OSQuoteServiceItem[]>([]);
  const [quotePartsList, setQuotePartsList] = useState<OSQuotePartItem[]>([]);
  const [quoteDiscount, setQuoteDiscount] = useState<number>(0);
  const [quoteServiceIdToAdd, setQuoteServiceIdToAdd] = useState('');
  const [quotePartIdToAdd, setQuotePartIdToAdd] = useState('');

  // FORM DE APROVAÇÃO FORMAL
  const [approvalChannel, setApprovalChannel] = useState<'whatsapp' | 'presencial' | 'telefone'>('whatsapp');
  const [approvedByCustomerName, setApprovedByCustomerName] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // FORM DE ENTREGA
  const [deliveredToName, setDeliveredToName] = useState('');
  const [deliveredByOperator, setDeliveredByOperator] = useState('Hiago');
  const [deliveryPaymentMethod, setDeliveryPaymentMethod] = useState('PIX');
  const [deliveryPaymentStatus, setDeliveryPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [deliveryFinalNotes, setDeliveryFinalNotes] = useState('');

  // Inicializa checklist como todos OK
  const handleApproveAllChecklist = () => {
    const approved: Record<string, 'ok'> = {};
    CHECKLIST_ITEMS_LIST.forEach(item => { approved[item] = 'ok'; });
    setNewOSChecklist(approved);
  };

  // Preenche dados ao selecionar cliente existente
  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const found = customers.find(c => c.id === custId);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerCpf(found.cpf || '');
    }
  };

  // Preenche dados ao selecionar aparelho do estoque da empresa
  const handleSelectStockDevice = (devId: string) => {
    setSelectedStockDeviceId(devId);
    const found = stockDevices.find(d => d.id === devId);
    if (found) {
      setBrand(found.brand);
      setDeviceModel(`${found.model} ${found.storage}`);
      setImei(found.imei || '');
      setColor(found.color);
    }
  };

  const handleOpenNewOSModal = () => {
    if (customers.length > 0) {
      handleSelectCustomer(customers[0].id);
    }
    setReportedIssue('');
    setPhysicalCondition('Vidro sem trincas, marcas leves de uso.');
    setAccessoriesReceived('Sem acessórios');
    setInitialEstimatedValue(250);
    handleApproveAllChecklist();
    setIsNewOSModalOpen(true);
  };

  const handleSaveNewOS = async (e: React.FormEvent) => {
    e.preventDefault();

    // Se cadastrou novo cliente, salva no repositório de clientes para evitar duplicação
    let finalCustId = selectedCustomerId;
    if (customerMode === 'new' && onAddCustomer) {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: customerName,
        phone: customerPhone,
        cpf: customerCpf || undefined,
        purchasedDevices: [],
        totalSpent: 0,
        lastPurchaseDate: new Date().toLocaleDateString('pt-BR'),
      };
      await onAddCustomer(newCust);
      finalCustId = newCust.id;
    }

    const checklistFormatted: OSChecklistItem[] = Object.entries(newOSChecklist).map(([item, st]) => ({
      item,
      status: st,
    }));

    const osCount = serviceOrders.length + 1;
    const osNumber = `OS-${1026 + osCount}`;

    const newOS: ServiceOrder = {
      id: `os-${Date.now()}`,
      osNumber,
      customerId: finalCustId || undefined,
      customerName,
      customerPhone,
      customerCpf: customerCpf || undefined,
      deviceType,
      brand,
      deviceModel,
      imei: imei.replace(/\D/g, '') || undefined,
      imei2: imei2.replace(/\D/g, '') || undefined,
      serialNumber: serialNumber || undefined,
      color,
      deviceOwnerType,
      stockDeviceId: deviceOwnerType === 'store_stock' ? selectedStockDeviceId : undefined,
      physicalCondition,
      reportedIssue,
      accessoriesReceived,
      checklistCount: 13,
      checklistItems: checklistFormatted,
      technician,
      status: 'aberta',
      statusHistory: [
        {
          id: `h-${Date.now()}`,
          toStatus: 'aberta',
          changedAt: new Date().toLocaleString('pt-BR'),
          changedBy: 'Hiago',
          notes: 'Abertura de O.S. no balcão',
        }
      ],
      quoteServices: [],
      quoteParts: [],
      subtotalServices: 0,
      subtotalParts: 0,
      discount: 0,
      estimatedValue: initialEstimatedValue,
      partsConsumed: false,
      entryDate: new Date().toLocaleDateString('pt-BR'),
      estimatedDeliveryDate: estimatedDeliveryDate || new Date().toLocaleDateString('pt-BR'),
      warrantyDays: 90,
    };

    await onAddServiceOrder(newOS);
    setIsNewOSModalOpen(false);
  };

  // Abrir detalhe da OS e inicializar estados de cotação
  const handleOpenDetail = (os: ServiceOrder) => {
    setSelectedOS(os);
    setDetailTab('summary');
    setQuoteServicesList(os.quoteServices || []);
    setQuotePartsList(os.quoteParts || []);
    setQuoteDiscount(os.discount || 0);
    setApprovedByCustomerName(os.customerName);
    setDeliveredToName(os.customerName);
  };

  // Adicionar serviço ao orçamento da OS
  const handleAddServiceToQuote = () => {
    if (!quoteServiceIdToAdd) return;
    const srv = servicesCatalog.find(s => s.id === quoteServiceIdToAdd);
    if (!srv) return;

    const newItem: OSQuoteServiceItem = {
      id: `qs-${Date.now()}`,
      serviceId: srv.id,
      name: srv.name,
      category: srv.category,
      quantity: 1,
      unitPrice: srv.defaultPrice,
      subtotal: srv.defaultPrice,
      estimatedMinutes: srv.estimatedMinutes,
      warrantyDays: srv.defaultWarrantyDays,
    };

    setQuoteServicesList(prev => [...prev, newItem]);
    setQuoteServiceIdToAdd('');
  };

  // Adicionar peça ao orçamento da OS
  const handleAddPartToQuote = () => {
    if (!quotePartIdToAdd) return;
    const part = partsInventory.find(p => p.id === quotePartIdToAdd);
    if (!part) return;

    const newItem: OSQuotePartItem = {
      id: `qp-${Date.now()}`,
      partId: part.id,
      name: part.name,
      code: part.code,
      quantity: 1,
      unitCost: part.costPrice,
      unitPrice: part.sellPrice,
      subtotal: part.sellPrice,
      reserved: true,
      consumed: false,
    };

    setQuotePartsList(prev => [...prev, newItem]);
    setQuotePartIdToAdd('');
  };

  const handleSaveQuoteChanges = async () => {
    if (!selectedOS) return;
    await onUpdateQuote(selectedOS.id, quoteServicesList, quotePartsList, quoteDiscount);
    
    // Atualiza cópia local
    const subServices = quoteServicesList.reduce((acc, s) => acc + s.subtotal, 0);
    const subParts = quotePartsList.reduce((acc, p) => acc + p.subtotal, 0);
    const total = Math.max(0, subServices + subParts - quoteDiscount);

    setSelectedOS(prev => prev ? ({
      ...prev,
      quoteServices: quoteServicesList,
      quoteParts: quotePartsList,
      subtotalServices: subServices,
      subtotalParts: subParts,
      discount: quoteDiscount,
      estimatedValue: total,
      finalValue: total,
    }) : null);

    alert('Orçamento atualizado com sucesso no backend!');
  };

  // Registrar aprovação ou recusa formal
  const handleExecuteApproval = async (decision: 'approved' | 'rejected') => {
    if (!selectedOS) return;

    const approvalPayload = {
      status: decision,
      channel: approvalChannel,
      approvedByCustomerName: approvedByCustomerName || selectedOS.customerName,
      approvedAt: new Date().toLocaleString('pt-BR'),
      valueApproved: selectedOS.estimatedValue,
      notes: approvalNotes,
    };

    await onRecordApproval(selectedOS.id, approvalPayload);

    setSelectedOS(prev => prev ? ({
      ...prev,
      status: decision === 'approved' ? 'aprovada' : 'reprovada',
      clientApproval: approvalPayload,
    }) : null);
  };

  // Transição de status controlada com máquina de estados
  const handleTransitionStatus = async (targetStatus: OSStatus, notes?: string) => {
    if (!selectedOS) return;

    const res = await onUpdateStatus(selectedOS.id, targetStatus, notes, 'André Técnico');
    if (!res.success && res.error) {
      alert(res.error);
      return;
    }

    setSelectedOS(prev => prev ? ({
      ...prev,
      status: targetStatus,
    }) : null);
  };

  // Registrar Entrega Final
  const handleFinalDelivery = async () => {
    if (!selectedOS) return;

    await onUpdateStatus(
      selectedOS.id, 
      'entregue', 
      `Entregue para ${deliveredToName}. Pagamento: ${deliveryPaymentMethod} (${deliveryPaymentStatus})`,
      deliveredByOperator,
      {
        deliveredTo: deliveredToName,
        deliveredBy: deliveredByOperator,
        paymentMethod: deliveryPaymentMethod,
        paymentStatus: deliveryPaymentStatus,
        deliveryNotes: deliveryFinalNotes,
        deliveredDate: new Date().toLocaleDateString('pt-BR'),
      }
    );

    setSelectedOS(prev => prev ? ({
      ...prev,
      status: 'entregue',
      deliveredDate: new Date().toLocaleDateString('pt-BR'),
      deliveredTo: deliveredToName,
      deliveredBy: deliveredByOperator,
      paymentMethod: deliveryPaymentMethod,
      paymentStatus: deliveryPaymentStatus,
    }) : null);

    alert('Equipamento marcado como entregue! Garantia emitida automaticamente.');
  };

  // Enviar WhatsApp da O.S.
  const handleSendOSWhatsApp = (os: ServiceOrder) => {
    const text = encodeURIComponent(
      `🔧 *HIAGO iPHONES — ORDEM DE SERVIÇO ${os.osNumber}* 🔧\n\n` +
      `Olá *${os.customerName}*!\n` +
      `Seu aparelho está registrado em nossa bancada de assistência técnica:\n\n` +
      `📱 *Equipamento:* ${os.deviceModel}\n` +
      `🔢 *IMEI:* ${os.imei || 'Registrado'}\n` +
      `⚠️ *Defeito Relatado:* ${os.reportedIssue}\n` +
      `📌 *Situação Atual:* ${os.status.toUpperCase()}\n` +
      `💰 *Valor Estimado:* R$ ${(os.finalValue || os.estimatedValue).toFixed(2)}\n\n` +
      `Qualquer atualização em seu reparo informaremos prontamente!`
    );
    window.open(`https://wa.me/${os.customerPhone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  // Filtro de Ordens
  const filteredOrders = useMemo(() => {
    return serviceOrders.filter(os => {
      if (statusFilter !== 'all' && os.status !== statusFilter) return false;
      if (technicianFilter !== 'all' && os.technician !== technicianFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchNum = os.osNumber.toLowerCase().includes(query);
        const matchCust = os.customerName.toLowerCase().includes(query);
        const matchPhone = os.customerPhone.replace(/\D/g, '').includes(query.replace(/\D/g, ''));
        const matchImei = (os.imei || '').includes(query);
        const matchModel = os.deviceModel.toLowerCase().includes(query);
        return matchNum || matchCust || matchPhone || matchImei || matchModel;
      }
      return true;
    });
  }, [serviceOrders, statusFilter, technicianFilter, searchTerm]);

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1440, margin: '0 auto' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ASSISTÊNCIA TÉCNICA
            </span>
            <span style={{ background: 'rgba(249, 115, 22, 0.12)', color: '#f97316', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
              Ciclo Operacional Completo
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
            Ordens de Serviço
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Abertura, diagnóstico de bancada, orçamentos, aprovação do cliente, consumo de peças e entrega com termo de garantia.
          </p>
        </div>

        <button
          onClick={handleOpenNewOSModal}
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
          }}
        >
          <Plus size={16} />
          Nova Ordem de Serviço
        </button>
      </div>

      {/* BARRA DE PESQUISA & STATUS MACHINE STRIP */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: 12 }} />
            <input
              type="text"
              placeholder="Pesquisar por nº da OS, cliente, telefone, IMEI ou modelo..."
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
            value={technicianFilter}
            onChange={(e) => setTechnicianFilter(e.target.value)}
            style={{
              background: '#0d121f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '10px 14px',
              borderRadius: 8,
              color: '#f8fafc',
              fontSize: '0.85rem',
            }}
          >
            <option value="all">Todos os Técnicos</option>
            <option value="André Técnico">André Técnico</option>
            <option value="Hiago">Hiago</option>
          </select>
        </div>

        {/* STATUS TABS */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'aberta', label: 'Abertas' },
            { id: 'em_diagnostico', label: 'Em Diagnóstico' },
            { id: 'aguardando_aprovacao', label: 'Aguardando Aprovação' },
            { id: 'aprovada', label: 'Aprovadas' },
            { id: 'em_reparo', label: 'Em Reparo' },
            { id: 'em_testes', label: 'Em Testes' },
            { id: 'pronta', label: 'Prontas' },
            { id: 'entregue', label: 'Entregues' },
            { id: 'cancelada', label: 'Canceladas' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                background: statusFilter === tab.id ? '#f97316' : 'rgba(255, 255, 255, 0.04)',
                color: statusFilter === tab.id ? '#fff' : '#94a3b8',
                border: '1px solid',
                borderColor: statusFilter === tab.id ? '#f97316' : 'rgba(255, 255, 255, 0.08)',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA DE ORDENS DE SERVIÇO */}
      <div style={{ background: '#0d121f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>O.S.</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Cliente</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Equipamento / IMEI</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Defeito / Diagnóstico</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Técnico</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Valor</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
                  Nenhuma ordem de serviço encontrada com os critérios informados.
                </td>
              </tr>
            ) : (
              filteredOrders.map(os => {
                let badgeBg = 'rgba(245, 158, 11, 0.15)';
                let badgeColor = '#f59e0b';

                if (['pronta', 'ready'].includes(os.status)) {
                  badgeBg = 'rgba(16, 185, 129, 0.15)';
                  badgeColor = '#10b981';
                } else if (['entregue', 'delivered'].includes(os.status)) {
                  badgeBg = 'rgba(59, 130, 246, 0.15)';
                  badgeColor = '#60a5fa';
                } else if (os.status === 'cancelada') {
                  badgeBg = 'rgba(239, 68, 68, 0.15)';
                  badgeColor = '#ef4444';
                } else if (os.status === 'em_reparo') {
                  badgeBg = 'rgba(6, 182, 212, 0.15)';
                  badgeColor = '#06b6d4';
                }

                return (
                  <tr key={os.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#f97316' }}>
                        {os.osNumber}
                      </span>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{os.entryDate}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{os.customerName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{os.customerPhone}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600 }}>{os.deviceModel}</div>
                      {os.imei && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                          IMEI: {os.imei}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#e2e8f0', maxWidth: 260 }}>
                        {os.reportedIssue}
                      </div>
                      {os.technicalDiagnosis && (
                        <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: 2 }}>
                          {os.technicalDiagnosis.substring(0, 50)}...
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={13} color="#f97316" />
                        <span>{os.technician}</span>
                      </div>
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
                          textTransform: 'uppercase',
                        }}
                      >
                        {os.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#f8fafc' }}>
                      R$ {(os.finalValue || os.estimatedValue).toFixed(2)}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          onClick={() => handleSendOSWhatsApp(os)}
                          title="Enviar no WhatsApp"
                          style={{
                            background: '#25d366',
                            border: 'none',
                            color: '#fff',
                            padding: '6px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <Send size={13} />
                        </button>

                        <button
                          onClick={() => handleOpenDetail(os)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#e2e8f0',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Eye size={13} />
                          <span>Detalhes</span>
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

      {/* DRAWER / MODAL DE DETALHES COMPLETOS DA ORDEM DE SERVIÇO */}
      {selectedOS && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
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
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 960,
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 26,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* CABEÇALHO DO DETALHE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f97316' }}>{selectedOS.osNumber}</span>
                  <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#f8fafc', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700 }}>
                    {selectedOS.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
                  Cliente: <strong style={{ color: '#f8fafc' }}>{selectedOS.customerName}</strong> • {selectedOS.customerPhone} • Aparelho: <strong style={{ color: '#f8fafc' }}>{selectedOS.deviceModel}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => {
                    setPrintDocType('entry');
                    setIsPrintModalOpen(true);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Printer size={14} />
                  Imprimir Comprovante
                </button>

                <button
                  onClick={() => setSelectedOS(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* ABAS DO DETALHE DA OS */}
            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 10, overflowX: 'auto' }}>
              {[
                { id: 'summary', label: '1. Resumo & Status' },
                { id: 'checklist', label: '2. Equipamento & Checklist' },
                { id: 'quote', label: '3. Diagnóstico & Orçamento' },
                { id: 'approval', label: '4. Aprovação Cliente' },
                { id: 'execution', label: '5. Execução & Testes' },
                { id: 'delivery', label: '6. Entrega & Garantia' },
                { id: 'history', label: '7. Histórico & Auditoria' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id as any)}
                  style={{
                    background: detailTab === tab.id ? '#f97316' : 'transparent',
                    color: detailTab === tab.id ? '#fff' : '#94a3b8',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CONTEÚDO DA ABA SELECIONADA */}

            {/* ABA 1: RESUMO & TRANSIÇÕES DE STATUS */}
            {detailTab === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Máquina de Estados Operacional
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0 0 14px' }}>
                    Avance a ordem de serviço conforme o fluxo validado de bancada:
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleTransitionStatus('em_diagnostico', 'Iniciado diagnóstico de bancada')}
                      style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Iniciar Diagnóstico
                    </button>
                    <button
                      onClick={() => handleTransitionStatus('aguardando_aprovacao', 'Orçamento formulado e enviado')}
                      style={{ background: '#a855f7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Aguardando Aprovação
                    </button>
                    <button
                      onClick={() => handleTransitionStatus('em_reparo', 'Reparo iniciado após autorização')}
                      style={{ background: '#06b6d4', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Iniciar Reparo
                    </button>
                    <button
                      onClick={() => handleTransitionStatus('em_testes', 'Reparo finalizado, em testes de qualidade')}
                      style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Em Testes Finais
                    </button>
                    <button
                      onClick={() => handleTransitionStatus('pronta', 'Aparelho pronto para retirada')}
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Pronta para Retirada
                    </button>
                    <button
                      onClick={() => setDetailTab('delivery')}
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Registrar Entrega
                    </button>
                    <button
                      onClick={() => handleTransitionStatus('cancelada', 'OS cancelada')}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Cancelar OS
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  <div style={{ background: '#151b2b', padding: 14, borderRadius: 8, fontSize: '0.82rem' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Defeito Relatado</div>
                    <div style={{ color: '#f8fafc', marginTop: 4, fontWeight: 600 }}>{selectedOS.reportedIssue}</div>
                  </div>
                  <div style={{ background: '#151b2b', padding: 14, borderRadius: 8, fontSize: '0.82rem' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Diagnóstico Técnico</div>
                    <div style={{ color: '#10b981', marginTop: 4, fontWeight: 600 }}>{selectedOS.technicalDiagnosis || 'Aguardando avaliação em bancada'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: EQUIPAMENTO & CHECKLIST */}
            {detailTab === 'checklist' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 8, fontSize: '0.8rem' }}>
                  <div><strong>Equipamento:</strong> {selectedOS.deviceModel} ({selectedOS.color || 'Padrão'})</div>
                  <div><strong>IMEI:</strong> {selectedOS.imei || 'Não informado'}</div>
                  <div><strong>Nº de Série:</strong> {selectedOS.serialNumber || 'N/A'}</div>
                  <div><strong>Condição Entrada:</strong> {selectedOS.physicalCondition || 'Normal'}</div>
                  <div><strong>Acessórios:</strong> {selectedOS.accessoriesReceived || 'Sem acessórios'}</div>
                  <div><strong>Posse:</strong> {selectedOS.deviceOwnerType === 'store_stock' ? 'Estoque da Loja' : 'Aparelho do Cliente'}</div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#f8fafc' }}>
                    Checklist de Entrada (13 Itens Obrigatórios)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8 }}>
                    {(selectedOS.checklistItems || []).map((chk, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#151b2b',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          padding: '10px 14px',
                          borderRadius: 8,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.78rem',
                        }}
                      >
                        <span style={{ color: '#e2e8f0' }}>{chk.item}</span>
                        <span
                          style={{
                            background: chk.status === 'ok' ? 'rgba(16, 185, 129, 0.15)' : chk.status === 'issue' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: chk.status === 'ok' ? '#10b981' : chk.status === 'issue' ? '#ef4444' : '#94a3b8',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                          }}
                        >
                          {chk.status === 'ok' ? 'OK' : chk.status === 'issue' ? 'AVARIADO' : 'NÃO TESTADO'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: DIAGNÓSTICO & ORÇAMENTO COM SERVIÇOS E PEÇAS */}
            {detailTab === 'quote' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#f97316' }}>Inserir Linha de Mão de Obra do Catálogo</h4>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <select
                      value={quoteServiceIdToAdd}
                      onChange={(e) => setQuoteServiceIdToAdd(e.target.value)}
                      style={{ flex: 1, background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                    >
                      <option value="">Selecione um serviço cadastrado...</option>
                      {servicesCatalog.filter(s => s.status === 'active').map(srv => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} — R$ {srv.defaultPrice.toFixed(2)} ({srv.estimatedMinutes} min)
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddServiceToQuote}
                      style={{ background: '#f97316', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Adicionar Serviço
                    </button>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#60a5fa' }}>Inserir Peça do Estoque Físico</h4>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <select
                      value={quotePartIdToAdd}
                      onChange={(e) => setQuotePartIdToAdd(e.target.value)}
                      style={{ flex: 1, background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                    >
                      <option value="">Selecione uma peça em estoque...</option>
                      {partsInventory.map(part => (
                        <option key={part.id} value={part.id}>
                          {part.name} (Disp: {part.currentStock}) — Custo: R$ {part.costPrice.toFixed(2)} | Venda: R$ {part.sellPrice.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddPartToQuote}
                      style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Adicionar Peça
                    </button>
                  </div>
                </div>

                {/* TABELA DE ITENS COTADOS */}
                <div style={{ background: '#151b2b', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8' }}>
                        <th style={{ padding: 10 }}>Tipo</th>
                        <th style={{ padding: 10 }}>Item</th>
                        <th style={{ padding: 10 }}>Qtd</th>
                        <th style={{ padding: 10 }}>Unitário</th>
                        <th style={{ padding: 10 }}>Subtotal</th>
                        <th style={{ padding: 10, textAlign: 'right' }}>Remover</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteServicesList.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: 10, color: '#f97316', fontWeight: 700 }}>Serviço</td>
                          <td style={{ padding: 10 }}>{s.name}</td>
                          <td style={{ padding: 10 }}>{s.quantity}</td>
                          <td style={{ padding: 10 }}>R$ {s.unitPrice.toFixed(2)}</td>
                          <td style={{ padding: 10, fontWeight: 700 }}>R$ {s.subtotal.toFixed(2)}</td>
                          <td style={{ padding: 10, textAlign: 'right' }}>
                            <button
                              onClick={() => setQuoteServicesList(prev => prev.filter(x => x.id !== s.id))}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {quotePartsList.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: 10, color: '#60a5fa', fontWeight: 700 }}>Peça</td>
                          <td style={{ padding: 10 }}>{p.name}</td>
                          <td style={{ padding: 10 }}>{p.quantity}</td>
                          <td style={{ padding: 10 }}>R$ {p.unitPrice.toFixed(2)}</td>
                          <td style={{ padding: 10, fontWeight: 700 }}>R$ {p.subtotal.toFixed(2)}</td>
                          <td style={{ padding: 10, textAlign: 'right' }}>
                            <button
                              onClick={() => setQuotePartsList(prev => prev.filter(x => x.id !== p.id))}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* RESUMO TOTALIZADOR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Desconto Comercial (R$):</span>
                    <input
                      type="number"
                      value={quoteDiscount}
                      onChange={(e) => setQuoteDiscount(Number(e.target.value))}
                      style={{ width: 90, background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '6px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Valor Total Orçado:</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>
                      R$ {Math.max(0, quoteServicesList.reduce((acc, s) => acc + s.subtotal, 0) + quotePartsList.reduce((acc, p) => acc + p.subtotal, 0) - quoteDiscount).toFixed(2)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveQuoteChanges}
                  style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Salvar Revisão do Orçamento
                </button>
              </div>
            )}

            {/* ABA 4: APROVAÇÃO FORMAL DO CLIENTE */}
            {detailTab === 'approval' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 10, fontSize: '0.82rem' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>Situação Atual da Aprovação</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: selectedOS.clientApproval?.status === 'approved' ? '#10b981' : selectedOS.clientApproval?.status === 'rejected' ? '#ef4444' : '#f59e0b', marginTop: 4 }}>
                    {selectedOS.clientApproval?.status === 'approved' ? '✓ Orçamento Aprovado pelo Cliente' : selectedOS.clientApproval?.status === 'rejected' ? '✗ Orçamento Recusado' : '⏳ Aguardando Decisão do Cliente'}
                  </div>
                  {selectedOS.clientApproval?.approvedAt && (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                      Registrado em {selectedOS.clientApproval.approvedAt} via {selectedOS.clientApproval.channel} por {selectedOS.clientApproval.registeredBy || 'Hiago'}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Canal de Autorização
                    </label>
                    <select
                      value={approvalChannel}
                      onChange={(e) => setApprovalChannel(e.target.value as any)}
                      style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                    >
                      <option value="whatsapp">WhatsApp (Mensagem confirmada)</option>
                      <option value="presencial">Presencial no Balcão</option>
                      <option value="telefone">Chamada Telefônica Gravada</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Nome de Quem Autorizou
                    </label>
                    <input
                      type="text"
                      value={approvedByCustomerName}
                      onChange={(e) => setApprovedByCustomerName(e.target.value)}
                      placeholder="Nome do cliente ou procurador..."
                      style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Observações da Autorização / Evidências
                  </label>
                  <textarea
                    rows={2}
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Ex: Cliente autorizou troca por tela OEM original e deu ok no valor de R$ 650,00..."
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => handleExecuteApproval('approved')}
                    style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Registrar Aprovação Formal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteApproval('rejected')}
                    style={{ flex: 1, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 18px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Registrar Recusa do Cliente
                  </button>
                </div>
              </div>
            )}

            {/* ABA 5: EXECUÇÃO & TESTES DE QUALIDADE */}
            {detailTab === 'execution' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 8, fontSize: '0.82rem' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Controle de Consumo de Peças</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ color: selectedOS.partsConsumed ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                      {selectedOS.partsConsumed ? '✓ Peças baixadas do estoque físico' : '⏳ Peças aguardando consumo de bancada'}
                    </span>
                  </div>
                </div>

                <div style={{ background: '#151b2b', padding: 14, borderRadius: 8, fontSize: '0.82rem' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Serviço Executado</div>
                  <div style={{ color: '#f8fafc', marginTop: 4, fontWeight: 600 }}>
                    {selectedOS.serviceExecuted || 'Aguardando preenchimento na conclusão do reparo'}
                  </div>
                </div>

                <div style={{ background: '#151b2b', padding: 14, borderRadius: 8, fontSize: '0.82rem' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Testes Finais de Qualidade</div>
                  <div style={{ color: '#10b981', marginTop: 4, fontWeight: 600 }}>
                    {selectedOS.finalTestsSummary || 'Checklist de saída aprovado na bancada de testes.'}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 6: ENTREGA & GARANTIA AUTOMÁTICA */}
            {detailTab === 'delivery' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: 14, borderRadius: 8, fontSize: '0.82rem' }}>
                  <div style={{ color: '#10b981', fontWeight: 800 }}>Emissão Automática de Garantia CDC</div>
                  <div style={{ color: '#cbd5e1', marginTop: 2 }}>
                    Ao registrar a entrega física, um certificado de garantia de 90 dias será emitido com as coberturas de mão de obra e peças instaladas.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Nome de Quem Retirou
                    </label>
                    <input
                      type="text"
                      value={deliveredToName}
                      onChange={(e) => setDeliveredToName(e.target.value)}
                      placeholder="Nome do cliente ou responsável..."
                      style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Forma de Pagamento
                    </label>
                    <select
                      value={deliveryPaymentMethod}
                      onChange={(e) => setDeliveryPaymentMethod(e.target.value)}
                      style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                    >
                      <option value="PIX">PIX</option>
                      <option value="Cartão de Crédito 1x">Cartão de Crédito 1x</option>
                      <option value="Cartão de Crédito Parcelado">Cartão de Crédito Parcelado</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Dinheiro">Dinheiro em Espécie</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Situação do Pagamento
                    </label>
                    <select
                      value={deliveryPaymentStatus}
                      onChange={(e) => setDeliveryPaymentStatus(e.target.value as any)}
                      style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                    >
                      <option value="paid">Pago Integralmente</option>
                      <option value="pending">Saldo Pendente (A Faturar)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Operador Responsável pela Entrega
                    </label>
                    <input
                      type="text"
                      value={deliveredByOperator}
                      onChange={(e) => setDeliveredByOperator(e.target.value)}
                      style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Observações de Entrega
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryFinalNotes}
                    onChange={(e) => setDeliveryFinalNotes(e.target.value)}
                    placeholder="Instruções repassadas ao cliente, orientações de uso..."
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleFinalDelivery}
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 900, cursor: 'pointer' }}
                >
                  Confirmar Entrega e Emitir Certificado de Garantia
                </button>
              </div>
            )}

            {/* ABA 7: HISTÓRICO & AUDITORIA */}
            {detailTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(selectedOS.statusHistory || []).map((h, i) => (
                  <div
                    key={h.id || i}
                    style={{
                      background: '#151b2b',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '12px 16px',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>
                        Transição para: <span style={{ color: '#f97316' }}>{h.toStatus.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                        {h.notes || 'Atualização de status'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b' }}>
                      <div>{h.changedAt}</div>
                      <div>Por: {h.changedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL NOVA OS */}
      {isNewOSModalOpen && (
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
              background: '#0d121f',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 14,
              width: '100%',
              maxWidth: 780,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Abertura de Ordem de Serviço
              </h2>
              <button
                onClick={() => setIsNewOSModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewOS} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* SELEÇÃO DE CLIENTE */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f97316' }}>Identificação do Cliente</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setCustomerMode('existing')}
                      style={{
                        background: customerMode === 'existing' ? '#f97316' : 'transparent',
                        color: customerMode === 'existing' ? '#fff' : '#94a3b8',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Cliente Cadastrado
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode('new');
                        setCustomerName('');
                        setCustomerPhone('');
                        setCustomerCpf('');
                      }}
                      style={{
                        background: customerMode === 'new' ? '#f97316' : 'transparent',
                        color: customerMode === 'new' ? '#fff' : '#94a3b8',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Novo Cadastro
                    </button>
                  </div>
                </div>

                {customerMode === 'existing' ? (
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Selecionar Cliente *
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleSelectCustomer(e.target.value)}
                      style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.phone} {c.cpf ? `(CPF: ${c.cpf})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nome Completo *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nome do cliente"
                        style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Telefone / WhatsApp *</label>
                      <input
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="(77) 99999-9999"
                        style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>CPF</label>
                      <input
                        type="text"
                        value={customerCpf}
                        onChange={(e) => setCustomerCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* DADOS DO EQUIPAMENTO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Tipo de Equipamento</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  >
                    <option value="Smartphone">Smartphone</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Smartwatch">Smartwatch</option>
                    <option value="Notebook">Notebook</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Posse do Aparelho</label>
                  <select
                    value={deviceOwnerType}
                    onChange={(e) => setDeviceOwnerType(e.target.value as any)}
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  >
                    <option value="customer">Aparelho do Cliente</option>
                    <option value="store_stock">Aparelho do Estoque</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Modelo *</label>
                  <input
                    type="text"
                    required
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="Ex: iPhone 12 Pro Max"
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Cor</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ex: Grafite"
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>IMEI Principal</label>
                  <input
                    type="text"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    placeholder="359182736451029"
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>IMEI Secundário (eSIM)</label>
                  <input
                    type="text"
                    value={imei2}
                    onChange={(e) => setImei2(e.target.value)}
                    placeholder="Opcional"
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Número de Série</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Ex: F17D9012PL90"
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* SE FOR APARELHO DO ESTOQUE */}
              {deviceOwnerType === 'store_stock' && (
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Vincular Aparelho do Estoque</label>
                  <select
                    value={selectedStockDeviceId}
                    onChange={(e) => handleSelectStockDevice(e.target.value)}
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  >
                    <option value="">Selecione um aparelho do estoque...</option>
                    {stockDevices.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.model} {d.storage} ({d.color}) — IMEI: {d.imei}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ESTADO FÍSICO & DEFEITO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Defeito Relatado *</label>
                  <textarea
                    rows={2}
                    required
                    value={reportedIssue}
                    onChange={(e) => setReportedIssue(e.target.value)}
                    placeholder="O que o cliente relatou sobre o aparelho..."
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Estado Físico na Entrada</label>
                  <textarea
                    rows={2}
                    value={physicalCondition}
                    onChange={(e) => setPhysicalCondition(e.target.value)}
                    placeholder="Riscos, trincas, amassados, sinais de oxidação..."
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* CHECKLIST DE 13 ITENS */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#f97316' }}>
                    Checklist de Entrada Obrigatório (13 Itens)
                  </span>
                  <button
                    type="button"
                    onClick={handleApproveAllChecklist}
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ✓ Aprovar Todos como OK
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
                  {CHECKLIST_ITEMS_LIST.map(item => (
                    <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#151b2b', padding: '6px 10px', borderRadius: 6, fontSize: '0.74rem' }}>
                      <span style={{ color: '#cbd5e1' }}>{item}</span>
                      <select
                        value={newOSChecklist[item]}
                        onChange={(e) => setNewOSChecklist(prev => ({ ...prev, [item]: e.target.value as any }))}
                        style={{ background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc', fontSize: '0.7rem', padding: '2px 4px', borderRadius: 4 }}
                      >
                        <option value="ok">OK</option>
                        <option value="issue">Avariado</option>
                        <option value="untested">Não Testado</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* TÉCNICO & PREVISÃO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Técnico Responsável</label>
                  <select
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  >
                    <option value="André Técnico">André Técnico</option>
                    <option value="Hiago">Hiago</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Previsão de Conclusão</label>
                  <input
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Valor Previsto Inicial (R$)</label>
                  <input
                    type="number"
                    value={initialEstimatedValue}
                    onChange={(e) => setInitialEstimatedValue(Number(e.target.value))}
                    style={{ width: '100%', background: '#151b2b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 10px', borderRadius: 6, color: '#f8fafc', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsNewOSModalOpen(false)}
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', padding: '8px 16px', borderRadius: 6, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Abrir Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESSÃO DE COMPROVANTE */}
      {isPrintModalOpen && selectedOS && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 14,
              width: '100%',
              maxWidth: 680,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Impressão de Comprovante da OS
              </h2>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#fff', color: '#0f172a', padding: 20, borderRadius: 8, fontSize: '0.8rem', lineHeight: 1.5 }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 8, marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>HIAGO iPHONES ASSISTÊNCIA TÉCNICA</h3>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#475569' }}>
                  Matriz Centro • Tel/WhatsApp: (77) 99933-4455
                </p>
                <div style={{ marginTop: 6, fontWeight: 900, fontSize: '0.9rem' }}>
                  {printDocType === 'entry' ? 'COMPROVANTE DE ENTRADA' : printDocType === 'quote' ? 'ORÇAMENTO TÉCNICO' : 'COMPROVANTE DE ENTREGA'} — {selectedOS.osNumber}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                <div><strong>Cliente:</strong> {selectedOS.customerName}</div>
                <div><strong>Telefone:</strong> {selectedOS.customerPhone}</div>
                <div><strong>Aparelho:</strong> {selectedOS.deviceModel} ({selectedOS.color || 'Padrão'})</div>
                <div><strong>IMEI:</strong> {selectedOS.imei || 'Registrado'}</div>
                <div><strong>Entrada:</strong> {selectedOS.entryDate}</div>
                <div><strong>Previsão:</strong> {selectedOS.estimatedDeliveryDate || 'A definir'}</div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, marginBottom: 8 }}>
                <strong>Defeito Relatado:</strong>
                <p style={{ margin: '2px 0 0' }}>{selectedOS.reportedIssue}</p>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, marginBottom: 8 }}>
                <strong>Condição Física na Entrada:</strong>
                <p style={{ margin: '2px 0 0' }}>{selectedOS.physicalCondition}</p>
              </div>

              <div style={{ borderTop: '1px dashed #94a3b8', paddingTop: 10, fontSize: '0.68rem', color: '#475569' }}>
                Condições: Aparelhos não retirados em até 90 dias após conclusão serão direcionados para custódia conforme a lei. A loja não se responsabiliza por dados pessoais armazenados. Recomenda-se backup prévio.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24, textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: 4, fontSize: '0.68rem' }}>Assinatura Loja</div>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: 4, fontSize: '0.68rem' }}>Assinatura Cliente</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => window.print()}
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Printer size={16} />
                Imprimir Documento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
