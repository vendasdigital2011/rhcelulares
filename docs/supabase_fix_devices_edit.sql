-- Execute uma vez no SQL Editor do Supabase para alinhar o banco com a tela de estoque.
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT 'Vitrine Principal';
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS internal_code VARCHAR(50);

ALTER TABLE public.devices DROP CONSTRAINT IF EXISTS devices_status_check;
ALTER TABLE public.devices ADD CONSTRAINT devices_status_check CHECK (
  status IN ('available', 'showcase', 'reserved', 'sold', 'warranty', 'in_technical_service', 'returned_to_supplier')
);
