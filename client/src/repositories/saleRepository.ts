import { supabase } from '../services/supabaseClient.js';
import type { Sale } from '../types.js';
import { DeviceRepository } from './deviceRepository.js';
import { CustomerRepository } from './customerRepository.js';
import { AfterSalesRepository } from './afterSalesRepository.js';

export class SaleRepository {
  private static mapFromDb(row: any): Sale {
    return {
      id: row.id,
      saleNumber: row.sale_number,
      customerId: row.customer_id || undefined,
      customerName: row.customer_name,
      customerPhone: row.customer_phone || undefined,
      sellerName: row.seller_name,
      date: row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : ''),
      items: row.sale_items ? row.sale_items.map((i: any) => ({
        id: i.id || i.item_id,
        type: i.item_type || 'device',
        name: i.name,
        price: Number(i.price),
        quantity: Number(i.quantity || 1),
        imei: i.imei || undefined,
      })) : (row.items || []),
      tradeIn: row.trade_in_model ? {
        model: row.trade_in_model,
        imei: row.trade_in_imei || undefined,
        batteryHealth: row.trade_in_battery_health || undefined,
        evaluatedValue: Number(row.trade_in_amount || 0),
      } : undefined,
      subtotal: Number(row.subtotal || row.total_amount || 0),
      discount: Number(row.discount || 0),
      total: Number(row.total_amount || row.total || 0),
      paymentMethod: row.payment_method,
      installments: row.installments ? Number(row.installments) : undefined,
      status: row.status || 'completed',
      cancellationReason: row.cancellation_reason || undefined,
      cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).toLocaleString('pt-BR') : undefined,
      cancelledBy: row.cancelled_by || undefined,
    };
  }

  static async getAll(): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Falha ao carregar vendas: ${error.message}`);

      return (data || []).map(this.mapFromDb);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Falha inesperada ao carregar vendas.');
    }
  }

  static async create(sale: Sale): Promise<{ success: boolean; data?: Sale; error?: string }> {
    try {
      const isUUID = (str?: string) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
      const validSaleId = isUUID(sale.id) ? sale.id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined);

      const salePayload: any = {
        sale_number: sale.saleNumber,
        customer_name: sale.customerName,
        customer_phone: sale.customerPhone || null,
        seller_name: sale.sellerName,
        total_amount: sale.total,
        subtotal: sale.subtotal,
        discount: sale.discount,
        payment_method: sale.paymentMethod,
        installments: sale.installments || 1,
        trade_in_model: sale.tradeIn?.model || null,
        trade_in_imei: sale.tradeIn?.imei || null,
        trade_in_battery_health: sale.tradeIn?.batteryHealth || null,
        trade_in_amount: sale.tradeIn?.evaluatedValue || 0,
        date: sale.date || new Date().toLocaleDateString('pt-BR'),
      };
      if (validSaleId) {
        salePayload.id = validSaleId;
      }

      const { data: insertedSale, error: saleError } = await supabase
        .from('sales')
        .insert([salePayload])
        .select('id')
        .maybeSingle();

      if (saleError) {
        return { success: false, error: saleError.message };
      }

      const persistedSaleId = insertedSale?.id || validSaleId || sale.id;

      // 2. Registra os itens da venda
      if (sale.items && sale.items.length > 0 && persistedSaleId) {
        const itemsPayload = sale.items.map(item => ({
          sale_id: persistedSaleId,
          item_type: item.type,
          product_id: item.type === 'accessory' && isUUID(item.id) ? item.id : null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imei: item.imei?.replace(/\D/g, '') || null,
        }));

        const { error: itemsError } = await supabase.from('sale_items').insert(itemsPayload);
        if (itemsError) throw new Error(itemsError.message);

        // 3. Atualiza status dos aparelhos para 'sold'
        for (const item of sale.items) {
          if (item.type === 'device' && item.imei) {
            const updated = await DeviceRepository.updateStatus(item.imei, 'sold');
            if (!updated) throw new Error(`Não foi possível baixar o aparelho ${item.imei} do estoque.`);
          }
        }
      }

      // 4. Se teve Trade-in, cadastra no estoque de usados
      if (sale.tradeIn && sale.tradeIn.model) {
        const tradeInResult = await DeviceRepository.create({
          id: `dev-tradein-${Date.now()}`,
          brand: 'Apple',
          model: sale.tradeIn.model,
          storage: 'Entrada',
          color: 'Usado',
          condition: 'certified_pre_owned',
          batteryHealth: sale.tradeIn.batteryHealth || 80,
          imei: sale.tradeIn.imei || '',
          purchasePrice: sale.tradeIn.evaluatedValue,
          sellPrice: Math.round(sale.tradeIn.evaluatedValue * 1.3),
          supplier: `Trade-in (${sale.customerName})`,
          status: 'available',
          isShowcasePublic: false,
          createdAt: new Date().toISOString().split('T')[0],
        });
        if (!tradeInResult.success) {
          throw new Error(tradeInResult.error || 'Não foi possível cadastrar o aparelho recebido na troca.');
        }
      }

      // 5. Registra transação no fluxo de caixa
      try {
        const { data: openRegister } = await supabase
          .from('cash_registers')
          .select('id')
          .eq('status', 'open')
          .limit(1)
          .maybeSingle();

        const { error: cashError } = await supabase.from('cash_transactions').insert([{
          register_id: openRegister?.id || null,
          type: 'inflow',
          category: 'sale',
          description: `Venda ${sale.saleNumber} - ${sale.customerName}`,
          amount: sale.total,
          payment_method: sale.paymentMethod,
          sale_id: persistedSaleId,
        }]);
        if (cashError) throw new Error(cashError.message);
      } catch (err) {
        throw err instanceof Error ? err : new Error('Falha ao registrar a entrada da venda no caixa.');
      }

      // 6. Atualiza histórico e LTV do Cliente
      const deviceItem = sale.items.find(i => i.type === 'device');
      const updatedCustomer = await CustomerRepository.recordPurchase(
        sale.customerName,
        sale.customerPhone || '',
        sale.total,
        deviceItem?.name,
        deviceItem?.imei
      );
      if (!updatedCustomer) throw new Error('Não foi possível atualizar o histórico do cliente.');

      // 7. Gera automaticamente réguas e tarefas de Pós-Venda
      const persistedSale: Sale = { ...sale, id: persistedSaleId, status: 'completed' };
      await AfterSalesRepository.generateForSale(persistedSale);

      return { success: true, data: persistedSale };
    } catch (err: any) {
      console.warn('Exceção ao registrar venda:', err);
      return { success: false, error: err?.message || 'Falha inesperada ao registrar venda.' };
    }
  }

  /**
   * Cancelamento / Estorno Completo de Venda:
   * - Altera status da venda para 'cancelled'
   * - Devolve aparelhos vendidos ao estoque ('available')
   * - Registra saída de estorno em cash_transactions
   * - Abate o valor do LTV do cliente
   */
  static async cancelSale(
    sale: Sale, 
    reason: string, 
    cancelledBy: string = 'Hiago'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const normalizedReason = reason.trim();
      if (normalizedReason.length < 5) {
        return { success: false, message: 'Informe um motivo de estorno com pelo menos 5 caracteres.' };
      }
      if (!sale.id) return { success: false, message: 'Venda sem identificador persistido.' };

      const { error: rpcError } = await supabase.rpc('cancel_sale_transaction', {
        p_sale_id: sale.id,
        p_reason: normalizedReason,
        p_cancelled_by: cancelledBy,
      });
      if (rpcError) throw new Error(rpcError.message);

      const { data: persistedSale, error: verificationError } = await supabase
        .from('sales')
        .select('id, status, cancellation_reason')
        .eq('id', sale.id)
        .maybeSingle();

      if (verificationError) throw new Error(`Falha ao confirmar o estorno: ${verificationError.message}`);
      if (!persistedSale || persistedSale.status !== 'cancelled') {
        throw new Error('O banco não confirmou o estorno da venda.');
      }

      return { success: true, message: `Venda ${sale.saleNumber} estornada e confirmada no banco.` };
    } catch (err: any) {
      const migrationHint = String(err?.message || '').includes('cancel_sale_transaction')
        ? ' Aplique a migração docs/supabase_integridade_operacional.sql no Supabase.'
        : '';
      return { success: false, message: `${err?.message || 'Erro ao cancelar venda'}${migrationHint}` };
    }
  }
}
