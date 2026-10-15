-- ==============================================================================
-- HIAGO IPHONES ERP - SCHEMA DEFINITIVO POSTGRESQL / SUPABASE
-- Projeto: https://bytmvqvydxealupmvlme.supabase.co
-- ==============================================================================

-- 1. Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABELA DE LOJAS (Multi-unidade / Identidade da Loja)
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

-- 3. TABELA DE USUÁRIOS E OPERADORES
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(30) NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'gerente', 'vendedor', 'tecnico')),
    pin_code VARCHAR(10) DEFAULT '1234', -- Login rápido de balcão
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE APARELHOS / ESTOQUE INTELIGENTE POR IMEI
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
    status VARCHAR(30) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'warranty')),
    reserved_until TIMESTAMP WITH TIME ZONE,
    reserved_by VARCHAR(100),
    is_showcase_public BOOLEAN DEFAULT TRUE,
    is_showcase_featured BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de busca ultrarrápida no PDV e balcão
CREATE INDEX IF NOT EXISTS idx_devices_imei ON public.devices(imei);
CREATE INDEX IF NOT EXISTS idx_devices_status ON public.devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_model ON public.devices(model);

-- 5. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    cpf VARCHAR(14),
    email VARCHAR(255),
    total_spent NUMERIC(10, 2) DEFAULT 0.00,
    last_purchase_date VARCHAR(50),
    birthday VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- 6. TABELA DE VENDAS
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(25),
    seller_name VARCHAR(100) NOT NULL DEFAULT 'Hiago',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(100) NOT NULL DEFAULT 'Pix',
    installments INTEGER DEFAULT 1,
    trade_in_model VARCHAR(100),
    trade_in_imei VARCHAR(20),
    trade_in_battery_health INTEGER,
    trade_in_amount NUMERIC(10, 2) DEFAULT 0.00,
    date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_sale_number ON public.sales(sale_number);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);

-- 7. ITENS DA VENDA
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    item_type VARCHAR(30) NOT NULL DEFAULT 'device' CHECK (item_type IN ('device', 'accessory', 'service')),
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    imei VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ORDENS DE SERVIÇO (ASSISTÊNCIA TÉCNICA)
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    os_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(25) NOT NULL,
    device_model VARCHAR(100) NOT NULL,
    imei VARCHAR(20),
    color VARCHAR(50),
    technician_name VARCHAR(100) DEFAULT 'Rafael Técnico',
    status VARCHAR(30) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'diagnosing', 'waiting_parts', 'ready', 'delivered')),
    checklist_count INTEGER DEFAULT 13,
    entry_checklist JSONB DEFAULT '[]'::jsonb,
    reported_issue TEXT NOT NULL,
    technical_diagnosis TEXT,
    service_executed TEXT,
    estimated_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    final_value NUMERIC(10, 2),
    entry_date VARCHAR(50),
    delivered_date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_orders_os_number ON public.service_orders(os_number);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON public.service_orders(status);

-- 9. CAIXA & TRANSAÇÕES (FLUXO FINANCEIRO BLINDADO)
CREATE TABLE IF NOT EXISTS public.cash_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    operator_name VARCHAR(100) DEFAULT 'Operador Balcão',
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    initial_float NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    total_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.cash_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    register_id UUID REFERENCES public.cash_registers(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('inflow', 'outflow')),
    category VARCHAR(50) NOT NULL DEFAULT 'sale', -- sale, sangria, reforco, trade_in
    description TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- POLÍTICAS DE ACESSO ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura e escrita pelo app com a chave anon/publishable
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'stores',
        'users',
        'devices',
        'customers',
        'sales',
        'sale_items',
        'service_orders',
        'cash_registers',
        'cash_transactions'
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

-- ==============================================================================
-- CARGA INICIAL (SEED) - HIAGO IPHONES
-- ==============================================================================

-- 1. Cria loja padrão
INSERT INTO public.stores (id, name, whatsapp, pix_key, address)
VALUES ('00000000-0000-0000-0000-000000000001', 'Hiago iPhones', '77 98844-2211', 'hiago@iphones.com.br', 'Vitória da Conquista - BA')
ON CONFLICT (id) DO NOTHING;

-- 2. Cria operadores padrão
INSERT INTO public.users (store_id, name, email, role, pin_code)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Hiago (Responsável)', 'hiago@loja.com', 'admin', '1234'),
  ('00000000-0000-0000-0000-000000000001', 'Rafael Técnico', 'rafael@loja.com', 'tecnico', '4321'),
  ('00000000-0000-0000-0000-000000000001', 'Vendedor Balcão', 'balcao@loja.com', 'vendedor', '1111')
ON CONFLICT DO NOTHING;

-- 3. Carga do Estoque Inicial de iPhones
INSERT INTO public.devices (
    store_id, imei, brand, model, storage, color, condition, 
    battery_health, aesthetic_grade, cost_price, selling_price, 
    supplier, status, is_showcase_public, is_showcase_featured
)
VALUES
  ('00000000-0000-0000-0000-000000000001', '356984112094832', 'Apple', 'iPhone 13', '128GB', 'Meia-noite', 'certified_pre_owned', 88, 'A+', 2100.00, 2890.00, 'Distribuidor SP Import', 'available', true, true),
  ('00000000-0000-0000-0000-000000000001', '354891102948201', 'Apple', 'iPhone 14 Pro', '256GB', 'Roxo Profundo', 'certified_pre_owned', 92, 'A+', 3800.00, 4890.00, 'Lote Trade-in', 'available', true, true),
  ('00000000-0000-0000-0000-000000000001', '359182390192843', 'Apple', 'iPhone 15 Pro Max', '256GB', 'Titânio Natural', 'new_sealed', null, 'A+', 6100.00, 7290.00, 'Miami Tech Eletrônicos', 'available', true, true),
  ('00000000-0000-0000-0000-000000000001', '358201938472910', 'Apple', 'iPhone 12', '64GB', 'Azul', 'certified_pre_owned', 84, 'A', 1400.00, 1990.00, 'Troca Balcão', 'available', false, false),
  ('00000000-0000-0000-0000-000000000001', '351982739182374', 'Apple', 'iPhone 11', '128GB', 'Branco', 'certified_pre_owned', 81, 'A', 1100.00, 1650.00, 'Distribuidor SP Import', 'sold', false, false)
ON CONFLICT (imei) DO UPDATE SET 
    selling_price = EXCLUDED.selling_price,
    cost_price = EXCLUDED.cost_price;

-- 4. Abre Caixa Inicial do Balcão
INSERT INTO public.cash_registers (store_id, operator_name, status, initial_float, total_sales)
VALUES ('00000000-0000-0000-0000-000000000001', 'Hiago', 'open', 300.00, 0.00)
ON CONFLICT DO NOTHING;
