import { supabase } from '../services/supabaseClient.js';
import type { Part } from '../types.js';

const INITIAL_PARTS: Part[] = [];

export class PartRepository {
  private static localParts: Part[] = [...INITIAL_PARTS];

  private static mapFromDb(row: any): Part {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      sku: row.sku || row.code,
      category: row.category || 'Display',
      manufacturer: row.manufacturer || 'Foxconn OEM',
      compatibleModels: Array.isArray(row.compatible_models) ? row.compatible_models : [],
      currentStock: Number(row.current_stock || 0),
      minStock: Number(row.min_stock || 2),
      reservedStock: Number(row.reserved_stock || 0),
      costPrice: Number(row.cost_price || 0),
      sellPrice: Number(row.sell_price || 0),
      supplierId: row.supplier_id || undefined,
      location: row.location || undefined,
      status: row.status || 'active',
      createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  }

  static async getAll(): Promise<Part[]> {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.localParts;
      }

      this.localParts = data.map(this.mapFromDb);
      return this.localParts;
    } catch {
      return this.localParts;
    }
  }

  static async create(part: Omit<Part, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: Part; error?: string }> {
    try {
      const isUUID = (str?: string) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
      const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `part-${Date.now()}`;

      const payload: any = {
        name: part.name,
        code: part.code,
        sku: part.sku || part.code,
        category: part.category,
        manufacturer: part.manufacturer,
        compatible_models: part.compatibleModels,
        current_stock: part.currentStock,
        min_stock: part.minStock,
        reserved_stock: part.reservedStock || 0,
        cost_price: part.costPrice,
        sell_price: part.sellPrice,
        supplier_id: part.supplierId || null,
        location: part.location || null,
        status: part.status || 'active',
      };
      if (isUUID(generatedId)) {
        payload.id = generatedId;
      }

      const { data, error } = await supabase
        .from('parts')
        .insert([payload])
        .select('*')
        .maybeSingle();

      const newPart: Part = data ? this.mapFromDb(data) : {
        ...part,
        id: generatedId,
        createdAt: new Date().toISOString().split('T')[0],
      };

      this.localParts.unshift(newPart);
      return { success: !error, data: newPart };
    } catch {
      const fallback: Part = {
        ...part,
        id: `part-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      this.localParts.unshift(fallback);
      return { success: true, data: fallback };
    }
  }

  static async update(id: string, updates: Partial<Part>): Promise<boolean> {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.code !== undefined) payload.code = updates.code;
      if (updates.sku !== undefined) payload.sku = updates.sku;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.manufacturer !== undefined) payload.manufacturer = updates.manufacturer;
      if (updates.compatibleModels !== undefined) payload.compatible_models = updates.compatibleModels;
      if (updates.costPrice !== undefined) payload.cost_price = updates.costPrice;
      if (updates.sellPrice !== undefined) payload.sell_price = updates.sellPrice;
      if (updates.currentStock !== undefined) payload.current_stock = updates.currentStock;
      if (updates.minStock !== undefined) payload.min_stock = updates.minStock;
      if (updates.reservedStock !== undefined) payload.reserved_stock = updates.reservedStock;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.status !== undefined) payload.status = updates.status;

      await supabase.from('parts').update(payload).eq('id', id);

      const idx = this.localParts.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.localParts[idx] = { ...this.localParts[idx], ...updates };
      }
      return true;
    } catch {
      const idx = this.localParts.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.localParts[idx] = { ...this.localParts[idx], ...updates };
      }
      return true;
    }
  }

  static async adjustStock(id: string, deltaQuantity: number, reason: string, operatorName: string = 'Hiago'): Promise<{ success: boolean; newStock?: number }> {
    try {
      const part = this.localParts.find(p => p.id === id);
      if (!part) return { success: false };

      const prevStock = part.currentStock;
      const newStock = Math.max(0, prevStock + deltaQuantity);

      await this.update(id, { currentStock: newStock });

      await supabase.from('inventory_movements').insert([{
        item_type: 'part',
        item_id: id,
        item_name: part.name,
        movement_type: deltaQuantity >= 0 ? 'adjustment' : 'os_consumption',
        quantity: Math.abs(deltaQuantity),
        previous_stock: prevStock,
        new_stock: newStock,
        unit_cost: part.costPrice,
        reason,
        operator_name: operatorName,
      }]);

      return { success: true, newStock };
    } catch {
      const part = this.localParts.find(p => p.id === id);
      if (part) {
        part.currentStock = Math.max(0, part.currentStock + deltaQuantity);
        return { success: true, newStock: part.currentStock };
      }
      return { success: false };
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await supabase.from('parts').delete().eq('id', id);
      this.localParts = this.localParts.filter(p => p.id !== id);
      return true;
    } catch {
      this.localParts = this.localParts.filter(p => p.id !== id);
      return true;
    }
  }
}
