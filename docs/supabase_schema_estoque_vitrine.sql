-- ==============================================================================
-- HIAGO IPHONES ERP — SCHEMA COMPLETO DE ESTOQUE E VITRINE
-- Submódulos:
-- 1. Estoque Celulares (Tabela devices existente ampliada)
-- 2. Compra de Telefone (phone_purchases)
-- 3. Produtos & Acessórios (products)
-- 4. Peças de Reparo e Bancada (parts)
-- 5. Fornecedores (suppliers)
-- 6. Movimentações & Rastreabilidade de Estoque (inventory_movements)
-- ==============================================================================

-- 1. TABELA DE FORNECEDORES
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    type VARCHAR(10) NOT NULL DEFAULT 'pj' CHECK (type IN ('pj', 'pf')),
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    document VARCHAR(25) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100),
    contact_person VARCHAR(100),
    categories TEXT[] DEFAULT '{}',
    payment_terms VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_document ON public.suppliers(document);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers(name);

-- 2. TABELA DE COMPRAS DE TELEFONE (NOVOS, SEMINOVOS & TRADE-IN)
CREATE TABLE IF NOT EXISTS public.phone_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    purchase_number VARCHAR(50) UNIQUE NOT NULL,
    date VARCHAR(50) NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    customer VARCHAR(255) NOT NULL,
    cpf VARCHAR(20),
    phone VARCHAR(25),
    address TEXT,
    seller VARCHAR(100) NOT NULL DEFAULT 'Hiago',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    additional_expenses NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discounts NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Pix',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'partial')),
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
    notes TEXT,
    has_contract BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_phone_purchases_number ON public.phone_purchases(purchase_number);
CREATE INDEX IF NOT EXISTS idx_phone_purchases_status ON public.phone_purchases(status);

-- 3. TABELA DE PRODUTOS & ACESSÓRIOS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(50),
    brand VARCHAR(100) NOT NULL DEFAULT 'Hiago Tech',
    category VARCHAR(50) NOT NULL DEFAULT 'Capa',
    description TEXT,
    unit VARCHAR(20) NOT NULL DEFAULT 'un',
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sell_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    location VARCHAR(100) DEFAULT 'Gaveta Balcão A',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- 4. TABELA DE PEÇAS DE REPARO E BANCADA
CREATE TABLE IF NOT EXISTS public.parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    sku VARCHAR(50),
    category VARCHAR(50) NOT NULL DEFAULT 'Display',
    manufacturer VARCHAR(100) NOT NULL DEFAULT 'Foxconn / Original',
    compatible_models TEXT[] DEFAULT '{}',
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 2,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sell_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    location VARCHAR(100) DEFAULT 'Bancada Gaveta 3',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parts_code ON public.parts(code);
CREATE INDEX IF NOT EXISTS idx_parts_category ON public.parts(category);

-- 5. TABELA DE HISTÓRICO E MOVIMENTAÇÕES DE ESTOQUE
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('device', 'product', 'part')),
    item_id VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN (
        'inflow_purchase', 
        'outflow_sale', 
        'adjustment', 
        'devolution', 
        'reserve', 
        'transfer_location', 
        'os_consumption'
    )),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER,
    new_stock INTEGER,
    unit_cost NUMERIC(10, 2),
    reason TEXT NOT NULL,
    reference_id VARCHAR(100),
    operator_name VARCHAR(100) DEFAULT 'Hiago',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movements_item_id ON public.inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_type ON public.inventory_movements(movement_type);

-- 6. RLS POLICIES
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir tudo aos usuarios anon - suppliers" ON public.suppliers;
    CREATE POLICY "Permitir tudo aos usuarios anon - suppliers" ON public.suppliers FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir tudo aos usuarios anon - phone_purchases" ON public.phone_purchases;
    CREATE POLICY "Permitir tudo aos usuarios anon - phone_purchases" ON public.phone_purchases FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir tudo aos usuarios anon - products" ON public.products;
    CREATE POLICY "Permitir tudo aos usuarios anon - products" ON public.products FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir tudo aos usuarios anon - parts" ON public.parts;
    CREATE POLICY "Permitir tudo aos usuarios anon - parts" ON public.parts FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir tudo aos usuarios anon - inventory_movements" ON public.inventory_movements;
    CREATE POLICY "Permitir tudo aos usuarios anon - inventory_movements" ON public.inventory_movements FOR ALL TO anon USING (true) WITH CHECK (true);
END $$;

-- 7. SEED INICIAL (FORNECEDORES, PRODUTOS E PEÇAS)
INSERT INTO public.suppliers (name, trade_name, type, document, phone, email, city, contact_person, categories, payment_terms)
VALUES 
('Alpha Distribuidora SP Ltda', 'Alpha SP', 'pj', '12.345.678/0001-90', '(11) 98765-4321', 'vendas@alphasp.com.br', 'São Paulo - SP', 'Rodrigo Vendas', ARRAY['iPhones Novos', 'Seminovos Grade A'], '30 dias boleto'),
('Miami Tech Comércio de Eletrônicos', 'Miami Tech', 'pj', '98.765.432/0001-11', '(19) 99123-9876', 'contato@miamitech.com', 'Campinas - SP', 'Carlos Import', ARRAY['Seminovos Swap', 'Vitrine'], 'À vista PIX com 3% desc'),
('Fox Parts Componentes Eletrônicos', 'Fox Parts', 'pj', '45.678.901/0001-22', '(11) 97654-1234', 'pedidos@foxparts.com.br', 'São Paulo - SP', 'Julio Peças', ARRAY['Telas OLED', 'Baterias Originais'], '14/28 dias')
ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, sku, barcode, brand, category, cost_price, sell_price, current_stock, min_stock, location)
VALUES
('Capa Magnética MagSafe Silicone iPhone 13/14', 'CAP-MAG-1314', '789123456001', 'Hiago Tech', 'Capa', 22.00, 69.90, 24, 8, 'Expositor Vitrine A'),
('Película de Vidro 3D Privacidade 9H iPhone 13', 'PEL-PRIV-13', '789123456002', 'Hiago Tech', 'Película', 8.50, 45.00, 32, 10, 'Gaveta Balcão 1'),
('Fonte Carregador Rápido USB-C 20W Homologado Anatel', 'FNT-20W-ANATEL', '789123456003', 'Foxconn / Anatel', 'Carregador', 35.00, 99.90, 18, 5, 'Vitrine Central'),
('Cabo Lightning para Tipo-C 1m Reforçado', 'CAB-USBC-LIGHT', '789123456004', 'Hiago Tech', 'Carregador', 18.00, 59.90, 25, 8, 'Gaveta Balcão 1'),
('Fone de Ouvido Sem Fio Earbuds Pro Wireless', 'FON-EAR-PRO', '789123456005', 'H Prime', 'Fone', 65.00, 169.90, 7, 3, 'Vitrine Superior')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.parts (name, code, sku, category, manufacturer, compatible_models, current_stock, min_stock, cost_price, sell_price, location)
VALUES
('Tela Frontal OLED iPhone 13 (True Tone Ativo)', 'PEC-DISP-13', 'PEC-DISP-13', 'Display', 'Foxconn OEM', ARRAY['iPhone 13'], 6, 2, 240.00, 650.00, 'Bancada Gaveta 1'),
('Tela Frontal Incell iPhone 11', 'PEC-DISP-11', 'PEC-DISP-11', 'Display', 'JK Incell', ARRAY['iPhone 11'], 8, 3, 95.00, 320.00, 'Bancada Gaveta 1'),
('Bateria Foxconn c/ Flex Original iPhone 12 (100% Saúde)', 'PEC-BAT-12', 'PEC-BAT-12', 'Bateria', 'Foxconn', ARRAY['iPhone 12', 'iPhone 12 Pro'], 12, 4, 65.00, 280.00, 'Bancada Gaveta 2'),
('Bateria Foxconn c/ Flex Original iPhone 13', 'PEC-BAT-13', 'PEC-BAT-13', 'Bateria', 'Foxconn', ARRAY['iPhone 13'], 5, 3, 85.00, 320.00, 'Bancada Gaveta 2'),
('Conector de Carga Lightning iPhone 13 Pro', 'PEC-CON-13P', 'PEC-CON-13P', 'Conector', 'OEM Original', ARRAY['iPhone 13 Pro'], 4, 2, 45.00, 250.00, 'Bancada Gaveta 3'),
('Módulo Câmera Traseira Dupla iPhone 14', 'PEC-CAM-14', 'PEC-CAM-14', 'Câmera', 'Apple Retirada', ARRAY['iPhone 14'], 2, 2, 280.00, 750.00, 'Bancada Gaveta 4')
ON CONFLICT (code) DO NOTHING;
