-- ==============================================================================
-- CRM HIAGO IPHONES — MÓDULO ASSISTÊNCIA TÉCNICA (SCHEMA COMPLETO)
-- Tabelas: technical_services, service_orders, warranties, warranty_claims
-- ==============================================================================

-- Habilita extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATÁLOGO CENTRALIZADO DE SERVIÇOS TÉCNICOS
CREATE TABLE IF NOT EXISTS public.technical_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(80) NOT NULL,
    description TEXT,
    compatible_devices JSONB DEFAULT '["iPhone", "iPad", "Apple Watch"]'::jsonb,
    compatible_models JSONB DEFAULT '[]'::jsonb,
    default_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estimated_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estimated_minutes INTEGER DEFAULT 60,
    default_warranty_days INTEGER DEFAULT 90,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_technical_services_code ON public.technical_services(code);
CREATE INDEX IF NOT EXISTS idx_technical_services_category ON public.technical_services(category);
CREATE INDEX IF NOT EXISTS idx_technical_services_status ON public.technical_services(status);

-- 2. TABELA COMPLETA DE ORDENS DE SERVIÇO (MÁQUINA DE 12 ESTADOS)
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    os_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_cpf VARCHAR(20),
    device_type VARCHAR(50) DEFAULT 'Smartphone',
    brand VARCHAR(80) DEFAULT 'Apple',
    device_model VARCHAR(100) NOT NULL,
    imei VARCHAR(20),
    imei2 VARCHAR(20),
    serial_number VARCHAR(50),
    color VARCHAR(50),
    device_owner_type VARCHAR(30) DEFAULT 'customer' CHECK (device_owner_type IN ('customer', 'store_stock')),
    stock_device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    physical_condition TEXT,
    reported_issue TEXT NOT NULL,
    accessories_received TEXT,
    checklist_count INTEGER DEFAULT 13,
    checklist_items JSONB DEFAULT '[]'::jsonb,
    technician_name VARCHAR(100) DEFAULT 'André Técnico',
    status VARCHAR(40) NOT NULL DEFAULT 'aberta',
    status_history JSONB DEFAULT '[]'::jsonb,
    technical_diagnosis TEXT,
    service_executed TEXT,
    quote_services JSONB DEFAULT '[]'::jsonb,
    quote_parts JSONB DEFAULT '[]'::jsonb,
    subtotal_services NUMERIC(10, 2) DEFAULT 0.00,
    subtotal_parts NUMERIC(10, 2) DEFAULT 0.00,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    estimated_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    final_value NUMERIC(10, 2),
    client_approval JSONB DEFAULT '{"status": "pending"}'::jsonb,
    parts_consumed BOOLEAN DEFAULT FALSE,
    final_tests_summary TEXT,
    delivery_notes TEXT,
    delivered_to VARCHAR(150),
    delivered_by VARCHAR(100),
    payment_method VARCHAR(50),
    payment_status VARCHAR(30) DEFAULT 'pending',
    entry_date VARCHAR(50),
    estimated_delivery_date VARCHAR(50),
    ready_date VARCHAR(50),
    delivered_date VARCHAR(50),
    warranty_days INTEGER DEFAULT 90,
    warranty_id UUID,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_orders_os_number ON public.service_orders(os_number);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON public.service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_customer ON public.service_orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_service_orders_imei ON public.service_orders(imei);

-- 3. GESTÃO DE GARANTIAS (SERVIÇOS, PEÇAS, LEGAL CDC E COMERCIAL)
CREATE TABLE IF NOT EXISTS public.warranties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    warranty_number VARCHAR(50) UNIQUE NOT NULL,
    os_id UUID REFERENCES public.service_orders(id) ON DELETE SET NULL,
    os_number VARCHAR(50),
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    sale_number VARCHAR(50),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    device_model VARCHAR(100) NOT NULL,
    imei VARCHAR(20),
    serial_number VARCHAR(50),
    warranty_type VARCHAR(30) NOT NULL DEFAULT 'service' CHECK (warranty_type IN ('service', 'part', 'supplier', 'commercial', 'legal')),
    service_name VARCHAR(255),
    parts_covered JSONB DEFAULT '[]'::jsonb,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    warranty_days INTEGER NOT NULL DEFAULT 90,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired', 'claimed', 'voided')),
    terms TEXT,
    notes TEXT,
    registered_by VARCHAR(100) DEFAULT 'Hiago',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warranties_warranty_number ON public.warranties(warranty_number);
CREATE INDEX IF NOT EXISTS idx_warranties_os_number ON public.warranties(os_number);
CREATE INDEX IF NOT EXISTS idx_warranties_customer ON public.warranties(customer_name);
CREATE INDEX IF NOT EXISTS idx_warranties_imei ON public.warranties(imei);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON public.warranties(status);

-- 4. ATENDIMENTOS EM GARANTIA (RETORNO DE CLIENTES)
CREATE TABLE IF NOT EXISTS public.warranty_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    warranty_id UUID REFERENCES public.warranties(id) ON DELETE CASCADE,
    warranty_number VARCHAR(50) NOT NULL,
    original_os_number VARCHAR(50),
    new_os_number VARCHAR(50),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    device_model VARCHAR(100) NOT NULL,
    imei VARCHAR(20),
    reported_defect TEXT NOT NULL,
    entry_condition TEXT,
    technical_assessment TEXT,
    decision VARCHAR(30) NOT NULL DEFAULT 'analyzing' CHECK (decision IN ('analyzing', 'approved', 'rejected', 'in_repair', 'resolved', 'closed')),
    decision_reason TEXT,
    is_covered BOOLEAN DEFAULT FALSE,
    resolution_date TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'Hiago',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warranty_claims_claim_number ON public.warranty_claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_warranty_id ON public.warranty_claims(warranty_id);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.technical_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access technical_services" ON public.technical_services;
CREATE POLICY "Public Full Access technical_services" ON public.technical_services FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Full Access service_orders" ON public.service_orders;
CREATE POLICY "Public Full Access service_orders" ON public.service_orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Full Access warranties" ON public.warranties;
CREATE POLICY "Public Full Access warranties" ON public.warranties FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Full Access warranty_claims" ON public.warranty_claims;
CREATE POLICY "Public Full Access warranty_claims" ON public.warranty_claims FOR ALL USING (true);

-- 6. CARGA INICIAL DE SERVIÇOS TÉCNICOS PADRÃO
INSERT INTO public.technical_services (name, code, category, description, compatible_devices, default_price, estimated_cost, estimated_minutes, default_warranty_days, status)
VALUES
    ('Troca de Tela OLED + True Tone', 'SRV-TELA-OLED', 'Troca de tela', 'Substituição completa do módulo frontal OLED com transferência de serial e ativação True Tone.', '["iPhone"]'::jsonb, 650.00, 240.00, 45, 90, 'active'),
    ('Troca de Tela Incell Premium', 'SRV-TELA-INC', 'Troca de tela', 'Substituição da tela por modelo Incell com excelente fidelidade de toque e cores.', '["iPhone"]'::jsonb, 320.00, 95.00, 40, 90, 'active'),
    ('Troca de Bateria Foxconn c/ Flex Original', 'SRV-BAT-FOX', 'Troca de bateria', 'Bateria nova grau A com transplante de chip original para não exibir mensagem de peça desconhecida.', '["iPhone"]'::jsonb, 280.00, 65.00, 35, 90, 'active'),
    ('Reparo Face ID (Prisma / Flex Dot Projector)', 'SRV-FACE-ID', 'Reparo de placa', 'Microsoldagem e reparo do sensor biométrico Face ID mantendo a segurança original.', '["iPhone", "iPad"]'::jsonb, 450.00, 80.00, 180, 90, 'active'),
    ('Troca de Vidro Traseiro a Laser', 'SRV-VIDRO-TR', 'Outros', 'Remoção de vidro quebrado com máquina laser de precisão e aplicação de vidro temperado novo.', '["iPhone"]'::jsonb, 380.00, 50.00, 120, 90, 'active'),
    ('Reparo do Conector de Carga Lightning / Type-C', 'SRV-CONECT-CARG', 'Reparo de conector', 'Troca do flex dock de carga e microfones inferiores com teste de corrente amperimétrica.', '["iPhone", "iPad"]'::jsonb, 220.00, 40.00, 50, 90, 'active'),
    ('Desoxidação e Limpeza Química Ultrassônica', 'SRV-DESOX-ULTRA', 'Limpeza técnica', 'Banho químico em cuba ultrassônica para aparelhos com contato com líquidos e resíduos.', '["iPhone", "iPad", "Apple Watch"]'::jsonb, 200.00, 30.00, 240, 30, 'active'),
    ('Recuperação de Software / Erro de Restauração iTunes', 'SRV-SOFT-REST', 'Software', 'Restauração de firmware DFU, desbrick e atualização de sistema operacional iOS.', '["iPhone", "iPad"]'::jsonb, 150.00, 10.00, 60, 30, 'active')
ON CONFLICT (code) DO NOTHING;
