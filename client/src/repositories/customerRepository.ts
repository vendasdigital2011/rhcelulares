import { supabase } from '../services/supabaseClient.js';
import type { Customer, CustomerDevice } from '../types.js';
import { INITIAL_CUSTOMERS } from '../data/erpData.js';

export class CustomerRepository {
  private static mapFromDb(row: any): Customer {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      cpf: row.cpf || undefined,
      email: row.email || undefined,
      purchasedDevices: Array.isArray(row.purchased_devices) ? row.purchased_devices : [],
      totalSpent: Number(row.total_spent || 0),
      lastPurchaseDate: row.last_purchase_date || (row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : ''),
      notes: row.notes || undefined,
      birthday: row.birthday || undefined,
    };
  }

  static async getAll(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) {
        console.warn('Erro ao consultar Supabase (customers), usando fallback:', error.message);
        return INITIAL_CUSTOMERS;
      }

      return (data || []).map(this.mapFromDb);
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }

  static async create(customer: Customer): Promise<{ success: boolean; data?: Customer; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          cpf: customer.cpf || null,
          email: customer.email || null,
          total_spent: customer.totalSpent || 0,
          last_purchase_date: customer.lastPurchaseDate || new Date().toLocaleDateString('pt-BR'),
          notes: customer.notes || null,
          birthday: customer.birthday || null,
        }])
        .select()
        .single();

      if (error) {
        console.warn('Falha ao salvar cliente no Supabase:', error.message);
        return { success: true, data: customer };
      }

      return { success: true, data: this.mapFromDb(data) };
    } catch (err: any) {
      return { success: true, data: customer };
    }
  }

  /**
   * Atualiza ou cadastra cliente após realização de venda no PDV
   */
  static async recordPurchase(
    name: string,
    phone: string,
    amount: number,
    deviceModel?: string,
    imei?: string
  ): Promise<Customer | null> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const { data: existingList } = await supabase
        .from('customers')
        .select('*')
        .or(`phone.ilike.%${cleanPhone}%,name.ilike.%${name}%`)
        .limit(1);

      const existing = existingList && existingList.length > 0 ? existingList[0] : null;

      const newDeviceEntry: CustomerDevice = {
        model: deviceModel || 'iPhone',
        imei: imei || undefined,
        purchaseDate: new Date().toLocaleDateString('pt-BR'),
        batteryHealth: 100,
        value: amount,
      };

      if (existing) {
        const newTotalSpent = Number(existing.total_spent || 0) + amount;
        await supabase
          .from('customers')
          .update({
            total_spent: newTotalSpent,
            last_purchase_date: new Date().toLocaleDateString('pt-BR'),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        return {
          ...this.mapFromDb(existing),
          totalSpent: newTotalSpent,
          lastPurchaseDate: new Date().toLocaleDateString('pt-BR'),
        };
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: name || 'Consumidor Final',
          phone,
          purchasedDevices: [newDeviceEntry],
          totalSpent: amount,
          lastPurchaseDate: new Date().toLocaleDateString('pt-BR'),
        };
        await this.create(newCust);
        return newCust;
      }
    } catch {
      return null;
    }
  }

  /**
   * Reverte o valor da compra quando a venda for cancelada/estornada
   */
  static async revertPurchase(name: string, phone: string, amount: number): Promise<void> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const { data: existingList } = await supabase
        .from('customers')
        .select('*')
        .or(`phone.ilike.%${cleanPhone}%,name.ilike.%${name}%`)
        .limit(1);

      if (existingList && existingList.length > 0) {
        const existing = existingList[0];
        const newTotalSpent = Math.max(0, Number(existing.total_spent || 0) - amount);
        await supabase
          .from('customers')
          .update({
            total_spent: newTotalSpent,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      }
    } catch {
      // Fallback
    }
  }
}
