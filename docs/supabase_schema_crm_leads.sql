-- ==============================================================================
-- SCHEMA SUPABASE: CRM KANBAN E PROSPECÇÃO COMERCIAL (RM SAAS HARNESS)
-- Módulo: CRM de Clientes, Pipeline e Inteligência Comercial
-- ==============================================================================

-- 1. TABELA PRINCIPAL DE LEADS / OPORTUNIDADES
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL DEFAULT 'default_tenant',
    contact_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    website VARCHAR(255),
    business_type VARCHAR(50) DEFAULT 'consumidor_final',
    commercial_interest VARCHAR(255) NOT NULL,
    potential_value NUMERIC(12,2) DEFAULT 0.00,
    priority VARCHAR(20) NOT NULL DEFAULT 'media', -- 'baixa', 'media', 'alta', 'urgente'
    stage VARCHAR(50) NOT NULL DEFAULT 'novo_lead', -- 'novo_lead', 'qualificacao', 'primeiro_contato', 'em_negociacao', 'aguardando_retorno', 'convertido', 'perdido'
    assigned_user_id TEXT,
    assigned_user_name VARCHAR(255) NOT NULL DEFAULT 'Vendedor Responsável',
    origin VARCHAR(50) NOT NULL DEFAULT 'pesquisa_manual', -- 'pesquisa_manual', 'indicacao', 'formulario', 'importacao', 'evento', 'fonte_autorizada', 'outros'
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_action TEXT,
    next_return_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    erp_customer_code VARCHAR(100),
    erp_order_ref VARCHAR(100),
    erp_sync_status VARCHAR(50) DEFAULT 'not_linked',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE ATIVIDADES DO LEAD (TIMELINE AUDITÁVEL)
CREATE TABLE IF NOT EXISTS public.crm_lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'ligacao', 'email', 'reuniao', 'retorno', 'observacao', 'mudanca_etapa'
    description TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE TAREFAS E PRÓXIMOS CONTATOS
CREATE TABLE IF NOT EXISTS public.crm_lead_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. ÍNDICES DE PERFORMANCE E PESQUISA
CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant ON public.crm_leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON public.crm_leads(stage);
CREATE INDEX IF NOT EXISTS idx_crm_leads_phone ON public.crm_leads(phone);
CREATE INDEX IF NOT EXISTS idx_crm_leads_return_date ON public.crm_leads(next_return_date);
CREATE INDEX IF NOT EXISTS idx_crm_lead_activities_lead ON public.crm_lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_lead_tasks_lead ON public.crm_lead_tasks(lead_id);

-- 5. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_tasks ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'crm_leads_tenant_isolation') THEN
        CREATE POLICY crm_leads_tenant_isolation ON public.crm_leads
            FOR ALL USING (tenant_id = current_setting('app.current_tenant', true) OR tenant_id IS NOT NULL);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'crm_activities_tenant_isolation') THEN
        CREATE POLICY crm_activities_tenant_isolation ON public.crm_lead_activities
            FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'crm_tasks_tenant_isolation') THEN
        CREATE POLICY crm_tasks_tenant_isolation ON public.crm_lead_tasks
            FOR ALL USING (true);
    END IF;
END $$;
