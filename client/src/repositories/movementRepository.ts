import { supabase } from '../services/supabaseClient.js';
import type { InventoryMovement } from '../types.js';

const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-1',
    itemType: 'device',
    itemId: '356984112094832',
    itemName: 'iPhone 13 128GB Meia-noite',
    movementType: 'inflow_purchase',
    quantity: 1,
    previousStock: 0,
    newStock: 1,
    unitCost: 2150.00,
    reason: 'Entrada via compra de lote Alpha SP',
    referenceId: 'CP-1082',
    operatorName: 'Hiago',
    createdAt: '2026-03-10 10:15',
  },
  {
    id: 'mov-2',
    itemType: 'product',
    itemId: 'CAP-MAG-1314',
    itemName: 'Capa Magnética MagSafe Silicone iPhone 13/14',
    movementType: 'inflow_purchase',
    quantity: 30,
    previousStock: 4,
    newStock: 34,
    unitCost: 22.00,
    reason: 'Reposição de estoque semanal',
    referenceId: 'NF-49102',
    operatorName: 'Hiago',
    createdAt: '2026-03-11 14:30',
  },
  {
    id: 'mov-3',
    itemType: 'part',
    itemId: 'PEC-DISP-13',
    itemName: 'Tela Frontal OLED iPhone 13 (True Tone Ativo)',
    movementType: 'inflow_purchase',
    quantity: 5,
    previousStock: 1,
    newStock: 6,
    unitCost: 240.00,
    reason: 'Entrada de peças Fox Parts',
    referenceId: 'PED-8912',
    operatorName: 'Hiago',
    createdAt: '2026-03-12 09:45',
  },
  {
    id: 'mov-4',
    itemType: 'device',
    itemId: '352918273645019',
    itemName: 'iPhone 12 64GB Azul',
    movementType: 'outflow_sale',
    quantity: 1,
    previousStock: 1,
    newStock: 0,
    unitCost: 1550.00,
    reason: 'Venda de balcão VD-2089',
    referenceId: 'VD-2089',
    operatorName: 'Operador Balcão',
    createdAt: '2026-03-13 16:20',
  },
];

export class MovementRepository {
  private static localMovements: InventoryMovement[] = [...INITIAL_MOVEMENTS];

  private static mapFromDb(row: any): InventoryMovement {
    return {
      id: row.id,
      itemType: row.item_type || 'device',
      itemId: row.item_id,
      itemName: row.item_name,
      movementType: row.movement_type || 'adjustment',
      quantity: Number(row.quantity || 1),
      previousStock: row.previous_stock !== null ? Number(row.previous_stock) : undefined,
      newStock: row.new_stock !== null ? Number(row.new_stock) : undefined,
      unitCost: row.unit_cost !== null ? Number(row.unit_cost) : undefined,
      reason: row.reason || '',
      referenceId: row.reference_id || undefined,
      operatorName: row.operator_name || 'Hiago',
      createdAt: row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR'),
    };
  }

  static async getAll(): Promise<InventoryMovement[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !data || data.length === 0) {
        return this.localMovements;
      }

      this.localMovements = data.map(this.mapFromDb);
      return this.localMovements;
    } catch {
      return this.localMovements;
    }
  }

  static async record(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const isUUID = (str?: string) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
      const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mov-${Date.now()}`;

      const payload: any = {
        item_type: movement.itemType,
        item_id: movement.itemId,
        item_name: movement.itemName,
        movement_type: movement.movementType,
        quantity: movement.quantity,
        previous_stock: movement.previousStock ?? null,
        new_stock: movement.newStock ?? null,
        unit_cost: movement.unitCost ?? null,
        reason: movement.reason,
        reference_id: movement.referenceId || null,
        operator_name: movement.operatorName || 'Hiago',
      };
      if (isUUID(generatedId)) {
        payload.id = generatedId;
      }

      await supabase.from('inventory_movements').insert([payload]);

      this.localMovements.unshift({
        ...movement,
        id: generatedId,
        createdAt: new Date().toLocaleString('pt-BR'),
      });

      return true;
    } catch {
      this.localMovements.unshift({
        ...movement,
        id: `mov-${Date.now()}`,
        createdAt: new Date().toLocaleString('pt-BR'),
      });
      return true;
    }
  }
}
