import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Send,
  CheckCheck,
  Wrench,
  ShoppingBag,
  Smartphone,
  Zap,
  CheckCircle2,
  Plus,
  ArrowRightLeft,
  X
} from 'lucide-react';
import type {
  WhatsAppChat,
  WhatsAppMessage,
  WhatsAppQuickReply,
  WhatsAppDepartment,
  WhatsAppChatStatus,
  Customer,
  Sale,
  ServiceOrder
} from '../../types.js';
import {
  getWhatsAppChats,
  getWhatsAppMessages,
  sendWhatsAppMessage,
  getOrCreateChatByPhone,
  updateWhatsAppChatStatus,
  transferWhatsAppChat,
  getWhatsAppQuickReplies
} from '../../repositories/whatsappRepository.js';

interface CrmWhatsAppChatViewProps {
  customers: Customer[];
  sales: Sale[];
  serviceOrders: ServiceOrder[];
  onNavigateToPOS?: (customerName: string) => void;
  onNavigateToAssistance?: () => void;
}

export const CrmWhatsAppChatView: React.FC<CrmWhatsAppChatViewProps> = ({
  customers,
  sales,
  serviceOrders,
  onNavigateToPOS,
  onNavigateToAssistance,
}) => {
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [activeChat, setActiveChat] = useState<WhatsAppChat | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<WhatsAppQuickReply[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('open');
  const [isSending, setIsSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Form nova conversa
  const [newChatName, setNewChatName] = useState('');
  const [newChatPhone, setNewChatPhone] = useState('');
  const [newChatDept, setNewChatDept] = useState<WhatsAppDepartment>('vendas');

  // Form transferência
  const [transferTargetUser, setTransferTargetUser] = useState('André Técnico');
  const [transferTargetDept, setTransferTargetDept] = useState<WhatsAppDepartment>('assistencia');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carrega conversas e respostas rápidas
  const loadChats = async () => {
    const data = await getWhatsAppChats();
    setChats(data);
    if (!activeChat && data.length > 0) {
      setActiveChat(data[0]);
    }
  };

  useEffect(() => {
    loadChats();
    getWhatsAppQuickReplies().then(setQuickReplies);
  }, []);

  // Carrega mensagens sempre que mudar o chat ativo
  useEffect(() => {
    if (activeChat) {
      getWhatsAppMessages(activeChat.id).then(msgs => {
        setMessages(msgs);
        scrollToBottom();
      });
    } else {
      setMessages([]);
    }
  }, [activeChat?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  // Filtragem das conversas
  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      if (departmentFilter !== 'all' && chat.department !== departmentFilter) {
        return false;
      }
      if (statusFilter === 'open' && ['resolved', 'closed'].includes(chat.status)) {
        return false;
      }
      if (statusFilter === 'resolved' && !['resolved', 'closed'].includes(chat.status)) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        const matchName = chat.contactName.toLowerCase().includes(term);
        const matchPhone = chat.phoneNumber.includes(term);
        const matchTag = chat.tags?.some(t => t.toLowerCase().includes(term));
        return Boolean(matchName || matchPhone || matchTag);
      }
      return true;
    });
  }, [chats, departmentFilter, statusFilter, searchTerm]);

  // Cliente correspondente ao chat ativo na base de clientes
  const activeCustomer = useMemo(() => {
    if (!activeChat) return null;
    const cleanPhone = activeChat.phoneNumber.replace(/\D/g, '');
    return customers.find(c => {
      const cPhone = c.phone.replace(/\D/g, '');
      return (cPhone && cleanPhone && cPhone === cleanPhone) || c.name.toLowerCase() === activeChat.contactName.toLowerCase();
    }) || null;
  }, [activeChat, customers]);

  // Vendas do cliente ativo
  const activeCustomerSales = useMemo(() => {
    if (!activeCustomer) return [];
    return sales.filter(s => {
      return (
        s.customerId === activeCustomer.id ||
        (s.customerPhone && activeCustomer.phone && s.customerPhone.replace(/\D/g, '') === activeCustomer.phone.replace(/\D/g, '')) ||
        (s.customerName && s.customerName.toLowerCase() === activeCustomer.name.toLowerCase())
      );
    });
  }, [activeCustomer, sales]);

  // OSs do cliente ativo
  const activeCustomerOrders = useMemo(() => {
    if (!activeCustomer) return [];
    return serviceOrders.filter(o => {
      return (
        o.customerId === activeCustomer.id ||
        (o.customerPhone && activeCustomer.phone && o.customerPhone.replace(/\D/g, '') === activeCustomer.phone.replace(/\D/g, '')) ||
        (o.customerName && o.customerName.toLowerCase() === activeCustomer.name.toLowerCase())
      );
    });
  }, [activeCustomer, serviceOrders]);

  // Envio de mensagem
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChat || isSending) return;

    const text = inputText;
    setInputText('');
    setShowQuickReplies(false);
    setIsSending(true);

    try {
      const sentMsg = await sendWhatsAppMessage(activeChat.id, text, 'Hiago Vendas');
      setMessages(prev => [...prev, sentMsg]);
      setChats(prev => prev.map(c => (c.id === activeChat.id ? { ...c, lastMessageText: text, lastMessageAt: 'Agora' } : c)));
      scrollToBottom();
    } finally {
      setIsSending(false);
    }
  };

  // Aplica resposta rápida
  const handleApplyQuickReply = (qr: WhatsAppQuickReply) => {
    setInputText(qr.content);
    setShowQuickReplies(false);
  };

  // Alterna status da conversa
  const handleToggleResolved = async () => {
    if (!activeChat) return;
    const newStatus: WhatsAppChatStatus = activeChat.status === 'resolved' ? 'open' : 'resolved';
    await updateWhatsAppChatStatus(activeChat.id, newStatus);
    setActiveChat({ ...activeChat, status: newStatus });
    setChats(prev => prev.map(c => (c.id === activeChat.id ? { ...c, status: newStatus } : c)));
  };

  // Transfere conversa
  const handleConfirmTransfer = async () => {
    if (!activeChat) return;
    await transferWhatsAppChat(activeChat.id, transferTargetUser, transferTargetDept);
    setActiveChat({ ...activeChat, assignedUserName: transferTargetUser, department: transferTargetDept });
    setChats(prev => prev.map(c => (c.id === activeChat.id ? { ...c, assignedUserName: transferTargetUser, department: transferTargetDept } : c)));
    setShowTransferModal(false);
  };

  // Inicia nova conversa
  const handleCreateNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatPhone.trim()) return;
    const created = await getOrCreateChatByPhone(newChatName || 'Novo Contato', newChatPhone, newChatDept);
    await loadChats();
    setActiveChat(created);
    setShowNewChatModal(false);
    setNewChatName('');
    setNewChatPhone('');
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 340px',
        gap: 12,
        height: 'calc(100vh - 170px)',
        minHeight: 580,
      }}
    >
      {/* ======================================================== */}
      {/* COLUNA 1: LISTA DE CONVERSAS (INBOX MULTIUSUÁRIO) */}
      {/* ======================================================== */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Topo da Lista */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111827' }}>
              Central WhatsApp
            </span>
            <button
              onClick={() => setShowNewChatModal(true)}
              style={{
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Plus size={12} />
              <span>Nova</span>
            </button>
          </div>

          {/* Campo de Busca */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              padding: '6px 10px',
            }}
          >
            <Search size={14} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Buscar por contato ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.8125rem',
                width: '100%',
                color: '#111827',
              }}
            />
          </div>

          {/* Filtros de Departamento & Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 4,
                padding: '4px 6px',
                fontSize: '0.75rem',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                flex: 1,
              }}
            >
              <option value="all">Departamentos (Todos)</option>
              <option value="vendas">Vendas</option>
              <option value="assistencia">Assistência Técnica</option>
              <option value="financeiro">Financeiro</option>
            </select>

            <button
              onClick={() => setStatusFilter(statusFilter === 'open' ? 'resolved' : 'open')}
              style={{
                border: '1px solid #E5E7EB',
                backgroundColor: statusFilter === 'open' ? '#EFF6FF' : '#F3F4F6',
                color: statusFilter === 'open' ? '#2563EB' : '#4B5563',
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '5px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {statusFilter === 'open' ? 'Abertas' : 'Resolvidas'}
            </button>
          </div>
        </div>

        {/* Lista Rolável de Chats */}
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {filteredChats.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', fontSize: '0.8125rem', color: '#9CA3AF' }}>
              Nenhuma conversa encontrada
            </div>
          ) : (
            filteredChats.map(chat => {
              const isSelected = activeChat?.id === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid #F3F4F6',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                    borderLeft: isSelected ? '3px solid #16A34A' : '3px solid transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: isSelected ? 700 : 600, color: '#111827' }}>
                      {chat.contactName}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>
                      {chat.lastMessageAt || ''}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.lastMessageText || 'Sem mensagens'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 3,
                          backgroundColor: chat.department === 'assistencia' ? '#FEE2E2' : chat.department === 'financeiro' ? '#FEF3C7' : '#DCFCE7',
                          color: chat.department === 'assistencia' ? '#DC2626' : chat.department === 'financeiro' ? '#D97706' : '#16A34A',
                          textTransform: 'uppercase',
                        }}
                      >
                        {chat.department}
                      </span>
                      {chat.tags?.[0] && (
                        <span style={{ fontSize: '0.625rem', color: '#6B7280', backgroundColor: '#F3F4F6', padding: '1px 5px', borderRadius: 3 }}>
                          {chat.tags[0]}
                        </span>
                      )}
                    </div>

                    {chat.unreadCount > 0 && (
                      <span
                        style={{
                          backgroundColor: '#16A34A',
                          color: '#FFFFFF',
                          borderRadius: '50%',
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          width: 16,
                          height: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* COLUNA 2: ÁREA DE CHAT ATIVO COM BALÕES EM TEMPO REAL */}
      {/* ======================================================== */}
      {activeChat ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Cabeçalho do Chat Ativo */}
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                {activeChat.contactName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827' }}>
                    {activeChat.contactName}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: '#6B7280' }}>
                    ({activeChat.phoneNumber})
                  </span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>Atendente: <strong>{activeChat.assignedUserName || 'Não atribuído'}</strong></span>
                  <span>•</span>
                  <span>Depto: <strong>{activeChat.department}</strong></span>
                </div>
              </div>
            </div>

            {/* Ações do Atendimento */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setShowTransferModal(true)}
                title="Transferir atendimento para outro atendente ou departamento"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  color: '#374151',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ArrowRightLeft size={13} />
                <span>Transferir</span>
              </button>

              <button
                onClick={handleToggleResolved}
                style={{
                  backgroundColor: activeChat.status === 'resolved' ? '#EFF6FF' : '#DCFCE7',
                  border: `1px solid ${activeChat.status === 'resolved' ? '#93C5FD' : '#86EFAC'}`,
                  color: activeChat.status === 'resolved' ? '#1D4ED8' : '#15803D',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <CheckCircle2 size={13} />
                <span>{activeChat.status === 'resolved' ? 'Reabrir' : 'Concluir Atendimento'}</span>
              </button>
            </div>
          </div>

          {/* Área de Mensagens com Balões */}
          <div
            style={{
              flex: 1,
              padding: '16px 20px',
              overflowY: 'auto',
              backgroundColor: '#ECE5DD', // Cor de fundo padrão do WhatsApp
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto', color: '#6B7280', fontSize: '0.8125rem' }}>
                Nenhuma mensagem nesta conversa ainda. Digite uma mensagem abaixo para iniciar.
              </div>
            ) : (
              messages.map(msg => {
                const isOutbound = msg.direction === 'outbound';

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isOutbound ? 'flex-end' : 'flex-start',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        backgroundColor: isOutbound ? '#D9FDD3' : '#FFFFFF',
                        boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                      }}
                    >
                      {!isOutbound && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#16A34A' }}>
                          {msg.senderName}
                        </span>
                      )}

                      <span style={{ fontSize: '0.8125rem', color: '#111827', lineHeight: 1.4, wordBreak: 'break-word' }}>
                        {msg.messageText}
                      </span>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: '0.625rem', color: '#6B7280' }}>
                          {msg.createdAt}
                        </span>
                        {isOutbound && (
                          <CheckCheck size={12} color={msg.status === 'read' ? '#2563EB' : '#6B7280'} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Barra de Respostas Rápidas (Pop-up se ativo) */}
          {showQuickReplies && (
            <div
              style={{
                borderTop: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB',
                padding: '8px 12px',
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
              }}
            >
              {quickReplies.map(qr => (
                <button
                  key={qr.id}
                  onClick={() => handleApplyQuickReply(qr)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#374151',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ color: '#2563EB', fontWeight: 700 }}>{qr.shortcut}</span>
                  <span>{qr.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Barra Inferior de Envio */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '10px 14px',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              title="Respostas Rápidas (/pix, /garantia, /os_pronta)"
              style={{
                backgroundColor: showQuickReplies ? '#EFF6FF' : '#F3F4F6',
                border: '1px solid #E5E7EB',
                color: showQuickReplies ? '#2563EB' : '#4B5563',
                borderRadius: 6,
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              <Zap size={14} />
              <span>Macros</span>
            </button>

            <input
              type="text"
              placeholder="Digite sua mensagem (pressione Enter para enviar)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: '0.8125rem',
                outline: 'none',
                color: '#111827',
              }}
            />

            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              style={{
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                cursor: isSending || !inputText.trim() ? 'not-allowed' : 'pointer',
                opacity: isSending || !inputText.trim() ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              <Send size={14} />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9CA3AF',
            fontSize: '0.875rem',
          }}
        >
          Selecione uma conversa para iniciar o atendimento
        </div>
      )}

      {/* ======================================================== */}
      {/* COLUNA 3: FICHA 360° CONTEXTUAL DO CLIENTE */}
      {/* ======================================================== */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '14px 16px',
          gap: 14,
        }}
      >
        <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: 10 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>
            Contexto 360° do Cliente
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: '4px 0 0' }}>
            {activeChat?.contactName || 'Nenhum selecionado'}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
            {activeChat?.phoneNumber}
          </span>
        </div>

        {/* LTV & Histórico Financeiro */}
        {activeCustomer && (
          <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: 10 }}>
            <span style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Gasto (LTV)</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
              R$ {activeCustomer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}

        {/* Ações Rápidas ERP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {onNavigateToPOS && (
            <button
              onClick={() => onNavigateToPOS(activeChat?.contactName || '')}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <ShoppingBag size={14} />
              <span>Iniciar Venda no PDV</span>
            </button>
          )}

          {onNavigateToAssistance && (
            <button
              onClick={onNavigateToAssistance}
              style={{
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Wrench size={14} />
              <span>Abrir OS na Assistência</span>
            </button>
          )}
        </div>

        {/* Aparelhos em Posse */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Smartphone size={14} color="#2563EB" />
            Aparelhos do Cliente ({activeCustomer?.purchasedDevices?.length || 0})
          </span>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeCustomer && activeCustomer.purchasedDevices?.length > 0 ? (
              activeCustomer.purchasedDevices.map((dev, idx) => (
                <div key={dev.imei || idx} style={{ border: '1px solid #E5E7EB', borderRadius: 4, padding: 8, fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{dev.model}</div>
                  <div style={{ color: '#6B7280', fontSize: '0.6875rem' }}>
                    IMEI: {dev.imei || 'S/N'} • Bateria: {dev.batteryHealth ? `${dev.batteryHealth}%` : 'N/D'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Nenhum aparelho registrado</div>
            )}
          </div>
        </div>

        {/* Ordens de Serviço Ativas */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wrench size={14} color="#F59E0B" />
            Assistência Técnica ({activeCustomerOrders.length})
          </span>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeCustomerOrders.length > 0 ? (
              activeCustomerOrders.slice(0, 3).map(os => (
                <div key={os.id} style={{ border: '1px solid #E5E7EB', borderRadius: 4, padding: 8, fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>OS {os.osNumber} ({os.deviceModel})</div>
                  <div style={{ color: '#2563EB', fontSize: '0.6875rem' }}>Status: {os.status}</div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Nenhuma OS vinculada</div>
            )}
          </div>
        </div>

        {/* Compras Recentes */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShoppingBag size={14} color="#10B981" />
            Últimas Compras ({activeCustomerSales.length})
          </span>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeCustomerSales.length > 0 ? (
              activeCustomerSales.slice(0, 3).map(sale => (
                <div key={sale.id} style={{ border: '1px solid #E5E7EB', borderRadius: 4, padding: 8, fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>Venda #{sale.saleNumber || sale.id.slice(0, 6)}</div>
                  <div style={{ color: '#10B981', fontWeight: 700, fontSize: '0.6875rem' }}>
                    R$ {(sale.total ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Nenhuma venda recente</div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL TRANSFERÊNCIA DE ATENDIMENTO */}
      {/* ======================================================== */}
      {showTransferModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 8, width: '100%', maxWidth: 420, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>Transferir Atendimento</h3>
              <button onClick={() => setShowTransferModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#6B7280" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Atendente de Destino:</label>
                <select
                  value={transferTargetUser}
                  onChange={(e) => setTransferTargetUser(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #E5E7EB', marginTop: 4, fontSize: '0.8125rem' }}
                >
                  <option value="Hiago Vendas">Hiago Vendas</option>
                  <option value="André Técnico">André Técnico</option>
                  <option value="Gerente Geral">Gerente Geral</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Departamento:</label>
                <select
                  value={transferTargetDept}
                  onChange={(e) => setTransferTargetDept(e.target.value as WhatsAppDepartment)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #E5E7EB', marginTop: 4, fontSize: '0.8125rem' }}
                >
                  <option value="vendas">Vendas</option>
                  <option value="assistencia">Assistência Técnica</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="suporte">Suporte</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button onClick={() => setShowTransferModal(false)} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#F3F4F6', fontSize: '0.8125rem', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleConfirmTransfer} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
                Confirmar Transferência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL INICIAR NOVA CONVERSA */}
      {/* ======================================================== */}
      {showNewChatModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <form onSubmit={handleCreateNewChat} style={{ backgroundColor: '#FFFFFF', borderRadius: 8, width: '100%', maxWidth: 420, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>Nova Conversa WhatsApp</h3>
              <button type="button" onClick={() => setShowNewChatModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#6B7280" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Nome do Contato:</label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #E5E7EB', marginTop: 4, fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Telefone / WhatsApp *:</label>
                <input
                  type="text"
                  placeholder="(77) 99999-0000"
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #E5E7EB', marginTop: 4, fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Departamento Inicial:</label>
                <select
                  value={newChatDept}
                  onChange={(e) => setNewChatDept(e.target.value as WhatsAppDepartment)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #E5E7EB', marginTop: 4, fontSize: '0.8125rem' }}
                >
                  <option value="vendas">Vendas</option>
                  <option value="assistencia">Assistência Técnica</option>
                  <option value="financeiro">Financeiro</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => setShowNewChatModal(false)} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#F3F4F6', fontSize: '0.8125rem', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#16A34A', color: '#FFFFFF', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
                Iniciar Atendimento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
