-- ==============================================================================
-- HIAGO IPHONES ERP — CRIAÇÃO DAS TABELAS DO WHATSAPP 360° E CRM NO SUPABASE
-- Projeto: https://bytmvqvydxealupmvlme.supabase.co
-- Copie e cole este script no SQL Editor do seu painel Supabase e clique em RUN
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE CONVERSAS DO WHATSAPP (INBOX MULTIATENDENTE)
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

-- 2. TABELA DE MENSAGENS DO WHATSAPP (HISTÓRICO AUDITÁVEL)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.whatsapp_chats(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    sender_type VARCHAR(20) NOT NULL DEFAULT 'attendant' CHECK (sender_type IN ('customer', 'attendant', 'bot', 'system')),
    sender_name VARCHAR(255) NOT NULL DEFAULT 'Atendente',
    message_text TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL DEFAULT 'text',
    media_url TEXT,
    external_id VARCHAR(255), -- Meta WAMID
    status VARCHAR(30) NOT NULL DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_chat_id ON public.whatsapp_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_external ON public.whatsapp_messages(external_id);

-- 3. TABELA DE RESPOSTAS RÁPIDAS (MACROS DO TECLADO: /pix, /garantia, /tradein)
CREATE TABLE IF NOT EXISTS public.whatsapp_quick_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    shortcut VARCHAR(50) NOT NULL,
    title VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'vendas',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE FILA DE AUTOMAÇÕES OPERACIONAIS (HUMAN-IN-THE-LOOP)
CREATE TABLE IF NOT EXISTS public.crm_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    trigger_type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    target_name VARCHAR(255) NOT NULL,
    target_phone VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    suggested_message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE,
    executed_by VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_crm_automations_status ON public.crm_automations(status);

-- 5. TABELA DE EMBAIXADORES / PROGRAMA DE INDICAÇÃO MEMBER-GET-MEMBER (ÉPICO 10)
CREATE TABLE IF NOT EXISTS public.crm_ambassadors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    device_bought VARCHAR(150) NOT NULL,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    referral_link TEXT NOT NULL,
    friends_invited INTEGER DEFAULT 0,
    friends_converted INTEGER DEFAULT 0,
    total_reward_earned NUMERIC(10, 2) DEFAULT 0.00,
    pending_reward NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. HABILITAÇÃO DE ROW LEVEL SECURITY (RLS) COM POLÍTICAS DE ACESSO
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'whatsapp_chats', 'whatsapp_messages', 'whatsapp_quick_replies',
        'crm_automations', 'crm_ambassadors'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public access for %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access for %I" ON public.%I FOR ALL TO public USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END;
$$;

-- 7. SEEDS DE RESPOSTAS RÁPIDAS PADRÃO
INSERT INTO public.whatsapp_quick_replies (shortcut, title, content, category)
VALUES
  ('/pix', 'Chave Pix da Loja', 'Nossa chave Pix oficial CNPJ é: 44.123.456/0001-89 (Hiago iPhones Comércio). Por favor envie o comprovante por aqui assim que efetuar o pagamento! 📱✨', 'vendas'),
  ('/garantia', 'Termo de Garantia 90 Dias', 'Todos os nossos iPhones seminovos possuem garantia legal de 90 dias com cobertura total para funcionamento de placa, tela, câmeras e conectores. Aparelhos 100% testados em bancada!', 'vendas'),
  ('/os_pronta', 'Aparelho Pronto para Retirada', 'Olá! O seu iPhone já concluiu todos os reparos e testes de bancada. Já está pronto, higienizado e disponível para retirada na nossa loja física! Ficamos no aguardo da sua visita.', 'assistencia'),
  ('/tradein', 'Avaliação de Usado na Troca', 'Aceitamos seu iPhone usado como parte do pagamento! Para fazermos a pré-avaliação, por favor me informe: 1. Qual o modelo? 2. Quantos GB? 3. Qual a saúde da bateria nas configurações? 4. Possui alguma marca ou detalhe estético?', 'vendas'),
  ('/horario', 'Horário de Funcionamento', 'Nosso horário de atendimento é de Segunda a Sexta das 08h30 às 18h30, e aos Sábados das 08h30 às 13h00. Venha nos visitar e tomar um café conosco! ☕', 'geral')
ON CONFLICT DO NOTHING;
