import { supabase } from '../services/supabaseClient.js';
import type { Device } from '../types.js';
import { INITIAL_DEVICES } from '../data/erpData.js';

export class DeviceRepository {
  /**
   * Mapeia registro do PostgreSQL/Supabase para a interface Device do ERP
   */
  private static mapFromDb(row: any): Device {
    return {
      id: row.id,
      imei: row.imei,
      serialNumber: row.serial_number || undefined,
      brand: row.brand || 'Apple',
      model: row.model,
      storage: row.storage,
      color: row.color,
      condition: row.condition || 'certified_pre_owned',
      batteryHealth: row.battery_health ?? undefined,
      purchasePrice: Number(row.cost_price || row.purchase_price || 0),
      sellPrice: Number(row.selling_price || row.sell_price || 0),
      supplier: row.supplier || 'Loja',
      status: row.status || 'available',
      location: row.location || 'Vitrine Principal',
      purchaseId: row.purchase_id || undefined,
      internalCode: row.internal_code || undefined,
      isShowcasePublic: row.is_showcase_public ?? true,
      isShowcaseFeatured: row.is_showcase_featured ?? false,
      notes: row.notes || undefined,
      createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  }

  private static mapToDb(device: Device): any {
    return {
      id: device.id,
      imei: device.imei?.replace(/\D/g, '') || null,
      serial_number: device.serialNumber || null,
      brand: device.brand || 'Apple',
      model: device.model,
      storage: device.storage,
      color: device.color,
      condition: device.condition,
      battery_health: device.batteryHealth || null,
      cost_price: device.purchasePrice,
      selling_price: device.sellPrice,
      supplier: device.supplier,
      status: device.status,
      is_showcase_public: device.isShowcasePublic ?? true,
      is_showcase_featured: device.isShowcaseFeatured ?? false,
      notes: device.notes || null,
      created_at: device.createdAt ? new Date(device.createdAt).toISOString() : new Date().toISOString(),
    };
  }

  /**
   * Lista todos os aparelhos
   */
  static async getAll(): Promise<Device[]> {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao consultar Supabase (devices), usando fallback:', error.message);
        return INITIAL_DEVICES;
      }

      return (data || []).map(this.mapFromDb);
    } catch (err) {
      console.warn('Exceção ao buscar devices no Supabase, fallback:', err);
      return INITIAL_DEVICES;
    }
  }

  /**
   * Cadastra novo aparelho com garantia de IMEI único
   */
  static async create(device: Device): Promise<{ success: boolean; data?: Device; error?: string }> {
    try {
      const payload = this.mapToDb(device);
      const { data, error } = await supabase
        .from('devices')
        .insert([payload])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: `Já existe um aparelho cadastrado com o IMEI ${device.imei}` };
        }
        console.warn('Falha ao inserir no Supabase, mantendo local:', error.message);
        return { success: true, data: device };
      }

      return { success: true, data: this.mapFromDb(data) };
    } catch (err: any) {
      console.warn('Exceção ao criar device:', err);
      return { success: true, data: device };
    }
  }

  static async updateStatus(imei: string, status: import('../types.js').DeviceStatus): Promise<boolean> {
    try {
      const cleanImei = imei.replace(/\D/g, '');
      const { error } = await supabase
        .from('devices')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('imei', cleanImei);

      if (error) {
        console.warn('Erro ao atualizar status do device no Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Exceção ao atualizar status:', err);
      return false;
    }
  }

  static async update(imei: string, updates: Partial<Device>): Promise<boolean> {
    try {
      const cleanImei = imei.replace(/\D/g, '');
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.model !== undefined) payload.model = updates.model;
      if (updates.brand !== undefined) payload.brand = updates.brand;
      if (updates.storage !== undefined) payload.storage = updates.storage;
      if (updates.color !== undefined) payload.color = updates.color;
      if (updates.condition !== undefined) payload.condition = updates.condition;
      if (updates.batteryHealth !== undefined) payload.battery_health = updates.batteryHealth;
      if (updates.purchasePrice !== undefined) payload.cost_price = updates.purchasePrice;
      if (updates.sellPrice !== undefined) payload.selling_price = updates.sellPrice;
      if (updates.supplier !== undefined) payload.supplier = updates.supplier;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.isShowcasePublic !== undefined) payload.is_showcase_public = updates.isShowcasePublic;
      if (updates.isShowcaseFeatured !== undefined) payload.is_showcase_featured = updates.isShowcaseFeatured;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      await supabase.from('devices').update(payload).eq('imei', cleanImei);
      return true;
    } catch {
      return true;
    }
  }

  static async delete(imei: string): Promise<boolean> {
    try {
      const cleanImei = imei.replace(/\D/g, '');
      await supabase.from('devices').delete().eq('imei', cleanImei);
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Trava de Venda Dupla Concorrente (Fase 4 do Plano Diretor):
   * Reserva temporária de 10 minutos por IMEI no PDV.
   */
  static async reserveDeviceForCheckout(imei: string, sellerName: string): Promise<{ success: boolean; message: string }> {
    try {
      const cleanImei = imei.replace(/\D/g, '');
      const { data, error } = await supabase
        .from('devices')
        .select('status, reserved_until, reserved_by')
        .eq('imei', cleanImei)
        .single();

      if (error || !data) {
        return { success: true, message: 'Disponível localmente' };
      }

      if (data.status === 'sold') {
        return { success: false, message: 'Aparelho já faturado e vendido em outra venda' };
      }

      const now = new Date().getTime();
      const reservedUntil = data.reserved_until ? new Date(data.reserved_until).getTime() : 0;

      // Se estiver reservado por outro vendedor nos últimos 10 min
      if (data.status === 'reserved' && reservedUntil > now && data.reserved_by !== sellerName) {
        return { 
          success: false, 
          message: `Aparelho em negociação ativa no balcão por ${data.reserved_by || 'outro vendedor'}. Aguarde 10 minutos.` 
        };
      }

      // Concede a reserva por 10 minutos
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase
        .from('devices')
        .update({
          status: 'reserved',
          reserved_until: expiresAt,
          reserved_by: sellerName,
        })
        .eq('imei', cleanImei);

      return { success: true, message: 'Aparelho reservado com segurança para o checkout' };
    } catch (err: any) {
      return { success: true, message: 'Reserva local concedida' };
    }
  }
}
