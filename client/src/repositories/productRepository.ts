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
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(`Falha ao carregar produtos: ${error.message}`);

    this.localProducts = (data || []).map(this.mapFromDb);
    return this.localProducts;
  }

  static async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: Product; error?: string }> {
    try {
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
      const { data, error } = await supabase.rpc('create_product_transaction', {
        p_product: payload,
      });

      if (error) return { success: false, error: error.message };
      if (!data?.id) return { success: false, error: 'O banco não confirmou o cadastro do produto.' };

      const newProd: Product = this.mapFromDb(data);

      this.localProducts.unshift(newProd);
      return { success: true, data: newProd };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Falha inesperada ao cadastrar o produto.',
      };
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

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select('id')
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('Produto não encontrado ou sem permissão para edição.');

      const idx = this.localProducts.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.localProducts[idx] = { ...this.localProducts[idx], ...updates };
      }
      return true;
    } catch {
      return false;
    }
  }

  static async adjustStock(id: string, deltaQuantity: number, reason: string, operatorName: string = 'Hiago'): Promise<{ success: boolean; newStock?: number }> {
    try {
      const { data, error } = await supabase.rpc('adjust_product_stock', {
        p_product_id: id,
        p_delta: deltaQuantity,
        p_reason: reason,
        p_operator: operatorName,
      });
      if (error) throw new Error(error.message);
      const newStock = Number((data as { new_stock?: number } | null)?.new_stock);
      if (!Number.isFinite(newStock)) throw new Error('O banco não confirmou o novo saldo do estoque.');

      const prod = this.localProducts.find(p => p.id === id);
      if (prod) prod.currentStock = newStock;
      return { success: true, newStock };
    } catch {
      return { success: false };
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) throw new Error('Produto não encontrado ou sem permissão para exclusão.');
      this.localProducts = this.localProducts.filter(p => p.id !== id);
      return true;
    } catch {
      return false;
    }
  }
}
