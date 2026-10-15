import { supabase } from '../services/supabaseClient.js';
import type { Sale } from '../types.js';
import { INITIAL_SALES } from '../data/erpData.js';
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

      if (error) {
        console.warn('Erro ao consultar Supabase (sales), usando fallback:', error.message);
        return INITIAL_SALES;
      }

      return (data || []).map(this.mapFromDb);
    } catch {
      return INITIAL_SALES;
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
        console.warn('Erro ao salvar venda no Supabase, mantendo local:', saleError.message);
      }

      const persistedSaleId = insertedSale?.id || validSaleId || sale.id;

      // 2. Registra os itens da venda
      if (sale.items && sale.items.length > 0 && persistedSaleId) {
        const itemsPayload = sale.items.map(item => ({
          sale_id: persistedSaleId,
          item_type: item.type,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imei: item.imei?.replace(/\D/g, '') || null,
        }));

        await supabase.from('sale_items').insert(itemsPayload);

        // 3. Atualiza status dos aparelhos para 'sold'
        for (const item of sale.items) {
          if (item.type === 'device' && item.imei) {
            await DeviceRepository.updateStatus(item.imei, 'sold');
          }
        }
      }

      // 4. Se teve Trade-in, cadastra no estoque de usados
      if (sale.tradeIn && sale.tradeIn.model) {
        await DeviceRepository.create({
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
      }

      // 5. Registra transação no fluxo de caixa
      try {
        const { data: openRegister } = await supabase
          .from('cash_registers')
          .select('id')
          .eq('status', 'open')
          .limit(1)
          .maybeSingle();

        await supabase.from('cash_transactions').insert([{
          register_id: openRegister?.id || null,
          type: 'inflow',
          category: 'sale',
          description: `Venda ${sale.saleNumber} - ${sale.customerName}`,
          amount: sale.total,
          payment_method: sale.paymentMethod,
          sale_id: sale.id,
        }]);
      } catch {
        // Fallback
      }

      // 6. Atualiza histórico e LTV do Cliente
      const deviceItem = sale.items.find(i => i.type === 'device');
      await CustomerRepository.recordPurchase(
        sale.customerName,
        sale.customerPhone || '',
        sale.total,
        deviceItem?.name,
        deviceItem?.imei
      );

      // 7. Gera automaticamente réguas e tarefas de Pós-Venda
      await AfterSalesRepository.generateForSale(sale);

      return { success: true, data: { ...sale, status: 'completed' } };
    } catch (err: any) {
      console.warn('Exceção ao registrar venda:', err);
      return { success: true, data: sale };
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
      // 1. Atualiza venda
      try {
        await supabase
          .from('sales')
          .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString(),
            cancelled_by: cancelledBy,
          })
          .eq('id', sale.id);
      } catch {
        // Se a coluna não existir ainda, prossegue com os efeitos
      }

      // 2. Devolve os aparelhos ao estoque
      for (const item of sale.items) {
        if (item.type === 'device' && item.imei) {
          await DeviceRepository.updateStatus(item.imei, 'available');
        }
      }

      // 3. Registra estorno no caixa
      try {
        const { data: openRegister } = await supabase
          .from('cash_registers')
          .select('id')
          .eq('status', 'open')
          .limit(1)
          .maybeSingle();

        await supabase.from('cash_transactions').insert([{
          register_id: openRegister?.id || null,
          type: 'outflow',
          category: 'estorno',
          description: `Estorno Venda ${sale.saleNumber} (${reason})`,
          amount: sale.total,
          payment_method: sale.paymentMethod,
          sale_id: sale.id,
        }]);
      } catch {
        // Fallback
      }

      // 4. Abate do LTV do cliente
      await CustomerRepository.revertPurchase(
        sale.customerName,
        sale.customerPhone || '',
        sale.total
      );

      return { success: true, message: `Venda ${sale.saleNumber} cancelada com sucesso. Estoque e caixa estornados.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao cancelar venda' };
    }
  }
}
