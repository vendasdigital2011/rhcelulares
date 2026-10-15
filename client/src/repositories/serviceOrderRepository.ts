import { supabase } from '../services/supabaseClient.js';
import type { ServiceOrder } from '../types.js';
import { INITIAL_SERVICE_ORDERS } from '../data/erpData.js';

export class ServiceOrderRepository {
  private static mapFromDb(row: any): ServiceOrder {
    return {
      id: row.id,
      osNumber: row.os_number,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      deviceModel: row.device_model,
      imei: row.imei || undefined,
      color: row.color || undefined,
      technician: row.technician_name || 'Técnico Responsável',
      status: row.status || 'received',
      checklistCount: row.checklist_count || 13,
      reportedIssue: row.reported_issue || row.defect_reported || '',
      technicalDiagnosis: row.technical_diagnosis || undefined,
      serviceExecuted: row.service_executed || undefined,
      estimatedValue: Number(row.estimated_value || row.total_price || 0),
      finalValue: row.final_value ? Number(row.final_value) : undefined,
      entryDate: row.entry_date || (row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : ''),
      deliveredDate: row.delivered_date || undefined,
    };
  }

  static async getAll(): Promise<ServiceOrder[]> {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao consultar Supabase (service_orders), usando fallback:', error.message);
        return INITIAL_SERVICE_ORDERS;
      }

      return (data || []).map(this.mapFromDb);
    } catch {
      return INITIAL_SERVICE_ORDERS;
    }
  }

  static async create(os: ServiceOrder): Promise<{ success: boolean; data?: ServiceOrder }> {
    try {
      const { error } = await supabase
        .from('service_orders')
        .insert([{
          id: os.id,
          os_number: os.osNumber,
          customer_name: os.customerName,
          customer_phone: os.customerPhone,
          device_model: os.deviceModel,
          imei: os.imei?.replace(/\D/g, '') || null,
          color: os.color || null,
          technician_name: os.technician,
          status: os.status,
          checklist_count: os.checklistCount,
          reported_issue: os.reportedIssue,
          technical_diagnosis: os.technicalDiagnosis || null,
          service_executed: os.serviceExecuted || null,
          estimated_value: os.estimatedValue,
          final_value: os.finalValue || null,
          entry_date: os.entryDate,
        }]);

      if (error) {
        console.warn('Falha ao salvar OS no Supabase:', error.message);
      }
      return { success: true, data: os };
    } catch {
      return { success: true, data: os };
    }
  }

  static async updateStatus(id: string, status: ServiceOrder['status'], diagnosis?: string): Promise<boolean> {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (diagnosis) updates.technical_diagnosis = diagnosis;
      if (status === 'delivered') updates.delivered_date = new Date().toLocaleDateString('pt-BR');

      const { error } = await supabase
        .from('service_orders')
        .update(updates)
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  }
}
