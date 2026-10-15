import { supabase } from '../services/supabaseClient.js';
import type { Part } from '../types.js';

const INITIAL_PARTS: Part[] = [
  {
    id: 'part-1',
    name: 'Tela Frontal OLED iPhone 13 (True Tone Ativo)',
    code: 'PEC-DISP-13',
    sku: 'PEC-DISP-13',
    category: 'Display',
    manufacturer: 'Foxconn OEM',
    compatibleModels: ['iPhone 13'],
    currentStock: 6,
    minStock: 2,
    reservedStock: 0,
    costPrice: 240.00,
    sellPrice: 650.00,
    location: 'Bancada Gaveta 1',
    status: 'active',
    createdAt: '2026-01-10',
  },
  {
    id: 'part-2',
    name: 'Tela Frontal Incell iPhone 11',
    code: 'PEC-DISP-11',
    sku: 'PEC-DISP-11',
    category: 'Display',
    manufacturer: 'JK Incell',
    compatibleModels: ['iPhone 11'],
    currentStock: 8,
    minStock: 3,
    reservedStock: 0,
    costPrice: 95.00,
    sellPrice: 320.00,
    location: 'Bancada Gaveta 1',
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 'part-3',
    name: 'Bateria Foxconn c/ Flex Original iPhone 12 (100% Saúde)',
    code: 'PEC-BAT-12',
    sku: 'PEC-BAT-12',
    category: 'Bateria',
    manufacturer: 'Foxconn',
    compatibleModels: ['iPhone 12', 'iPhone 12 Pro'],
    currentStock: 12,
    minStock: 4,
    reservedStock: 0,
    costPrice: 65.00,
    sellPrice: 280.00,
    location: 'Bancada Gaveta 2',
    status: 'active',
    createdAt: '2026-02-01',
  },
  {
    id: 'part-4',
    name: 'Bateria Foxconn c/ Flex Original iPhone 13',
    code: 'PEC-BAT-13',
    sku: 'PEC-BAT-13',
    category: 'Bateria',
    manufacturer: 'Foxconn',
    compatibleModels: ['iPhone 13'],
    currentStock: 5,
    minStock: 3,
    reservedStock: 0,
    costPrice: 85.00,
    sellPrice: 320.00,
    location: 'Bancada Gaveta 2',
    status: 'active',
    createdAt: '2026-02-10',
  },
  {
    id: 'part-5',
    name: 'Conector de Carga Lightning iPhone 13 Pro',
    code: 'PEC-CON-13P',
    sku: 'PEC-CON-13P',
    category: 'Conector',
    manufacturer: 'OEM Original',
    compatibleModels: ['iPhone 13 Pro'],
    currentStock: 4,
    minStock: 2,
    reservedStock: 0,
    costPrice: 45.00,
    sellPrice: 250.00,
    location: 'Bancada Gaveta 3',
    status: 'active',
    createdAt: '2026-02-20',
  },
  {
    id: 'part-6',
    name: 'Módulo Câmera Traseira Dupla iPhone 14',
    code: 'PEC-CAM-14',
    sku: 'PEC-CAM-14',
    category: 'Câmera',
    manufacturer: 'Apple Retirada',
    compatibleModels: ['iPhone 14'],
    currentStock: 2,
    minStock: 2,
    reservedStock: 0,
    costPrice: 280.00,
    sellPrice: 750.00,
    location: 'Bancada Gaveta 4',
    status: 'active',
    createdAt: '2026-03-01',
  },
];

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
