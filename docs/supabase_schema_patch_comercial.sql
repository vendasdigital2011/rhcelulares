-- ==============================================================================
-- HIAGO IPHONES ERP - PATCH COMERCIAL & AUDITORIA COMPLETA
-- Adiciona suporte a:
-- 1. Cancelamentos/Estornos de Vendas com rastreabilidade
-- 2. Fechamento de Caixa Cego com Conferência de Gaveta e Quebra de Caixa
-- 3. Atividades e Tarefas de Pós-Venda integradas à Venda
-- ==============================================================================

-- 1. Colunas de Status e Cancelamento na tabela sales
ALTER TABLE public.sales 
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(100);

-- 2. Colunas de Conferência na tabela cash_registers
ALTER TABLE public.cash_registers 
  ADD COLUMN IF NOT EXISTS closing_cash_counted NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS closing_difference NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS closing_notes TEXT;

-- 3. Tabela de Pós-Venda Preditivo
CREATE TABLE IF NOT EXISTS public.after_sales_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(25) NOT NULL,
    device_model VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- birthday, upgrade_d360, checkup_d180, accessory_d15, referral
    title VARCHAR(255) NOT NULL,
    description TEXT,
    suggested_message TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, sent, converted
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    scheduled_date VARCHAR(50),
    contacted_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_after_sales_status ON public.after_sales_tasks(status);
CREATE INDEX IF NOT EXISTS idx_after_sales_customer ON public.after_sales_tasks(customer_id);

ALTER TABLE public.after_sales_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for after_sales_tasks" ON public.after_sales_tasks;
CREATE POLICY "Public access for after_sales_tasks" ON public.after_sales_tasks
  FOR ALL TO public USING (true) WITH CHECK (true);
