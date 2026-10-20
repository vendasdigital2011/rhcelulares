import { supabase } from '../services/supabaseClient.js';
import type { Product } from '../types.js';

const INITIAL_PRODUCTS: Product[] = [];

export class ProductRepository {
  private static localProducts: Product[] = [...INITIAL_PRODUCTS];

  private static mapFromDb(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      sku: row.sku,
      barcode: row.barcode || undefined,
      brand: row.brand || 'Hiago Tech',
      category: row.category || 'Capa',
      description: row.description || undefined,
      unit: row.unit || 'un',
      costPrice: Number(row.cost_price || 0),
      sellPrice: Number(row.sell_price || 0),
      currentStock: Number(row.current_stock || 0),
      minStock: Number(row.min_stock || 5),
      reservedStock: Number(row.reserved_stock || 0),
      supplierId: row.supplier_id || undefined,
      supplierName: row.supplier_name || undefined,
      location: row.location || undefined,
      status: row.status || 'active',
      createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  }

  static async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.localProducts;
      }

      this.localProducts = data.map(this.mapFromDb);
      return this.localProducts;
    } catch {
      return this.localProducts;
    }
  }

  static async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: Product; error?: string }> {
    try {
      const isUUID = (str?: string) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
      const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prod-${Date.now()}`;

      const payload: any = {
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || null,
        brand: product.brand,
        category: product.category,
        description: product.description || null,
        unit: product.unit || 'un',
        cost_price: product.costPrice,
        sell_price: product.sellPrice,
        current_stock: product.currentStock,
        min_stock: product.minStock,
        reserved_stock: product.reservedStock || 0,
        supplier_id: product.supplierId || null,
        location: product.location || null,
        status: product.status || 'active',
      };
      if (isUUID(generatedId)) {
        payload.id = generatedId;
      }

      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select('*')
        .maybeSingle();

      const newProd: Product = data ? this.mapFromDb(data) : {
        ...product,
        id: generatedId,
        createdAt: new Date().toISOString().split('T')[0],
      };

      this.localProducts.unshift(newProd);
      return { success: !error, data: newProd };
    } catch {
      const fallback: Product = {
        ...product,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      this.localProducts.unshift(fallback);
      return { success: true, data: fallback };
    }
  }

  static async update(id: string, updates: Partial<Product>): Promise<boolean> {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.sku !== undefined) payload.sku = updates.sku;
      if (updates.barcode !== undefined) payload.barcode = updates.barcode;
      if (updates.brand !== undefined) payload.brand = updates.brand;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.costPrice !== undefined) payload.cost_price = updates.costPrice;
      if (updates.sellPrice !== undefined) payload.sell_price = updates.sellPrice;
      if (updates.currentStock !== undefined) payload.current_stock = updates.currentStock;
      if (updates.minStock !== undefined) payload.min_stock = updates.minStock;
      if (updates.reservedStock !== undefined) payload.reserved_stock = updates.reservedStock;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.status !== undefined) payload.status = updates.status;

      await supabase.from('products').update(payload).eq('id', id);

      const idx = this.localProducts.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.localProducts[idx] = { ...this.localProducts[idx], ...updates };
      }
      return true;
    } catch {
      const idx = this.localProducts.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.localProducts[idx] = { ...this.localProducts[idx], ...updates };
      }
      return true;
    }
  }

  static async adjustStock(id: string, deltaQuantity: number, reason: string, operatorName: string = 'Hiago'): Promise<{ success: boolean; newStock?: number }> {
    try {
      const prod = this.localProducts.find(p => p.id === id);
      if (!prod) return { success: false };

      const prevStock = prod.currentStock;
      const newStock = Math.max(0, prevStock + deltaQuantity);

      await this.update(id, { currentStock: newStock });

      // Registra movimentação no histórico
      await supabase.from('inventory_movements').insert([{
        item_type: 'product',
        item_id: id,
        item_name: prod.name,
        movement_type: deltaQuantity >= 0 ? 'adjustment' : 'outflow_sale',
        quantity: Math.abs(deltaQuantity),
        previous_stock: prevStock,
        new_stock: newStock,
        unit_cost: prod.costPrice,
        reason,
        operator_name: operatorName,
      }]);

      return { success: true, newStock };
    } catch {
      const prod = this.localProducts.find(p => p.id === id);
      if (prod) {
        prod.currentStock = Math.max(0, prod.currentStock + deltaQuantity);
        return { success: true, newStock: prod.currentStock };
      }
      return { success: false };
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await supabase.from('products').delete().eq('id', id);
      this.localProducts = this.localProducts.filter(p => p.id !== id);
      return true;
    } catch {
      this.localProducts = this.localProducts.filter(p => p.id !== id);
      return true;
    }
  }
}
