-- ==============================================================================
-- HIAGO IPHONES ERP — MASTER CONSOLIDATED DATABASE SCHEMA (V2.4.0)
-- Plataforma SaaS de CRM, Aceleração Comercial & WhatsApp 360°
-- Executar no SQL Editor do Supabase (100% Idempotente e Seguro)
-- ==============================================================================

-- 1. Habilita extensões fundamentais
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABELAS FUNDAMENTAIS (CORE MULTI-TENANT & LOJA)
-- ==============================================================================

-- 2.1 Lojas (Multi-unidade)
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'Hiago iPhones',
    cnpj_cpf VARCHAR(20),
    whatsapp VARCHAR(25) DEFAULT '77 98844-2211',
    pix_key VARCHAR(100),
    address TEXT DEFAULT 'Vitória da Conquista - BA',
    warranty_terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Usuários e Operadores (RBAC)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(30) NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'gerente', 'vendedor', 'tecnico')),
    pin_code VARCHAR(10) DEFAULT '1234',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 Clientes (CRM 360°)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    cpf VARCHAR(20),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- 2.4 Estoque Inteligente de iPhones por IMEI
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    imei VARCHAR(20) UNIQUE NOT NULL,
    serial_number VARCHAR(50),
    brand VARCHAR(50) NOT NULL DEFAULT 'Apple',
    model VARCHAR(100) NOT NULL,
    storage VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    condition VARCHAR(30) NOT NULL DEFAULT 'certified_pre_owned' CHECK (condition IN ('new_sealed', 'certified_pre_owned')),
    battery_health INTEGER CHECK (battery_health IS NULL OR (battery_health >= 40 AND battery_health <= 100)),
    aesthetic_grade VARCHAR(10) DEFAULT 'A+',
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    supplier VARCHAR(150) DEFAULT 'Distribuidor SP Import',
    location VARCHAR(100) DEFAULT 'Vitrine Principal',
    status VARCHAR(30) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'showcase', 'reserved', 'sold', 'warranty', 'in_technical_service', 'returned_to_supplier')),
    is_showcase_public BOOLEAN DEFAULT TRUE,
    is_showcase_featured BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_devices_imei ON public.devices(imei);
CREATE INDEX IF NOT EXISTS idx_devices_status ON public.devices(status);

-- 2.5 Vendas e Histórico Comercial
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    seller_name VARCHAR(255) NOT NULL DEFAULT 'Lucas Vendedor',
    total_amount NUMERIC(12, 2) NOT NULL,
    trade_in_value NUMERIC(10, 2) DEFAULT 0.00,
    pix_amount NUMERIC(10, 2) DEFAULT 0.00,
    card_amount NUMERIC(10, 2) DEFAULT 0.00,
    card_installments INTEGER DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'canceled', 'refunded')),
    warranty_days INTEGER DEFAULT 90,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.6 Itens da Venda (Aparelhos e Acessórios)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    item_type VARCHAR(20) NOT NULL DEFAULT 'device' CHECK (item_type IN ('device', 'accessory', 'service')),
    description VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.7 Ordens de Serviço (Assistência Técnica de Bancada)
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    os_number SERIAL,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    device_model VARCHAR(100) NOT NULL,
    imei_or_serial VARCHAR(50),
    issue_reported TEXT NOT NULL,
    technical_diagnosis TEXT,
    labor_cost NUMERIC(10, 2) DEFAULT 0.00,
    parts_cost NUMERIC(10, 2) DEFAULT 0.00,
    final_value NUMERIC(10, 2) DEFAULT 0.00,
    technician_name VARCHAR(255) DEFAULT 'André Técnico',
    status VARCHAR(30) NOT NULL DEFAULT 'check_in' CHECK (status IN ('check_in', 'diagnosis', 'awaiting_approval', 'in_repair', 'testing', 'ready_for_pickup', 'delivered', 'canceled')),
    warranty_terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.8 Sessões e Movimentações de Caixa
CREATE TABLE IF NOT EXISTS public.cash_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    operator_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    initial_float NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_sales NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================================================
-- 3. CENTRAL DE ATENDIMENTO WHATSAPP 360° (RF01 - RF04)
-- ==============================================================================

-- 3.1 Conversas do WhatsApp (Inbox Multiatendente)
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

-- 3.2 Mensagens do WhatsApp
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

-- 3.3 Respostas Rápidas (Macros de Balcão)
CREATE TABLE IF NOT EXISTS public.whatsapp_quick_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    shortcut VARCHAR(50) NOT NULL,
    title VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'vendas',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. RÉGUAS AUTOMÁTICAS & PROGRAMA DE INDICAÇÃO (ÉPICOS 09 E 10)
-- ==============================================================================

-- 4.1 Fila de Automações Operacionais (Human-in-the-Loop)
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

-- 4.2 Programa de Embaixadores / Member-Get-Member (Épico 10)
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

-- ==============================================================================
-- 5. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'stores', 'users', 'customers', 'devices', 'sales', 'sale_items',
        'service_orders', 'cash_registers', 'whatsapp_chats', 'whatsapp_messages',
        'whatsapp_quick_replies', 'crm_automations', 'crm_ambassadors'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public access for %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access for %I" ON public.%I FOR ALL TO public USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END;
$$;

-- ==============================================================================
-- 6. CARGA INICIAL (SEEDS OFICIAIS HIAGO IPHONES)
-- ==============================================================================

-- 6.1 Loja Oficial
INSERT INTO public.stores (id, name, whatsapp, pix_key, address)
VALUES ('00000000-0000-0000-0000-000000000001', 'Hiago iPhones', '77 98844-2211', 'hiago@iphones.com.br', 'Vitória da Conquista - BA')
ON CONFLICT (id) DO NOTHING;

-- 6.2 Usuários da Equipe
INSERT INTO public.users (store_id, name, email, role, pin_code)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Hiago (Dono)', 'hiago@loja.com', 'admin', '1234'),
  ('00000000-0000-0000-0000-000000000001', 'Camila Gerente', 'camila@loja.com', 'gerente', '2222'),
  ('00000000-0000-0000-0000-000000000001', 'Lucas Vendedor', 'lucas@loja.com', 'vendedor', '3333'),
  ('00000000-0000-0000-0000-000000000001', 'André Técnico', 'andre@loja.com', 'tecnico', '4444')
ON CONFLICT DO NOTHING;

-- 6.3 Respostas Rápidas do WhatsApp
INSERT INTO public.whatsapp_quick_replies (store_id, shortcut, title, content, category)
VALUES
  ('00000000-0000-0000-0000-000000000001', '/pix', 'Chave Pix da Loja', 'Nossa chave Pix oficial CNPJ é: 44.123.456/0001-89 (Hiago iPhones Comércio). Por favor envie o comprovante por aqui assim que efetuar o pagamento! 📱✨', 'vendas'),
  ('00000000-0000-0000-0000-000000000001', '/garantia', 'Termo de Garantia 90 Dias', 'Todos os nossos iPhones seminovos possuem garantia legal de 90 dias com cobertura total para funcionamento de placa, tela, câmeras e conectores. Aparelhos 100% testados em bancada!', 'vendas'),
  ('00000000-0000-0000-0000-000000000001', '/os_pronta', 'Aparelho Pronto para Retirada', 'Olá! O seu iPhone já concluiu todos os reparos e testes de bancada. Já está pronto, higienizado e disponível para retirada na nossa loja física! Ficamos no aguardo da sua visita.', 'assistencia'),
  ('00000000-0000-0000-0000-000000000001', '/tradein', 'Avaliação de Usado na Troca', 'Aceitamos seu iPhone usado como parte do pagamento! Para fazermos a pré-avaliação, por favor me informe: 1. Qual o modelo? 2. Quantos GB? 3. Qual a saúde da bateria nas configurações? 4. Possui alguma marca ou detalhe estético?', 'vendas'),
  ('00000000-0000-0000-0000-000000000001', '/horario', 'Horário de Funcionamento', 'Nosso horário de atendimento é de Segunda a Sexta das 08h30 às 18h30, e aos Sábados das 08h30 às 13h00. Venha nos visitar e tomar um café conosco! ☕', 'geral')
ON CONFLICT DO NOTHING;

