import { supabase } from '../services/supabaseClient.js';
import type { 
  ServiceOrder, 
  OSStatus, 
  OSQuoteServiceItem, 
  OSQuotePartItem, 
  OSClientApproval,
  OSStatusHistoryEntry 
} from '../types.js';
import { PartRepository } from './partRepository.js';
import { WarrantyRepository } from './warrantyRepository.js';

export const INITIAL_SERVICE_ORDERS_RICH: ServiceOrder[] = [];

export class ServiceOrderRepository {
  private static localOrders: ServiceOrder[] = [...INITIAL_SERVICE_ORDERS_RICH];

  private static mapFromDb(row: any): ServiceOrder {
    return {
      id: row.id,
      osNumber: row.os_number,
      customerId: row.customer_id || undefined,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerCpf: row.customer_cpf || undefined,
      deviceType: row.device_type || 'Smartphone',
      brand: row.brand || 'Apple',
      deviceModel: row.device_model,
      imei: row.imei || undefined,
      imei2: row.imei2 || undefined,
      serialNumber: row.serial_number || undefined,
      color: row.color || undefined,
      deviceOwnerType: row.device_owner_type || 'customer',
      stockDeviceId: row.stock_device_id || undefined,
      physicalCondition: row.physical_condition || undefined,
      reportedIssue: row.reported_issue || row.defect_reported || '',
      accessoriesReceived: row.accessories_received || undefined,
      checklistCount: row.checklist_count || 13,
      checklistItems: Array.isArray(row.checklist_items) ? row.checklist_items : undefined,
      technician: row.technician_name || 'Técnico Responsável',
      status: row.status || 'aberta',
      statusHistory: Array.isArray(row.status_history) ? row.status_history : undefined,
      technicalDiagnosis: row.technical_diagnosis || undefined,
      serviceExecuted: row.service_executed || undefined,
      quoteServices: Array.isArray(row.quote_services) ? row.quote_services : undefined,
      quoteParts: Array.isArray(row.quote_parts) ? row.quote_parts : undefined,
      subtotalServices: Number(row.subtotal_services || 0),
      subtotalParts: Number(row.subtotal_parts || 0),
      discount: Number(row.discount || 0),
      estimatedValue: Number(row.estimated_value || row.total_price || 0),
      finalValue: row.final_value ? Number(row.final_value) : undefined,
      clientApproval: row.client_approval || undefined,
      partsConsumed: Boolean(row.parts_consumed),
      finalTestsSummary: row.final_tests_summary || undefined,
      deliveryNotes: row.delivery_notes || undefined,
      deliveredTo: row.delivered_to || undefined,
      deliveredBy: row.delivered_by || undefined,
      paymentMethod: row.payment_method || undefined,
      paymentStatus: row.payment_status || 'pending',
      entryDate: row.entry_date || (row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : ''),
      estimatedDeliveryDate: row.estimated_delivery_date || undefined,
      readyDate: row.ready_date || undefined,
      deliveredDate: row.delivered_date || undefined,
      warrantyDays: Number(row.warranty_days || 90),
      warrantyId: row.warranty_id || undefined,
      internalNotes: row.internal_notes || undefined,
      createdAt: row.created_at,
    };
  }

  static async getAll(): Promise<ServiceOrder[]> {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return this.localOrders;
      }

      const mapped = data.map(this.mapFromDb);
      this.localOrders = mapped;
      return mapped;
    } catch {
      return this.localOrders;
    }
  }

  static async getById(id: string): Promise<ServiceOrder | undefined> {
    const all = await this.getAll();
    return all.find(os => os.id === id);
  }

  static async create(os: ServiceOrder): Promise<{ success: boolean; data?: ServiceOrder }> {
    const newOS: ServiceOrder = {
      ...os,
      id: os.id || `os-${Date.now()}`,
      status: os.status || 'aberta',
      checklistCount: os.checklistCount || 13,
      entryDate: os.entryDate || new Date().toLocaleDateString('pt-BR'),
      createdAt: os.createdAt || new Date().toISOString(),
      statusHistory: os.statusHistory || [
        {
          id: `h-${Date.now()}`,
          toStatus: os.status || 'aberta',
          changedAt: new Date().toLocaleString('pt-BR'),
          changedBy: os.technician || 'Hiago',
          notes: 'Abertura da Ordem de Serviço',
        }
      ],
    };

    try {
      const { error } = await supabase
        .from('service_orders')
        .insert([{
          id: newOS.id,
          os_number: newOS.osNumber,
          customer_id: newOS.customerId || null,
          customer_name: newOS.customerName,
          customer_phone: newOS.customerPhone,
          customer_cpf: newOS.customerCpf || null,
          device_type: newOS.deviceType || 'Smartphone',
          brand: newOS.brand || 'Apple',
          device_model: newOS.deviceModel,
          imei: newOS.imei?.replace(/\D/g, '') || null,
          imei2: newOS.imei2?.replace(/\D/g, '') || null,
          serial_number: newOS.serialNumber || null,
          color: newOS.color || null,
          device_owner_type: newOS.deviceOwnerType || 'customer',
          stock_device_id: newOS.stockDeviceId || null,
          physical_condition: newOS.physicalCondition || null,
          reported_issue: newOS.reportedIssue,
          accessories_received: newOS.accessoriesReceived || null,
          checklist_count: newOS.checklistCount,
          checklist_items: newOS.checklistItems || [],
          technician_name: newOS.technician,
          status: newOS.status,
          status_history: newOS.statusHistory,
          technical_diagnosis: newOS.technicalDiagnosis || null,
          service_executed: newOS.serviceExecuted || null,
          quote_services: newOS.quoteServices || [],
          quote_parts: newOS.quoteParts || [],
          subtotal_services: newOS.subtotalServices || 0,
          subtotal_parts: newOS.subtotalParts || 0,
          discount: newOS.discount || 0,
          estimated_value: newOS.estimatedValue,
          final_value: newOS.finalValue || null,
          client_approval: newOS.clientApproval || { status: 'pending' },
          parts_consumed: Boolean(newOS.partsConsumed),
          entry_date: newOS.entryDate,
          estimated_delivery_date: newOS.estimatedDeliveryDate || null,
          warranty_days: newOS.warrantyDays || 90,
          internal_notes: newOS.internalNotes || null,
        }]);

      if (error) {
        console.warn('Falha ao salvar OS no Supabase:', error.message);
      }

      this.localOrders.unshift(newOS);
      return { success: true, data: newOS };
    } catch {
      this.localOrders.unshift(newOS);
      return { success: true, data: newOS };
    }
  }

  // ----------------------------------------------------
  // MÁQUINA DE ESTADOS & REGRAS DE TRANSIÇÃO
  // ----------------------------------------------------
  static async updateStatus(
    id: string, 
    newStatus: OSStatus, 
    notes?: string, 
    operatorName: string = 'André Técnico',
    extraData?: Partial<ServiceOrder>
  ): Promise<{ success: boolean; error?: string }> {
    const os = this.localOrders.find(o => o.id === id);
    if (!os) return { success: false, error: 'Ordem de Serviço não encontrada' };

    // REGRA DE TRANSIÇÃO 1: Não permitir início de reparo se orçamento não aprovado
    if (newStatus === 'em_reparo') {
      const isApproved = os.clientApproval?.status === 'approved' || os.status === 'aprovada';
      if (!isApproved && !extraData?.clientApproval) {
        return { 
          success: false, 
          error: 'Operação bloqueada: O orçamento ainda não foi aprovado pelo cliente. Registre a aprovação formal antes de iniciar o reparo.' 
        };
      }
    }

    // REGRA DE TRANSIÇÃO 2: Ao entrar em reparo, consumir peças do estoque real
    if (newStatus === 'em_reparo' && !os.partsConsumed && os.quoteParts && os.quoteParts.length > 0) {
      for (const partItem of os.quoteParts) {
        if (partItem.partId) {
          try {
            await PartRepository.adjustStock(
              partItem.partId, 
              -partItem.quantity, 
              `Consumo bancada na ${os.osNumber}`, 
              operatorName
            );
            partItem.consumed = true;
          } catch (e) {
            console.warn(`Erro ao baixar peça ${partItem.name}:`, e);
          }
        }
      }
      os.partsConsumed = true;
    }

    // REGRA DE TRANSIÇÃO 3: Se cancelada após consumo de peças, oferecer estorno
    if (newStatus === 'cancelada' && os.partsConsumed && os.quoteParts) {
      for (const partItem of os.quoteParts) {
        if (partItem.partId && partItem.consumed) {
          try {
            await PartRepository.adjustStock(
              partItem.partId, 
              partItem.quantity, 
              `Estorno por cancelamento da ${os.osNumber}`, 
              operatorName
            );
            partItem.consumed = false;
          } catch (e) {
            console.warn(`Erro ao estornar peça ${partItem.name}:`, e);
          }
        }
      }
      os.partsConsumed = false;
    }

    // REGRA DE TRANSIÇÃO 4: Ao entregar equipamento, gerar garantia automaticamente
    if (newStatus === 'entregue' || newStatus === 'delivered') {
      if (!os.deliveredDate) {
        os.deliveredDate = new Date().toLocaleDateString('pt-BR');
      }
      if (!os.warrantyId) {
        try {
          const createdWarranty = await WarrantyRepository.createFromOS(os, 'service', os.warrantyDays || 90);
          os.warrantyId = createdWarranty.id;
        } catch (e) {
          console.warn('Erro ao emitir garantia automática:', e);
        }
      }
    }

    const historyEntry: OSStatusHistoryEntry = {
      id: `h-${Date.now()}`,
      fromStatus: os.status,
      toStatus: newStatus,
      changedAt: new Date().toLocaleString('pt-BR'),
      changedBy: operatorName,
      notes: notes || `Mudança de status para ${newStatus}`,
    };

    const currentHistory = os.statusHistory || [];
    const updatedHistory = [...currentHistory, historyEntry];

    os.status = newStatus;
    os.statusHistory = updatedHistory;

    if (extraData) {
      Object.assign(os, extraData);
    }

    // Persistência no Supabase
    try {
      const updates: any = {
        status: newStatus,
        status_history: updatedHistory,
        parts_consumed: os.partsConsumed,
        updated_at: new Date().toISOString(),
      };
      if (os.technicalDiagnosis) updates.technical_diagnosis = os.technicalDiagnosis;
      if (os.serviceExecuted) updates.service_executed = os.serviceExecuted;
      if (os.deliveredDate) updates.delivered_date = os.deliveredDate;
      if (os.warrantyId) updates.warranty_id = os.warrantyId;
      if (extraData?.finalValue !== undefined) updates.final_value = extraData.finalValue;
      if (extraData?.deliveredTo !== undefined) updates.delivered_to = extraData.deliveredTo;
      if (extraData?.deliveredBy !== undefined) updates.delivered_by = extraData.deliveredBy;
      if (extraData?.paymentMethod !== undefined) updates.payment_method = extraData.paymentMethod;
      if (extraData?.paymentStatus !== undefined) updates.payment_status = extraData.paymentStatus;
      if (extraData?.clientApproval !== undefined) updates.client_approval = extraData.clientApproval;

      await supabase.from('service_orders').update(updates).eq('id', id);
    } catch {
      // Local fallback já atualizado
    }

    return { success: true };
  }

  // ----------------------------------------------------
  // GESTÃO DE ORÇAMENTO COM REVISÕES
  // ----------------------------------------------------
  static async updateQuote(
    id: string,
    services: OSQuoteServiceItem[],
    parts: OSQuotePartItem[],
    discount: number = 0,
    operatorName: string = 'André Técnico'
  ): Promise<boolean> {
    const os = this.localOrders.find(o => o.id === id);
    if (!os) return false;

    const subtotalServices = services.reduce((acc, s) => acc + (s.subtotal || s.unitPrice * s.quantity), 0);
    const subtotalParts = parts.reduce((acc, p) => acc + (p.subtotal || p.unitPrice * p.quantity), 0);
    const totalAmount = Math.max(0, subtotalServices + subtotalParts - discount);

    os.quoteServices = services;
    os.quoteParts = parts;
    os.subtotalServices = subtotalServices;
    os.subtotalParts = subtotalParts;
    os.discount = discount;
    os.estimatedValue = totalAmount;
    os.finalValue = totalAmount;

    // Se o orçamento foi alterado após aprovação, resetar aprovação para nova validação
    if (os.clientApproval?.status === 'approved') {
      os.clientApproval = {
        status: 'pending',
        notes: `Orçamento revisado em ${new Date().toLocaleString('pt-BR')} por ${operatorName}. Requer nova autorização do cliente.`,
      };
      os.status = 'aguardando_aprovacao';
    }

    try {
      await supabase.from('service_orders').update({
        quote_services: services,
        quote_parts: parts,
        subtotal_services: subtotalServices,
        subtotal_parts: subtotalParts,
        discount,
        estimated_value: totalAmount,
        final_value: totalAmount,
        client_approval: os.clientApproval,
        status: os.status,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
    } catch {
      // Local já atualizado
    }

    return true;
  }

  // ----------------------------------------------------
  // REGISTRO FORMAL DE APROVAÇÃO / RECUSA DO CLIENTE
  // ----------------------------------------------------
  static async recordApproval(
    id: string,
    approval: OSClientApproval,
    operatorName: string = 'Hiago'
  ): Promise<boolean> {
    const os = this.localOrders.find(o => o.id === id);
    if (!os) return false;

    os.clientApproval = {
      ...approval,
      registeredBy: operatorName,
      approvedAt: approval.approvedAt || new Date().toLocaleString('pt-BR'),
    };

    const targetStatus: OSStatus = approval.status === 'approved' ? 'aprovada' : 'reprovada';
    return (await this.updateStatus(id, targetStatus, approval.notes, operatorName, { clientApproval: os.clientApproval })).success;
  }
}
