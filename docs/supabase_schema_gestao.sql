-- ==============================================================================
-- HIAGO IPHONES / RH CELULARES ERP - SCHEMA DO MÓDULO GESTÃO
-- Módulo: Gestão (Financeiro, Meu Perfil, Relatórios, Comissões, Ponto, Usuários & Configurações)
-- Projeto: https://bytmvqvydxealupmvlme.supabase.co
-- ==============================================================================

-- 1. CONTAS FINANCEIRAS & BANCÁRIAS
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'checking' CHECK (type IN ('checking', 'cash', 'savings', 'digital_wallet', 'card_settlement')),
    bank_name VARCHAR(100),
    initial_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    initial_balance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_financial_accounts_store ON public.financial_accounts(store_id);

-- 2. CONTAS A PAGAR (DESPESAS & OBRIGAÇÕES)
CREATE TABLE IF NOT EXISTS public.bills_to_pay (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    supplier_id UUID,
    supplier_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Fornecedores',
    description TEXT NOT NULL,
    original_amount NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    penalty_amount NUMERIC(12, 2) DEFAULT 0.00,
    interest_amount NUMERIC(12, 2) DEFAULT 0.00,
    final_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    remaining_amount NUMERIC(12, 2) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_method VARCHAR(50),
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
    installments_count INTEGER NOT NULL DEFAULT 1,
    installment_number INTEGER NOT NULL DEFAULT 1,
    purchase_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bills_to_pay_due ON public.bills_to_pay(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_to_pay_status ON public.bills_to_pay(status);

-- 3. CONTAS A RECEBER (RECEBÍVEIS, PARCELAMENTOS & FATURAMENTO)
CREATE TABLE IF NOT EXISTS public.bills_to_receive (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    sale_number VARCHAR(50),
    os_id UUID,
    os_number VARCHAR(50),
    category VARCHAR(100) NOT NULL DEFAULT 'Venda',
    description TEXT NOT NULL,
    original_amount NUMERIC(12, 2) NOT NULL,
    received_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    remaining_amount NUMERIC(12, 2) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    receive_date DATE,
    payment_method VARCHAR(50),
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'received', 'overdue', 'cancelled')),
    installments_count INTEGER NOT NULL DEFAULT 1,
    installment_number INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bills_to_receive_due ON public.bills_to_receive(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_to_receive_status ON public.bills_to_receive(status);

-- 4. LANÇAMENTOS E TRANSAÇÕES FINANCEIRAS (FLUXO CONCILIADO)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE RESTRICT,
    destination_account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('inflow', 'outflow', 'transfer', 'adjustment')),
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    origin VARCHAR(50) NOT NULL DEFAULT 'manual' CHECK (origin IN ('sale', 'os', 'purchase', 'commission', 'cash_register', 'manual', 'transfer', 'bill_pay', 'bill_receive')),
    reference_id VARCHAR(100),
    operator_name VARCHAR(100) NOT NULL DEFAULT 'Sistema',
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'reconciled', 'cancelled')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON public.financial_transactions(date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON public.financial_transactions(account_id);

-- 5. REGRAS E REGISTROS DE COMISSÕES DE VENDEDORES
CREATE TABLE IF NOT EXISTS public.commission_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    fixed_per_device NUMERIC(10, 2) NOT NULL DEFAULT 20.00,
    min_devices INTEGER NOT NULL DEFAULT 10,
    period VARCHAR(20) NOT NULL DEFAULT 'mes' CHECK (period IN ('semana', 'quinzena', 'mes')),
    percent_accessories NUMERIC(5, 2) DEFAULT 0.00,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.commission_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    sale_number VARCHAR(50),
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    devices_sold_count INTEGER NOT NULL DEFAULT 1,
    eligible_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    calculated_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'pending_target' CHECK (status IN ('pending_target', 'unlocked', 'paid', 'cancelled')),
    period_label VARCHAR(50) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_by VARCHAR(100),
    financial_transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PONTO ELETRÔNICO E AUDITORIA DE JORNADA
CREATE TABLE IF NOT EXISTS public.timecard_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(30) NOT NULL CHECK (type IN ('entry', 'lunch_start', 'lunch_end', 'exit')),
    origin VARCHAR(30) NOT NULL DEFAULT 'web' CHECK (origin IN ('web', 'mobile', 'ajuste_manual')),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_within_radius BOOLEAN DEFAULT TRUE,
    location_status VARCHAR(30) NOT NULL DEFAULT 'gps_unavailable' CHECK (location_status IN ('validated', 'outside_radius', 'gps_unavailable')),
    raw_device_time TIMESTAMP WITH TIME ZONE,
    server_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    hash VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_timecard_user_date ON public.timecard_records(user_id, timestamp);

CREATE TABLE IF NOT EXISTS public.timecard_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    target_date DATE NOT NULL,
    adjusted_type VARCHAR(30) NOT NULL CHECK (adjusted_type IN ('entry', 'lunch_start', 'lunch_end', 'exit')),
    adjusted_time TIME NOT NULL,
    reason TEXT NOT NULL,
    author_id UUID NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'rejected', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CONFIGURAÇÕES DA LOJA E ADQUIRENTES
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE UNIQUE,
    store_name VARCHAR(255) NOT NULL DEFAULT 'RH Celulares',
    logo_url TEXT,
    slug VARCHAR(100) NOT NULL DEFAULT 'rh-celulares',
    cnpj_cpf VARCHAR(20),
    phone VARCHAR(30) DEFAULT '77999261653',
    whatsapp VARCHAR(30) DEFAULT '77999261653',
    instagram VARCHAR(50) DEFAULT '@sualoja',
    cep VARCHAR(10) DEFAULT '45000-000',
    street VARCHAR(255) DEFAULT 'Avenida Central',
    number VARCHAR(30) DEFAULT '100',
    complement VARCHAR(100) DEFAULT 'Sala 01',
    neighborhood VARCHAR(100) DEFAULT 'Centro',
    city VARCHAR(100) DEFAULT 'Manaus',
    uf VARCHAR(2) DEFAULT 'AM',
    timezone VARCHAR(50) DEFAULT 'America/Manaus',
    warranty_reservation_days INTEGER DEFAULT 90,
    is_showcase_active BOOLEAN DEFAULT TRUE,
    terms_sale TEXT,
    terms_warranty_new TEXT,
    terms_warranty_used TEXT,
    terms_assistance TEXT,
    card_machines JSONB DEFAULT '[]'::jsonb,
    location_config JSONB DEFAULT '{"latitude": -3.1190275, "longitude": -60.0217314, "radiusMeters": 150, "requireGps": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. POLÍTICAS RLS (Row Level Security)
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills_to_pay ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills_to_receive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timecard_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timecard_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'financial_accounts',
        'bills_to_pay',
        'bills_to_receive',
        'financial_transactions',
        'commission_rules',
        'commission_records',
        'timecard_records',
        'timecard_adjustments',
        'store_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access for %I" ON public.%I;', tbl, tbl);
        EXECUTE format(
            'CREATE POLICY "Public access for %I" ON public.%I
             FOR ALL
             TO public
             USING (true)
             WITH CHECK (true);',
            tbl, tbl
        );
    END LOOP;
END;
$$;
