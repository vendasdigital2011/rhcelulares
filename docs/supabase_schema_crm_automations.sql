-- ==============================================================================
-- HIAGO IPHONES ERP — SCHEMA AUTOMAÇÕES OPERACIONAIS & IA (RF05 & RF06)
-- Tabelas: crm_automations, crm_ai_logs
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE FILA DE AUTOMAÇÕES OPERACIONAIS
CREATE TABLE IF NOT EXISTS public.crm_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('os_ready', 'sale_completed', 'budget_no_reply', 'lead_idle', 'dissatisfied_client')),
    title VARCHAR(150) NOT NULL,
    target_name VARCHAR(255) NOT NULL,
    target_phone VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100), -- ID da OS, ID da venda ou ID do Lead
    reference_type VARCHAR(50), -- 'service_order', 'sale', 'lead'
    suggested_message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE,
    executed_by VARCHAR(100),
    UNIQUE (trigger_type, reference_id)
);

CREATE INDEX IF NOT EXISTS idx_crm_automations_status ON public.crm_automations(status);
CREATE INDEX IF NOT EXISTS idx_crm_automations_trigger ON public.crm_automations(trigger_type);

-- 2. TABELA DE AUDITORIA DE RECOMENDAÇÕES DA IA
CREATE TABLE IF NOT EXISTS public.crm_ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES public.whatsapp_chats(id) ON DELETE SET NULL,
    intent_detected VARCHAR(80),
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    model_used VARCHAR(50) DEFAULT 'gpt-4o-mini',
    suggestions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. POLÍTICAS RLS
ALTER TABLE public.crm_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_ai_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for crm_automations" ON public.crm_automations;
CREATE POLICY "Public access for crm_automations" ON public.crm_automations
  FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for crm_ai_logs" ON public.crm_ai_logs;
CREATE POLICY "Public access for crm_ai_logs" ON public.crm_ai_logs
  FOR ALL TO public USING (true) WITH CHECK (true);

