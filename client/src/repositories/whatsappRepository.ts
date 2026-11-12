import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js';
import type { WhatsAppChat, WhatsAppMessage, WhatsAppQuickReply, WhatsAppChatStatus, WhatsAppDepartment } from '../types.js';

const CHATS_STORAGE_KEY = 'hiago_crm_whatsapp_chats';
const MESSAGES_STORAGE_KEY = 'hiago_crm_whatsapp_messages';

// Dados iniciais padrão de atendimento da loja para demonstração e fallback
const INITIAL_CHATS: WhatsAppChat[] = [
  {
    id: 'chat-001',
    contactName: 'Matheus Oliveira',
    phoneNumber: '(77) 99876-5432',
    department: 'vendas',
    status: 'open',
    assignedUserName: 'Hiago Vendas',
    tags: ['Interesse iPhone 14', 'Trade-in'],
    unreadCount: 1,
    lastMessageText: 'Qual o valor que você paga no meu iPhone 11 64GB na troca?',
    lastMessageAt: '15:20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chat-002',
    contactName: 'Camila Fernandes',
    phoneNumber: '(77) 98112-3344',
    department: 'assistencia',
    status: 'waiting_customer',
    assignedUserName: 'André Técnico',
    tags: ['OS #1042', 'Troca de Tela'],
    unreadCount: 0,
    lastMessageText: 'Perfeito André, pode trocar a tela com o display original!',
    lastMessageAt: '14:45',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chat-003',
    contactName: 'Lucas Rodrigues',
    phoneNumber: '(77) 99123-8899',
    department: 'vendas',
    status: 'waiting_attendant',
    assignedUserName: 'Hiago Vendas',
    tags: ['Novo Lead', 'Instagram'],
    unreadCount: 2,
    lastMessageText: 'Tem iPhone 13 128GB disponível na loja hoje?',
    lastMessageAt: '13:10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chat-004',
    contactName: 'Bruna Vasconcelos',
    phoneNumber: '(77) 99988-7711',
    department: 'financeiro',
    status: 'resolved',
    assignedUserName: 'Hiago Vendas',
    tags: ['Comprovante Pix', 'Venda #1089'],
    unreadCount: 0,
    lastMessageText: 'Comprovante recebido! Já estamos preparando o seu aparelho.',
    lastMessageAt: 'Ontem',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_MESSAGES: Record<string, WhatsAppMessage[]> = {
  'chat-001': [
    {
      id: 'msg-101',
      chatId: 'chat-001',
      direction: 'inbound',
      senderType: 'customer',
      senderName: 'Matheus Oliveira',
      messageText: 'Boa tarde! Vi no Instagram que vocês estão com promoção de iPhone 14 128GB.',
      mediaType: 'text',
      status: 'read',
      createdAt: '15:10',
    },
    {
      id: 'msg-102',
      chatId: 'chat-001',
      direction: 'outbound',
      senderType: 'attendant',
      senderName: 'Hiago Vendas',
      messageText: 'Olá Matheus, tudo bem? Temos sim! Temos opções em excelente estado com bateria 90%+ e 90 dias de garantia.',
      mediaType: 'text',
      status: 'read',
      createdAt: '15:12',
    },
    {
      id: 'msg-103',
      chatId: 'chat-001',
      direction: 'inbound',
      senderType: 'customer',
      senderName: 'Matheus Oliveira',
      messageText: 'Qual o valor que você paga no meu iPhone 11 64GB na troca?',
      mediaType: 'text',
      status: 'delivered',
      createdAt: '15:20',
    },
  ],
  'chat-002': [
    {
      id: 'msg-201',
      chatId: 'chat-002',
      direction: 'outbound',
      senderType: 'attendant',
      senderName: 'André Técnico',
      messageText: 'Olá Camila! Concluímos a avaliação do seu iPhone 12. O orçamento da tela original ficou em R$ 450,00 com 90 dias de garantia.',
      mediaType: 'text',
      status: 'read',
      createdAt: '14:30',
    },
    {
      id: 'msg-202',
      chatId: 'chat-002',
      direction: 'inbound',
      senderType: 'customer',
      senderName: 'Camila Fernandes',
      messageText: 'Perfeito André, pode trocar a tela com o display original!',
      mediaType: 'text',
      status: 'read',
      createdAt: '14:45',
    },
  ],
  'chat-003': [
    {
      id: 'msg-301',
      chatId: 'chat-003',
      direction: 'inbound',
      senderType: 'customer',
      senderName: 'Lucas Rodrigues',
      messageText: 'Olá! Boa tarde!',
      mediaType: 'text',
      status: 'delivered',
      createdAt: '13:08',
    },
    {
      id: 'msg-302',
      chatId: 'chat-003',
      direction: 'inbound',
      senderType: 'customer',
      senderName: 'Lucas Rodrigues',
      messageText: 'Tem iPhone 13 128GB disponível na loja hoje?',
      mediaType: 'text',
      status: 'delivered',
      createdAt: '13:10',
    },
  ],
};

const DEFAULT_QUICK_REPLIES: WhatsAppQuickReply[] = [
  {
    id: 'qr-1',
    shortcut: '/pix',
    title: 'Chave Pix Oficial',
    content: 'Nossa chave Pix oficial é o CNPJ da loja (Hiago iPhones). Por gentileza, nos envie o comprovante por aqui assim que concluir!',
    category: 'financeiro',
  },
  {
    id: 'qr-2',
    shortcut: '/garantia',
    title: 'Termo de Garantia de Seminovos',
    content: 'Todos os nossos iPhones seminovos contam com 90 dias de garantia total de funcionamento, bateria inspecionada acima de 85% e certificado de procedência.',
    category: 'vendas',
  },
  {
    id: 'qr-3',
    shortcut: '/os_pronta',
    title: 'Aparelho Pronto p/ Retirada',
    content: 'Olá! Seu aparelho já passou pelos testes finais na bancada e está 100% pronto para retirada na nossa loja física. Aguardamos sua visita!',
    category: 'assistencia',
  },
  {
    id: 'qr-4',
    shortcut: '/tradein',
    title: 'Avaliação de Usado (Trade-in)',
    content: 'Pegamos o seu usado como entrada! Para fazer uma pré-avaliação, nos informe: Modelo, capacidade (GB), saúde da bateria e se possui marcas ou trincos.',
    category: 'vendas',
  },
  {
    id: 'qr-5',
    shortcut: '/horario',
    title: 'Horário de Funcionamento',
    content: 'Atendemos presencialmente de Segunda a Sexta das 08h30 às 18h30 e aos Sábados das 08h30 às 13h00.',
    category: 'geral',
  },
];

// Helper local storage
function getLocalChats(): WhatsAppChat[] {
  try {
    const raw = localStorage.getItem(CHATS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(INITIAL_CHATS));
      return INITIAL_CHATS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CHATS;
  }
}

function setLocalChats(chats: WhatsAppChat[]): void {
  try {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  } catch (err) {
    console.error('Falha ao salvar chats locais:', err);
  }
}

function getLocalMessages(chatId: string): WhatsAppMessage[] {
  try {
    const raw = localStorage.getItem(`${MESSAGES_STORAGE_KEY}_${chatId}`);
    if (!raw) {
      const initial = INITIAL_MESSAGES[chatId] || [];
      localStorage.setItem(`${MESSAGES_STORAGE_KEY}_${chatId}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MESSAGES[chatId] || [];
  }
}

function setLocalMessages(chatId: string, messages: WhatsAppMessage[]): void {
  try {
    localStorage.setItem(`${MESSAGES_STORAGE_KEY}_${chatId}`, JSON.stringify(messages));
  } catch (err) {
    console.error('Falha ao salvar mensagens locais:', err);
  }
}

/**
 * Busca todas as conversas do WhatsApp (com filtro opcional por status ou departamento)
 */
export async function getWhatsAppChats(): Promise<WhatsAppChat[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_chats')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          storeId: row.store_id,
          customerId: row.customer_id,
          contactName: row.contact_name,
          phoneNumber: row.phone_number,
          assignedUserId: row.assigned_user_id,
          assignedUserName: row.assigned_user_name,
          department: row.department,
          status: row.status,
          tags: row.tags || [],
          unreadCount: row.unread_count || 0,
          lastMessageText: row.last_message_text,
          lastMessageAt: row.last_message_at ? new Date(row.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Fallback para cache local de chats:', err);
    }
  }

  return getLocalChats();
}

/**
 * Busca o histórico de mensagens de uma conversa específica
 */
export async function getWhatsAppMessages(chatId: string): Promise<WhatsAppMessage[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          chatId: row.chat_id,
          direction: row.direction,
          senderType: row.sender_type,
          senderName: row.sender_name,
          messageText: row.message_text,
          mediaType: row.media_type || 'text',
          mediaUrl: row.media_url,
          externalId: row.external_id,
          status: row.status,
          createdAt: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
      }
    } catch (err) {
      console.warn('Fallback para cache local de mensagens:', err);
    }
  }

  return getLocalMessages(chatId);
}

/**
 * Envia uma nova mensagem na conversa ativa (Outbound)
 */
export async function sendWhatsAppMessage(
  chatId: string,
  messageText: string,
  senderName: string = 'Hiago Vendas'
): Promise<WhatsAppMessage> {
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newMessage: WhatsAppMessage = {
    id: `msg-${Date.now()}`,
    chatId,
    direction: 'outbound',
    senderType: 'attendant',
    senderName,
    messageText: messageText.trim(),
    mediaType: 'text',
    status: 'sent',
    createdAt: timeNow,
  };

  // 1. Persistência no Supabase se disponível
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .insert({
          chat_id: chatId,
          direction: 'outbound',
          sender_type: 'attendant',
          sender_name: senderName,
          message_text: messageText.trim(),
          media_type: 'text',
          status: 'sent',
        })
        .select()
        .single();

      if (!error && data) {
        newMessage.id = data.id;
      }

      // Atualiza o chat pai
      await supabase
        .from('whatsapp_chats')
        .update({
          last_message_text: messageText.trim(),
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatId);
    } catch (err) {
      console.warn('Erro ao salvar mensagem no Supabase, mantendo localmente:', err);
    }
  }

  // 2. Atualiza cache local
  const currentMessages = getLocalMessages(chatId);
  setLocalMessages(chatId, [...currentMessages, newMessage]);

  const currentChats = getLocalChats();
  const updatedChats = currentChats.map(c => {
    if (c.id === chatId) {
      return {
        ...c,
        lastMessageText: messageText.trim(),
        lastMessageAt: timeNow,
        updatedAt: new Date().toISOString(),
      };
    }
    return c;
  });
  setLocalChats(updatedChats);

  return newMessage;
}

/**
 * Inicia ou localiza uma conversa pelo telefone
 */
export async function getOrCreateChatByPhone(
  contactName: string,
  phoneNumber: string,
  department: WhatsAppDepartment = 'vendas'
): Promise<WhatsAppChat> {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const existingChats = await getWhatsAppChats();
  const found = existingChats.find(c => c.phoneNumber.replace(/\D/g, '') === cleanPhone);

  if (found) {
    return found;
  }

  const newChat: WhatsAppChat = {
    id: `chat-${Date.now()}`,
    contactName: contactName.trim() || 'Cliente WhatsApp',
    phoneNumber: phoneNumber.trim(),
    department,
    status: 'open',
    assignedUserName: 'Hiago Vendas',
    tags: ['Atendimento Iniciado'],
    unreadCount: 0,
    lastMessageText: 'Conversa iniciada',
    lastMessageAt: 'Agora',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_chats')
        .insert({
          contact_name: newChat.contactName,
          phone_number: newChat.phoneNumber,
          department: newChat.department,
          status: 'open',
          assigned_user_name: 'Hiago Vendas',
          tags: ['Atendimento Iniciado'],
          last_message_text: 'Conversa iniciada',
        })
        .select()
        .single();

      if (!error && data) {
        newChat.id = data.id;
      }
    } catch (err) {
      console.warn('Falha ao inserir chat no Supabase:', err);
    }
  }

  const currentChats = getLocalChats();
  setLocalChats([newChat, ...currentChats]);

  return newChat;
}

/**
 * Atualiza o status do atendimento (Ex: 'open' -> 'resolved')
 */
export async function updateWhatsAppChatStatus(
  chatId: string,
  status: WhatsAppChatStatus
): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('whatsapp_chats')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', chatId);
    } catch (err) {
      console.warn('Erro ao atualizar status do chat no Supabase:', err);
    }
  }

  const chats = getLocalChats();
  setLocalChats(chats.map(c => (c.id === chatId ? { ...c, status, updatedAt: new Date().toISOString() } : c)));
}

/**
 * Transfere o atendimento para outro atendente ou departamento
 */
export async function transferWhatsAppChat(
  chatId: string,
  assignedUserName: string,
  department: WhatsAppDepartment
): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('whatsapp_chats')
        .update({
          assigned_user_name: assignedUserName,
          department,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatId);
    } catch (err) {
      console.warn('Erro ao transferir chat no Supabase:', err);
    }
  }

  const chats = getLocalChats();
  setLocalChats(chats.map(c => (c.id === chatId ? { ...c, assignedUserName, department, updatedAt: new Date().toISOString() } : c)));
}

/**
 * Busca respostas rápidas pré-configuradas (macros)
 */
export async function getWhatsAppQuickReplies(): Promise<WhatsAppQuickReply[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_quick_replies')
        .select('*')
        .order('shortcut', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          shortcut: row.shortcut,
          title: row.title,
          content: row.content,
          category: row.category,
        }));
      }
    } catch (err) {
      console.warn('Fallback para quick replies locais:', err);
    }
  }

  return DEFAULT_QUICK_REPLIES;
}

