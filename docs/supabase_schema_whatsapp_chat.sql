-- ==============================================================================
-- HIAGO IPHONES ERP — SCHEMA CENTRAL DE ATENDIMENTO WHATSAPP 360° (RF01)
-- Tabelas: whatsapp_chats, whatsapp_messages, whatsapp_quick_replies
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE CONVERSAS / CHATS DO WHATSAPP
CREATE TABLE IF NOT EXISTS public.whatsapp_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    contact_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    assigned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_user_name VARCHAR(255) DEFAULT 'Atendente',
    department VARCHAR(50) NOT NULL DEFAULT 'vendas' CHECK (department IN ('vendas', 'assistencia', 'suporte', 'financeiro')),
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'waiting_customer', 'waiting_attendant', 'resolved', 'closed')),
    tags TEXT[] DEFAULT '{}',
    unread_count INTEGER NOT NULL DEFAULT 0,
    last_message_text TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_phone ON public.whatsapp_chats(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_status ON public.whatsapp_chats(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_department ON public.whatsapp_chats(department);
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_customer ON public.whatsapp_chats(customer_id);

-- 2. TABELA DE MENSAGENS DO WHATSAPP (HISTÓRICO AUDITÁVEL)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.whatsapp_chats(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    sender_type VARCHAR(20) NOT NULL DEFAULT 'attendant' CHECK (sender_type IN ('customer', 'attendant', 'bot', 'system')),
    sender_name VARCHAR(255) NOT NULL DEFAULT 'Atendente',
    message_text TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'document', 'audio', 'video', 'location')),
    media_url TEXT,
    external_id VARCHAR(255), -- Meta WAMID
    status VARCHAR(30) NOT NULL DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_chat_id ON public.whatsapp_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON public.whatsapp_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_external ON public.whatsapp_messages(external_id);

-- 3. TABELA DE RESPOSTAS RÁPIDAS (MACROS DE ATENDIMENTO)
CREATE TABLE IF NOT EXISTS public.whatsapp_quick_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    shortcut VARCHAR(50) NOT NULL,
    title VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'vendas' CHECK (category IN ('vendas', 'assistencia', 'financeiro', 'geral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_quick_replies_shortcut ON public.whatsapp_quick_replies(shortcut);

-- 4. INSERÇÃO DE RESPOSTAS RÁPIDAS PADRÃO
INSERT INTO public.whatsapp_quick_replies (shortcut, title, content, category)
VALUES
  ('/pix', 'Chave Pix da Loja', 'Nossa chave Pix oficial é o CNPJ: 00.000.000/0001-00 (Hiago iPhones). Após o pagamento, por favor nos envie o comprovante por aqui!', 'financeiro'),
  ('/horario', 'Horário de Funcionamento', 'Nosso atendimento presencial funciona de Segunda a Sexta das 08h30 às 18h30, e aos Sábados das 08h30 às 13h00. Aguardamos sua visita!', 'geral'),
  ('/garantia', 'Termo de Garantia de Seminovos', 'Todos os nossos iPhones seminovos contam com 90 dias de garantia total de funcionamento (exceto danos por água ou quedas acidentais), bateria inspecionada e nota de procedência.', 'vendas'),
  ('/os_pronta', 'Aparelho Pronto p/ Retirada', 'Olá! Seu aparelho já passou pelos testes finais de bancada e está 100% pronto para retirada na loja. Pode vir buscar!', 'assistencia'),
  ('/tradein', 'Avaliação de Trade-in', 'Pegamos o seu iPhone usado como parte do pagamento! Para uma pré-avaliação, nos envie o modelo, capacidade (GB), saúde da bateria e se possui caixa e marcas de uso.', 'vendas')
ON CONFLICT DO NOTHING;

-- 5. POLÍTICAS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.whatsapp_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_quick_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for whatsapp_chats" ON public.whatsapp_chats;
CREATE POLICY "Public access for whatsapp_chats" ON public.whatsapp_chats
  FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for whatsapp_messages" ON public.whatsapp_messages;
CREATE POLICY "Public access for whatsapp_messages" ON public.whatsapp_messages
  FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for whatsapp_quick_replies" ON public.whatsapp_quick_replies;
CREATE POLICY "Public access for whatsapp_quick_replies" ON public.whatsapp_quick_replies
  FOR ALL TO public USING (true) WITH CHECK (true);
