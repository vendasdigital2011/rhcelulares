-- CRM Hiago — integridade operacional de vendas e estoque
-- Aplicar no SQL Editor do Supabase após os schemas base, estoque/vitrine,
-- gestão e patch comercial.
-- A função de estorno usa uma única transação PostgreSQL: qualquer erro desfaz tudo.

BEGIN;

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(100);

ALTER TABLE public.sale_items
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items(product_id);

CREATE TABLE IF NOT EXISTS public.sale_reversals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL UNIQUE REFERENCES public.sales(id) ON DELETE RESTRICT,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (length(trim(reason)) >= 5),
  reversed_by VARCHAR(100) NOT NULL,
  reversed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.commission_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE RESTRICT,
  commission_record_id UUID NOT NULL REFERENCES public.commission_records(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'waived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (sale_id, commission_record_id)
);

-- Limpa duplicatas pré-existentes de estorno antes de criar o índice único
DELETE FROM public.cash_transactions
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY sale_id
             ORDER BY created_at DESC, id DESC
           ) AS rnum
      FROM public.cash_transactions
     WHERE category = 'estorno'
       AND sale_id IS NOT NULL
  ) dupes
  WHERE rnum > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cash_sale_reversal
  ON public.cash_transactions(sale_id)
  WHERE category = 'estorno';

CREATE OR REPLACE FUNCTION public.apply_accessory_sale_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_previous INTEGER;
  v_new INTEGER;
BEGIN
  IF NEW.item_type <> 'accessory' OR NEW.product_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT current_stock
    INTO v_previous
    FROM public.products
   WHERE id = NEW.product_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto % não encontrado', NEW.product_id;
  END IF;

  IF v_previous < NEW.quantity THEN
    RAISE EXCEPTION 'Estoque insuficiente para %. Disponível: %, solicitado: %', NEW.name, v_previous, NEW.quantity;
  END IF;

  v_new := v_previous - NEW.quantity;
  UPDATE public.products SET current_stock = v_new, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.product_id;

  INSERT INTO public.inventory_movements (
    item_type, item_id, item_name, movement_type, quantity,
    previous_stock, new_stock, reason, reference_id, operator_name
  ) VALUES (
    'product', NEW.product_id::text, NEW.name, 'outflow_sale', NEW.quantity,
    v_previous, v_new, 'Baixa automática por venda', NEW.sale_id::text, 'Sistema'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sale_item_accessory_stock ON public.sale_items;
CREATE TRIGGER trg_sale_item_accessory_stock
AFTER INSERT ON public.sale_items
FOR EACH ROW EXECUTE FUNCTION public.apply_accessory_sale_stock();

CREATE OR REPLACE FUNCTION public.create_product_transaction(p_product JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_product public.products%ROWTYPE;
  v_initial_stock INTEGER := coalesce((p_product->>'current_stock')::integer, 0);
BEGIN
  IF nullif(trim(p_product->>'name'), '') IS NULL THEN RAISE EXCEPTION 'Nome do produto é obrigatório'; END IF;
  IF nullif(trim(p_product->>'sku'), '') IS NULL THEN RAISE EXCEPTION 'SKU do produto é obrigatório'; END IF;
  IF v_initial_stock < 0 THEN RAISE EXCEPTION 'Estoque inicial não pode ser negativo'; END IF;

  INSERT INTO public.products (
    name, sku, barcode, brand, category, description, unit,
    cost_price, sell_price, current_stock, min_stock, reserved_stock,
    supplier_id, location, status
  ) VALUES (
    trim(p_product->>'name'), trim(p_product->>'sku'), nullif(trim(p_product->>'barcode'), ''),
    coalesce(nullif(trim(p_product->>'brand'), ''), 'Hiago Tech'),
    coalesce(nullif(trim(p_product->>'category'), ''), 'Capa'),
    nullif(trim(p_product->>'description'), ''), coalesce(nullif(trim(p_product->>'unit'), ''), 'un'),
    coalesce((p_product->>'cost_price')::numeric, 0), coalesce((p_product->>'sell_price')::numeric, 0),
    v_initial_stock, coalesce((p_product->>'min_stock')::integer, 5),
    coalesce((p_product->>'reserved_stock')::integer, 0),
    nullif(p_product->>'supplier_id', '')::uuid, nullif(trim(p_product->>'location'), ''),
    coalesce(nullif(trim(p_product->>'status'), ''), 'active')
  ) RETURNING * INTO v_product;

  IF v_initial_stock > 0 THEN
    INSERT INTO public.inventory_movements (
      item_type, item_id, item_name, movement_type, quantity,
      previous_stock, new_stock, unit_cost, reason, operator_name
    ) VALUES (
      'product', v_product.id::text, v_product.name, 'adjustment', v_initial_stock,
      0, v_initial_stock, v_product.cost_price, 'Saldo inicial informado no cadastro', 'Sistema'
    );
  END IF;

  RETURN to_jsonb(v_product);
END;
$$;

CREATE OR REPLACE FUNCTION public.adjust_product_stock(
  p_product_id UUID,
  p_delta INTEGER,
  p_reason TEXT,
  p_operator TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_product public.products%ROWTYPE;
  v_new_stock INTEGER;
BEGIN
  IF p_delta = 0 THEN RAISE EXCEPTION 'A quantidade do ajuste não pode ser zero'; END IF;
  IF length(trim(coalesce(p_reason, ''))) < 3 THEN RAISE EXCEPTION 'Informe o motivo do ajuste'; END IF;

  SELECT * INTO v_product FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Produto não encontrado ou sem permissão de acesso'; END IF;

  v_new_stock := v_product.current_stock + p_delta;
  IF v_new_stock < 0 THEN
    RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, saída solicitada: %', v_product.current_stock, abs(p_delta);
  END IF;

  UPDATE public.products
     SET current_stock = v_new_stock, updated_at = CURRENT_TIMESTAMP
   WHERE id = p_product_id;

  INSERT INTO public.inventory_movements (
    item_type, item_id, item_name, movement_type, quantity,
    previous_stock, new_stock, unit_cost, reason, operator_name
  ) VALUES (
    'product', v_product.id::text, v_product.name, 'adjustment', abs(p_delta),
    v_product.current_stock, v_new_stock, v_product.cost_price, trim(p_reason),
    coalesce(nullif(trim(p_operator), ''), 'Sistema')
  );

  RETURN jsonb_build_object('product_id', v_product.id, 'new_stock', v_new_stock);
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_sale_transaction(
  p_sale_id UUID,
  p_reason TEXT,
  p_cancelled_by TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_sale public.sales%ROWTYPE;
  v_register_id UUID;
  v_tx RECORD;
  v_bill RECORD;
  v_paid_commissions INTEGER := 0;
BEGIN
  IF length(trim(coalesce(p_reason, ''))) < 5 THEN
    RAISE EXCEPTION 'Informe um motivo de estorno com pelo menos 5 caracteres';
  END IF;

  SELECT * INTO v_sale
    FROM public.sales
   WHERE id = p_sale_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada ou sem permissão de acesso';
  END IF;

  IF coalesce(v_sale.status, 'completed') = 'cancelled' THEN
    RAISE EXCEPTION 'Esta venda já foi estornada';
  END IF;

  INSERT INTO public.sale_reversals (sale_id, store_id, reason, reversed_by, snapshot)
  VALUES (
    v_sale.id,
    v_sale.store_id,
    trim(p_reason),
    coalesce(nullif(trim(p_cancelled_by), ''), 'Sistema'),
    to_jsonb(v_sale)
  );

  UPDATE public.sales
     SET status = 'cancelled',
         cancellation_reason = trim(p_reason),
         cancelled_at = CURRENT_TIMESTAMP,
         cancelled_by = coalesce(nullif(trim(p_cancelled_by), ''), 'Sistema')
   WHERE id = v_sale.id;

  UPDATE public.devices d
     SET status = 'available', updated_at = CURRENT_TIMESTAMP
   WHERE EXISTS (
     SELECT 1 FROM public.sale_items si
      WHERE si.sale_id = v_sale.id
        AND si.item_type = 'device'
        AND si.imei = d.imei
   );

  WITH sold_products AS (
    SELECT product_id, min(name) AS name, sum(quantity)::integer AS quantity
      FROM public.sale_items
     WHERE sale_id = v_sale.id AND item_type = 'accessory' AND product_id IS NOT NULL
     GROUP BY product_id
  ), restored AS (
    UPDATE public.products p
       SET current_stock = p.current_stock + sp.quantity,
           updated_at = CURRENT_TIMESTAMP
      FROM sold_products sp
     WHERE p.id = sp.product_id
     RETURNING p.id, p.name, sp.quantity, p.current_stock - sp.quantity AS previous_stock, p.current_stock AS new_stock
  )
  INSERT INTO public.inventory_movements (
    item_type, item_id, item_name, movement_type, quantity,
    previous_stock, new_stock, reason, reference_id, operator_name
  )
  SELECT 'product', id::text, name, 'devolution', quantity,
         previous_stock, new_stock, 'Reposição por estorno de venda', v_sale.id::text,
         coalesce(nullif(trim(p_cancelled_by), ''), 'Sistema')
    FROM restored;

  SELECT register_id INTO v_register_id
    FROM public.cash_transactions
   WHERE sale_id = v_sale.id AND category = 'sale'
   ORDER BY created_at ASC
   LIMIT 1;

  IF v_register_id IS NULL THEN
    SELECT id INTO v_register_id
      FROM public.cash_registers
     WHERE status = 'open'
     ORDER BY opened_at DESC
     LIMIT 1;
  END IF;

  INSERT INTO public.cash_transactions (
    register_id, type, category, description, amount, payment_method, sale_id
  ) VALUES (
    v_register_id, 'outflow', 'estorno',
    format('Estorno Venda %s (%s)', v_sale.sale_number, trim(p_reason)),
    v_sale.total_amount, v_sale.payment_method, v_sale.id
  );

  IF v_register_id IS NOT NULL THEN
    UPDATE public.cash_registers
       SET total_sales = greatest(0, coalesce(total_sales, 0) - v_sale.total_amount)
     WHERE id = v_register_id;
  END IF;

  FOR v_tx IN
    SELECT id, account_id, type, amount
      FROM public.financial_transactions
     WHERE origin = 'sale'
       AND reference_id IN (v_sale.id::text, v_sale.sale_number)
       AND status IN ('confirmed', 'reconciled')
     FOR UPDATE
  LOOP
    IF v_tx.account_id IS NOT NULL THEN
      UPDATE public.financial_accounts
         SET current_balance = current_balance - CASE WHEN v_tx.type = 'inflow' THEN v_tx.amount ELSE -v_tx.amount END
       WHERE id = v_tx.account_id;
    END IF;
    UPDATE public.financial_transactions SET status = 'cancelled' WHERE id = v_tx.id;
  END LOOP;

  FOR v_bill IN
    SELECT id FROM public.bills_to_receive WHERE sale_id = v_sale.id FOR UPDATE
  LOOP
    FOR v_tx IN
      SELECT id, account_id, type, amount
        FROM public.financial_transactions
       WHERE origin = 'bill_receive'
         AND reference_id = v_bill.id::text
         AND status IN ('confirmed', 'reconciled')
       FOR UPDATE
    LOOP
      IF v_tx.account_id IS NOT NULL THEN
        UPDATE public.financial_accounts
           SET current_balance = current_balance - CASE WHEN v_tx.type = 'inflow' THEN v_tx.amount ELSE -v_tx.amount END
         WHERE id = v_tx.account_id;
      END IF;
      UPDATE public.financial_transactions SET status = 'cancelled' WHERE id = v_tx.id;
    END LOOP;
  END LOOP;

  UPDATE public.bills_to_receive
     SET status = 'cancelled', remaining_amount = 0
   WHERE sale_id = v_sale.id AND status <> 'cancelled';

  UPDATE public.commission_records
     SET status = 'cancelled'
   WHERE sale_id = v_sale.id AND status IN ('pending_target', 'unlocked');

  INSERT INTO public.commission_adjustments (sale_id, commission_record_id, amount, reason)
  SELECT v_sale.id, id, calculated_amount, 'Ajuste por estorno de venda já comissionada'
    FROM public.commission_records
   WHERE sale_id = v_sale.id AND status = 'paid'
  ON CONFLICT (sale_id, commission_record_id) DO NOTHING;
  GET DIAGNOSTICS v_paid_commissions = ROW_COUNT;

  UPDATE public.customers
     SET total_spent = greatest(0, coalesce(total_spent, 0) - v_sale.total_amount),
         updated_at = CURRENT_TIMESTAMP
   WHERE id = v_sale.customer_id
      OR (v_sale.customer_id IS NULL AND phone = v_sale.customer_phone);

  UPDATE public.after_sales_tasks
     SET status = 'cancelled', notes = concat_ws(E'\n', notes, 'Cancelada automaticamente por estorno da venda')
   WHERE sale_id = v_sale.id AND status = 'pending';

  RETURN jsonb_build_object(
    'sale_id', v_sale.id,
    'status', 'cancelled',
    'paid_commission_adjustments', v_paid_commissions
  );
END;
$$;

ALTER TABLE public.sale_reversals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_adjustments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for sale_reversals" ON public.sale_reversals;
CREATE POLICY "Public access for sale_reversals" ON public.sale_reversals
  FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for commission_adjustments" ON public.commission_adjustments;
CREATE POLICY "Public access for commission_adjustments" ON public.commission_adjustments
  FOR ALL TO public USING (true) WITH CHECK (true);

GRANT EXECUTE ON FUNCTION public.cancel_sale_transaction(UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_product_stock(UUID, INTEGER, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_product_transaction(JSONB) TO anon, authenticated;

COMMIT;
