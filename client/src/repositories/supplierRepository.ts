import { supabase } from '../services/supabaseClient.js';
import type { Supplier } from '../types.js';

const INITIAL_SUPPLIERS: Supplier[] = [];

export class SupplierRepository {
  private static localSuppliers: Supplier[] = [...INITIAL_SUPPLIERS];

  private static mapFromDb(row: any): Supplier {
    return {
      id: row.id,
      type: row.type || 'pj',
      name: row.name,
      tradeName: row.trade_name || undefined,
      document: row.document || '',
      phone: row.phone || '',
      email: row.email || undefined,
      city: row.city || undefined,
      contactPerson: row.contact_person || undefined,
      categories: Array.isArray(row.categories) ? row.categories : [],
      paymentTerms: row.payment_terms || undefined,
      notes: row.notes || undefined,
      status: row.status || 'active',
      createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  }

  static async getAll(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data) {
        return this.localSuppliers;
      }

      const mapped = data.map(this.mapFromDb);
      if (mapped.length > 0) {
        this.localSuppliers = mapped;
      }
      return this.localSuppliers;
    } catch {
      return this.localSuppliers;
    }
  }

  static async create(supplier: Omit<Supplier, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: Supplier; error?: string }> {
    try {
      const isUUID = (str?: string) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
      const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `forn-${Date.now()}`;

      const payload: any = {
        name: supplier.name,
        trade_name: supplier.tradeName || null,
        type: supplier.type,
        document: supplier.document,
        phone: supplier.phone,
        email: supplier.email || null,
        city: supplier.city || null,
        contact_person: supplier.contactPerson || null,
        categories: supplier.categories,
        payment_terms: supplier.paymentTerms || null,
        notes: supplier.notes || null,
        status: supplier.status || 'active',
      };
      if (isUUID(generatedId)) {
        payload.id = generatedId;
      }

      const { data, error } = await supabase
        .from('suppliers')
        .insert([payload])
        .select('*')
        .maybeSingle();

      const newSupplier: Supplier = data ? this.mapFromDb(data) : {
        ...supplier,
        id: generatedId,
        createdAt: new Date().toISOString().split('T')[0],
      };

      this.localSuppliers.unshift(newSupplier);
      return { success: !error, data: newSupplier };
    } catch {
      const fallbackSupplier: Supplier = {
        ...supplier,
        id: `forn-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      this.localSuppliers.unshift(fallbackSupplier);
      return { success: true, data: fallbackSupplier };
    }
  }

  static async update(id: string, updates: Partial<Supplier>): Promise<boolean> {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.tradeName !== undefined) payload.trade_name = updates.tradeName;
      if (updates.document !== undefined) payload.document = updates.document;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.city !== undefined) payload.city = updates.city;
      if (updates.contactPerson !== undefined) payload.contact_person = updates.contactPerson;
      if (updates.categories !== undefined) payload.categories = updates.categories;
      if (updates.paymentTerms !== undefined) payload.payment_terms = updates.paymentTerms;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.status !== undefined) payload.status = updates.status;

      await supabase.from('suppliers').update(payload).eq('id', id);

      const idx = this.localSuppliers.findIndex(s => s.id === id);
      if (idx !== -1) {
        this.localSuppliers[idx] = { ...this.localSuppliers[idx], ...updates };
      }
      return true;
    } catch {
      const idx = this.localSuppliers.findIndex(s => s.id === id);
      if (idx !== -1) {
        this.localSuppliers[idx] = { ...this.localSuppliers[idx], ...updates };
      }
      return true;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await supabase.from('suppliers').delete().eq('id', id);
      this.localSuppliers = this.localSuppliers.filter(s => s.id !== id);
      return true;
    } catch {
      this.localSuppliers = this.localSuppliers.filter(s => s.id !== id);
      return true;
    }
  }
}
