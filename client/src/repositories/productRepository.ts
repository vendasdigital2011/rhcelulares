import { supabase } from '../services/supabaseClient.js';
import type { Product } from '../types.js';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Capa Magnética MagSafe Silicone iPhone 13/14',
    sku: 'CAP-MAG-1314',
    barcode: '789123456001',
    brand: 'Hiago Tech',
    category: 'Capa',
    description: 'Silicone aveludado interno com ímã de forte fixação para carregadores MagSafe.',
    unit: 'un',
    costPrice: 22.00,
    sellPrice: 69.90,
    currentStock: 24,
    minStock: 8,
    reservedStock: 0,
    location: 'Expositor Vitrine A',
    status: 'active',
    createdAt: '2026-01-20',
  },
  {
    id: 'prod-2',
    name: 'Película de Vidro 3D Privacidade 9H iPhone 13',
    sku: 'PEL-PRIV-13',
    barcode: '789123456002',
    brand: 'Hiago Tech',
    category: 'Película',
    description: 'Bloqueio lateral de visão 28 graus com borda curva e tratamento oleofóbico.',
    unit: 'un',
    costPrice: 8.50,
    sellPrice: 45.00,
    currentStock: 32,
    minStock: 10,
    reservedStock: 0,
    location: 'Gaveta Balcão 1',
    status: 'active',
    createdAt: '2026-01-22',
  },
  {
    id: 'prod-3',
    name: 'Fonte Carregador USB-C 20W Homologado Anatel',
    sku: 'FNT-20W-ANATEL',
    barcode: '789123456003',
    brand: 'Foxconn / Anatel',
    category: 'Carregador',
    description: 'Carregamento turbo Power Delivery para iPhone 11 ao 15 com selo Anatel.',
    unit: 'un',
    costPrice: 35.00,
    sellPrice: 99.90,
    currentStock: 18,
    minStock: 5,
    reservedStock: 0,
    location: 'Vitrine Central',
    status: 'active',
    createdAt: '2026-02-05',
  },
  {
    id: 'prod-4',
    name: 'Cabo Lightning para Tipo-C 1m Reforçado',
    sku: 'CAB-USBC-LIGHT',
    barcode: '789123456004',
    brand: 'Hiago Tech',
    category: 'Carregador',
    description: 'Cabo trançado de nylon com conectores de alumínio reforçado.',
    unit: 'un',
    costPrice: 18.00,
    sellPrice: 59.90,
    currentStock: 25,
    minStock: 8,
    reservedStock: 0,
    location: 'Gaveta Balcão 1',
    status: 'active',
    createdAt: '2026-02-12',
  },
  {
    id: 'prod-5',
    name: 'Fone de Ouvido Sem Fio Earbuds Pro Wireless',
    sku: 'FON-EAR-PRO',
    barcode: '789123456005',
    brand: 'H Prime',
    category: 'Fone',
    description: 'Cancelamento passivo de ruído com estojo de carregamento sem fio.',
    unit: 'un',
    costPrice: 65.00,
    sellPrice: 169.90,
    currentStock: 7,
    minStock: 3,
    reservedStock: 0,
    location: 'Vitrine Superior',
    status: 'active',
    createdAt: '2026-03-01',
  },
];

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
