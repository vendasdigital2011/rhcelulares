-- ==============================================================================
-- HIAGO IPHONES SAAS - DATABASE DDL WITH POSTGRESQL ROW-LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilita extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE TENANTS (Lojas Contratantes)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    waba_id VARCHAR(100),
    phone_number_id VARCHAR(100),
    phone_number VARCHAR(20),
    waba_access_token TEXT, -- Criptografado com AES-256-GCM
    waba_quality_rating VARCHAR(30) DEFAULT 'UNKNOWN', -- GREEN, YELLOW, RED, UNKNOWN
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE USUÁRIOS (Operadores: Dono, Gerente, Vendedores)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'manager', 'seller')),
    is_available_in_rotation BOOLEAN DEFAULT TRUE,
    last_lead_assigned_at TIMESTAMP WITH TIME ZONE,
    max_active_chats INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email)
);

-- 3. TABELA DE TAXAS DE MAQUININHA (Calculadora 1-Clique)
CREATE TABLE IF NOT EXISTS card_fee_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL CHECK (installment_number >= 1 AND installment_number <= 24),
    fee_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_card_fee_tenant_installment UNIQUE (tenant_id, installment_number)
);

-- 4. TABELA DE CLIENTES (Consumidores Finais)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(25) NOT NULL,
    opt_in_status VARCHAR(20) DEFAULT 'subscribed' CHECK (opt_in_status IN ('subscribed', 'opted_out')),
    referral_code VARCHAR(50),
    referred_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customers_tenant_phone UNIQUE (tenant_id, phone_number)
);

-- 5. TABELA DE DISPOSITIVOS DOS CLIENTES (Ficha do Aparelho & Ciclo de Vida)
CREATE TABLE IF NOT EXISTS customer_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    brand VARCHAR(50) NOT NULL DEFAULT 'Apple',
    model_name VARCHAR(100) NOT NULL,
    storage_capacity VARCHAR(20) NOT NULL,
    color VARCHAR(50),
    condition VARCHAR(30) NOT NULL CHECK (condition IN ('new_sealed', 'certified_pre_owned')),
    battery_health_percentage INTEGER CHECK (battery_health_percentage >= 50 AND battery_health_percentage <= 100),
    imei_serial VARCHAR(50),
    sold_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    warranty_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE DEALS (Kanban & Oportunidades Comerciais)
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'new_lead' CHECK (
        stage IN ('new_lead', 'qualifying', 'trade_in_eval', 'proposal_sent', 'waiting_decision', 'won', 'lost')
    ),
    target_model VARCHAR(100),
    estimated_deal_value NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABELA DE VENDAS CONSOLIDADAS
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    seller_user_id UUID NOT NULL REFERENCES users(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    installments INTEGER DEFAULT 1,
    trade_in_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABELA DE APARELHOS DE TRADE-IN
CREATE TABLE IF NOT EXISTS trade_in_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    storage_capacity VARCHAR(20),
    battery_health_percentage INTEGER,
    evaluated_amount NUMERIC(10, 2) NOT NULL,
    condition_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABELA DE MOTIVOS DE PERDA DE LEADS
CREATE TABLE IF NOT EXISTS deals_lost_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    loss_reason VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. CONVERSAS DO WHATSAPP (Sessões e Roleta)
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'waiting_customer', 'waiting_seller', 'closed')),
    last_customer_message_at TIMESTAMP WITH TIME ZONE,
    last_seller_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. MENSAGENS DO WHATSAPP
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    wamid VARCHAR(150) NOT NULL,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'seller', 'system_bot')),
    sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message_type VARCHAR(30) DEFAULT 'text',
    body TEXT,
    media_url TEXT,
    status VARCHAR(30) DEFAULT 'received' CHECK (status IN ('received', 'sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_whatsapp_messages_wamid UNIQUE (wamid)
);

-- 12. LOGS DE AUDITORIA (Segurança e Rastreabilidade)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- ATIVAÇÃO DO ROW-LEVEL SECURITY (RLS) COM ISOLAMENTO DE TENANTS
-- ==============================================================================

-- Função auxiliar para validar current_setting com segurança
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Macro para habilitar RLS e criar políticas isoladas
DO $$
DECLARE
    tbl text;
    tenant_tables text[] := ARRAY[
        'users',
        'card_fee_settings',
        'customers',
        'customer_devices',
        'deals',
        'sales',
        'trade_in_devices',
        'deals_lost_logs',
        'whatsapp_conversations',
        'whatsapp_messages',
        'audit_logs'
    ];
BEGIN
    FOREACH tbl IN ARRAY tenant_tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I;', tbl);
        EXECUTE format(
            'CREATE POLICY tenant_isolation_policy ON %I
             FOR ALL
             USING (tenant_id = get_current_tenant_id())
             WITH CHECK (tenant_id = get_current_tenant_id());',
            tbl
        );
    END LOOP;
END;
$$;
