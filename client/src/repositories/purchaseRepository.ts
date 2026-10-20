import { supabase } from '../services/supabaseClient.js';
import { DeviceRepository } from './deviceRepository.js';
import { MovementRepository } from './movementRepository.js';
import { CashRepository } from './cashRepository.js';
import type { PhonePurchase, Device } from '../types.js';

const INITIAL_PURCHASES: PhonePurchase[] = [];

export class PurchaseRepository {
  private static localPurchases: PhonePurchase[] = [...INITIAL_PURCHASES];

  private static mapFromDb(row: any): PhonePurchase {
    return {
      id: row.id,
      purchaseNumber: row.purchase_number,
      date: row.date,
      supplierId: row.supplier_id || undefined,
      customer: row.customer,
      cpf: row.cpf || undefined,
      phone: row.phone || undefined,
      address: row.address || undefined,
      seller: row.seller || 'Hiago',
      items: Array.isArray(row.items) ? row.items : [],
      subtotal: Number(row.subtotal || 0),
      additionalExpenses: Number(row.additional_expenses || 0),
      discounts: Number(row.discounts || 0),
      totalAmount: Number(row.total_amount || 0),
      paymentMethod: row.payment_method || 'Pix',
      paymentStatus: row.payment_status || 'paid',
      status: row.status || 'confirmed',
      notes: row.notes || undefined,
      hasContract: row.has_contract !== false,
      createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  }

  static async getAll(): Promise<PhonePurchase[]> {
    try {
      const { data, error } = await supabase
        .from('phone_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return this.localPurchases;
      }

      this.localPurchases = data.map(this.mapFromDb);
      return this.localPurchases;
    } catch {
      return this.localPurchases;
    }
  }

  static async create(purchase: Omit<PhonePurchase, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: PhonePurchase; error?: string }> {
    try {
      const isUUID = (str?: string) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
      const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cp-${Date.now()}`;

      const payload: any = {
        purchase_number: purchase.purchaseNumber,
        date: purchase.date,
        supplier_id: purchase.supplierId && isUUID(purchase.supplierId) ? purchase.supplierId : null,
        customer: purchase.customer,
        cpf: purchase.cpf || null,
        phone: purchase.phone || null,
        address: purchase.address || null,
        seller: purchase.seller,
        items: purchase.items,
        subtotal: purchase.subtotal,
        additional_expenses: purchase.additionalExpenses || 0,
        discounts: purchase.discounts || 0,
        total_amount: purchase.totalAmount,
        payment_method: purchase.paymentMethod,
        payment_status: purchase.paymentStatus,
        status: purchase.status,
        notes: purchase.notes || null,
        has_contract: purchase.hasContract ?? true,
      };
      if (isUUID(generatedId)) {
        payload.id = generatedId;
      }

      const { data, error } = await supabase
        .from('phone_purchases')
        .insert([payload])
        .select('*')
        .maybeSingle();

      const newPurchase: PhonePurchase = data ? this.mapFromDb(data) : {
        ...purchase,
        id: generatedId,
        createdAt: new Date().toISOString().split('T')[0],
      };

      this.localPurchases.unshift(newPurchase);

      // Se a compra já nasce confirmada, gera entradas de estoque e financeiro
      if (newPurchase.status === 'confirmed') {
        await this.processConfirmationSideEffects(newPurchase);
      }

      return { success: !error, data: newPurchase };
    } catch {
      const fallback: PhonePurchase = {
        ...purchase,
        id: `cp-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      this.localPurchases.unshift(fallback);
      if (fallback.status === 'confirmed') {
        await this.processConfirmationSideEffects(fallback);
      }
      return { success: true, data: fallback };
    }
  }

  static async confirmPurchase(id: string): Promise<boolean> {
    try {
      const purchase = this.localPurchases.find(p => p.id === id);
      if (!purchase || purchase.status === 'confirmed') return false;

      await supabase.from('phone_purchases').update({ status: 'confirmed' }).eq('id', id);

      purchase.status = 'confirmed';
      await this.processConfirmationSideEffects(purchase);
      return true;
    } catch {
      const purchase = this.localPurchases.find(p => p.id === id);
      if (purchase) {
        purchase.status = 'confirmed';
        await this.processConfirmationSideEffects(purchase);
        return true;
      }
      return false;
    }
  }

  private static async processConfirmationSideEffects(purchase: PhonePurchase) {
    // 1. Cria cada aparelho no estoque (se tiver IMEI)
    for (const item of purchase.items) {
      if (!item.imei) continue;

      const devicePayload: Device = {
        id: `dev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        imei: item.imei,
        serialNumber: item.serialNumber,
        brand: 'Apple',
        model: item.model,
        storage: item.storage,
        color: item.color,
        condition: item.condition,
        batteryHealth: item.batteryHealth,
        purchasePrice: item.costPrice,
        sellPrice: item.sellPrice,
        supplier: purchase.customer,
        status: 'available',
        location: 'Vitrine Principal',
        purchaseId: purchase.id,
        isShowcasePublic: true,
        isShowcaseFeatured: false,
        notes: `Aquisição via ${purchase.purchaseNumber}`,
        createdAt: new Date().toISOString().split('T')[0],
      };

      await DeviceRepository.create(devicePayload);

      // 2. Registra a movimentação no histórico
      await MovementRepository.record({
        itemType: 'device',
        itemId: item.imei,
        itemName: `${item.model} ${item.storage} ${item.color}`,
        movementType: 'inflow_purchase',
        quantity: 1,
        previousStock: 0,
        newStock: 1,
        unitCost: item.costPrice,
        reason: `Entrada via compra ${purchase.purchaseNumber} (${purchase.customer})`,
        referenceId: purchase.purchaseNumber,
        operatorName: purchase.seller,
      });
    }

    // 3. Se foi pago à vista / PIX na hora, lança saída no caixa
    if (purchase.paymentStatus === 'paid' && purchase.totalAmount > 0) {
      await CashRepository.addTransaction(
        'outflow',
        'trade_in',
        purchase.totalAmount,
        `Compra de Telefone ${purchase.purchaseNumber} — ${purchase.customer}`,
        purchase.paymentMethod,
        purchase.seller
      );
    }
  }
}
