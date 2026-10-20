import { supabase } from '../services/supabaseClient.js';
import type { WarrantyEntry, WarrantyClaim, ServiceOrder, WarrantyType, WarrantyStatus } from '../types.js';

export const INITIAL_WARRANTIES: WarrantyEntry[] = [];

export const INITIAL_WARRANTY_CLAIMS: WarrantyClaim[] = [];

export class WarrantyRepository {
  private static localWarranties: WarrantyEntry[] = [...INITIAL_WARRANTIES];
  private static localClaims: WarrantyClaim[] = [...INITIAL_WARRANTY_CLAIMS];

  private static computeStatus(endDateStr: string, currentStatus: WarrantyStatus): WarrantyStatus {
    if (currentStatus === 'voided' || currentStatus === 'claimed') {
      return currentStatus;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);

      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'expired';
      if (diffDays <= 15) return 'expiring_soon';
      return 'active';
    } catch {
      return currentStatus;
    }
  }

  private static mapFromDb(row: any): WarrantyEntry {
    const rawStatus = (row.status || 'active') as WarrantyStatus;
    const computed = WarrantyRepository.computeStatus(row.end_date, rawStatus);

    return {
      id: row.id,
      warrantyNumber: row.warranty_number,
      osId: row.os_id || undefined,
      osNumber: row.os_number || undefined,
      saleId: row.sale_id || undefined,
      saleNumber: row.sale_number || undefined,
      customerId: row.customer_id || undefined,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      deviceModel: row.device_model,
      imei: row.imei || undefined,
      serialNumber: row.serial_number || undefined,
      warrantyType: row.warranty_type || 'service',
      serviceName: row.service_name || undefined,
      partsCovered: Array.isArray(row.parts_covered) ? row.parts_covered : [],
      startDate: row.start_date,
      endDate: row.end_date,
      warrantyDays: Number(row.warranty_days || 90),
      status: computed,
      terms: row.terms || '',
      notes: row.notes || '',
      registeredBy: row.registered_by || 'Hiago',
      createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-01-01',
    };
  }

  private static mapClaimFromDb(row: any): WarrantyClaim {
    return {
      id: row.id,
      claimNumber: row.claim_number,
      warrantyId: row.warranty_id,
      warrantyNumber: row.warranty_number,
      originalOsNumber: row.original_os_number || undefined,
      newOsNumber: row.new_os_number || undefined,
      customerId: row.customer_id || undefined,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      deviceModel: row.device_model,
      imei: row.imei || undefined,
      reportedDefect: row.reported_defect,
      entryCondition: row.entry_condition || '',
      technicalAssessment: row.technical_assessment || '',
      decision: row.decision || 'analyzing',
      decisionReason: row.decision_reason || '',
      isCovered: Boolean(row.is_covered),
      resolutionDate: row.resolution_date || undefined,
      createdBy: row.created_by || 'Hiago',
      createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-01-01',
    };
  }

  static async getAll(): Promise<WarrantyEntry[]> {
    try {
      const { data, error } = await supabase
        .from('warranties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return this.localWarranties.map(w => ({
          ...w,
          status: this.computeStatus(w.endDate, w.status),
        }));
      }

      const mapped = data.map(this.mapFromDb);
      this.localWarranties = mapped;
      return mapped;
    } catch {
      return this.localWarranties.map(w => ({
        ...w,
        status: this.computeStatus(w.endDate, w.status),
      }));
    }
  }

  static async getById(id: string): Promise<WarrantyEntry | undefined> {
    const all = await this.getAll();
    return all.find(w => w.id === id);
  }

  static async create(warranty: Omit<WarrantyEntry, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: WarrantyEntry }> {
    const newEntry: WarrantyEntry = {
      ...warranty,
      id: `war-${Date.now()}`,
      status: this.computeStatus(warranty.endDate, warranty.status),
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      const { data, error } = await supabase
        .from('warranties')
        .insert([{
          id: newEntry.id,
          warranty_number: newEntry.warrantyNumber,
          os_id: newEntry.osId || null,
          os_number: newEntry.osNumber || null,
          sale_id: newEntry.saleId || null,
          sale_number: newEntry.saleNumber || null,
          customer_id: newEntry.customerId || null,
          customer_name: newEntry.customerName,
          customer_phone: newEntry.customerPhone,
          device_model: newEntry.deviceModel,
          imei: newEntry.imei || null,
          serial_number: newEntry.serialNumber || null,
          warranty_type: newEntry.warrantyType,
          service_name: newEntry.serviceName || null,
          parts_covered: newEntry.partsCovered || [],
          start_date: newEntry.startDate,
          end_date: newEntry.endDate,
          warranty_days: newEntry.warrantyDays,
          status: newEntry.status,
          terms: newEntry.terms || null,
          notes: newEntry.notes || null,
          registered_by: newEntry.registeredBy || 'Hiago',
        }])
        .select()
        .single();

      if (error || !data) {
        this.localWarranties.unshift(newEntry);
        return { success: true, data: newEntry };
      }

      const created = this.mapFromDb(data);
      this.localWarranties.unshift(created);
      return { success: true, data: created };
    } catch {
      this.localWarranties.unshift(newEntry);
      return { success: true, data: newEntry };
    }
  }

  static async createFromOS(
    os: ServiceOrder, 
    warrantyType: WarrantyType = 'service', 
    customDays?: number
  ): Promise<WarrantyEntry> {
    const days = customDays || os.warrantyDays || 90;
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    const partsCovered = (os.quoteParts || []).map(p => p.name);
    const serviceName = os.serviceExecuted || (os.quoteServices && os.quoteServices.length > 0 ? os.quoteServices.map(s => s.name).join(', ') : 'Serviço de Manutenção Técnica');

    const warrantyCount = this.localWarranties.length + 1;
    const warrantyNumber = `GAR-2026-${String(warrantyCount).padStart(3, '0')}`;

    const newEntry: Omit<WarrantyEntry, 'id' | 'createdAt'> = {
      warrantyNumber,
      osId: os.id,
      osNumber: os.osNumber,
      customerId: os.customerId,
      customerName: os.customerName,
      customerPhone: os.customerPhone,
      deviceModel: os.deviceModel,
      imei: os.imei,
      serialNumber: os.serialNumber,
      warrantyType,
      serviceName,
      partsCovered,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      warrantyDays: days,
      status: 'active',
      terms: `Garantia legal e comercial de ${days} dias para o serviço "${serviceName}" e peças substituídas conforme o Art. 26 do Código de Defesa do Consumidor. A garantia cobre exclusivamente defeitos de fabricação das peças instaladas e da mão de obra executada. Excluem-se da garantia: quebras físicas, trincas na tela/carcaça, contato com líquidos ou vapor d'água, abertura por terceiros ou rompimento dos lacres de segurança.`,
      notes: `Garantia gerada automaticamente na entrega da Ordem de Serviço ${os.osNumber}.`,
      registeredBy: os.technician || 'Hiago',
    };

    const res = await this.create(newEntry);
    return res.data!;
  }

  static async update(id: string, updates: Partial<WarrantyEntry>): Promise<boolean> {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.terms !== undefined) payload.terms = updates.terms;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.endDate !== undefined) payload.end_date = updates.endDate;

      await supabase.from('warranties').update(payload).eq('id', id);

      const idx = this.localWarranties.findIndex(w => w.id === id);
      if (idx !== -1) {
        this.localWarranties[idx] = { ...this.localWarranties[idx], ...updates };
      }
      return true;
    } catch {
      const idx = this.localWarranties.findIndex(w => w.id === id);
      if (idx !== -1) {
        this.localWarranties[idx] = { ...this.localWarranties[idx], ...updates };
      }
      return true;
    }
  }

  // ----------------------------------------------------
  // ATENDIMENTOS DE GARANTIA (RETORNO DE CLIENTES)
  // ----------------------------------------------------
  static async getClaims(): Promise<WarrantyClaim[]> {
    try {
      const { data, error } = await supabase
        .from('warranty_claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return this.localClaims;
      }

      const mapped = data.map(this.mapClaimFromDb);
      this.localClaims = mapped;
      return mapped;
    } catch {
      return this.localClaims;
    }
  }

  static async createClaim(claim: Omit<WarrantyClaim, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: WarrantyClaim }> {
    const newClaim: WarrantyClaim = {
      ...claim,
      id: `clm-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      const { data, error } = await supabase
        .from('warranty_claims')
        .insert([{
          id: newClaim.id,
          claim_number: newClaim.claimNumber,
          warranty_id: newClaim.warrantyId,
          warranty_number: newClaim.warrantyNumber,
          original_os_number: newClaim.originalOsNumber || null,
          new_os_number: newClaim.newOsNumber || null,
          customer_id: newClaim.customerId || null,
          customer_name: newClaim.customerName,
          customer_phone: newClaim.customerPhone,
          device_model: newClaim.deviceModel,
          imei: newClaim.imei || null,
          reported_defect: newClaim.reportedDefect,
          entry_condition: newClaim.entryCondition || null,
          technical_assessment: newClaim.technicalAssessment || null,
          decision: newClaim.decision,
          decision_reason: newClaim.decisionReason || null,
          is_covered: newClaim.isCovered,
          resolution_date: newClaim.resolutionDate || null,
          created_by: newClaim.createdBy || 'Hiago',
        }])
        .select()
        .single();

      if (error || !data) {
        this.localClaims.unshift(newClaim);
        if (newClaim.isCovered) {
          await this.update(newClaim.warrantyId, { status: 'claimed' });
        }
        return { success: true, data: newClaim };
      }

      const created = this.mapClaimFromDb(data);
      this.localClaims.unshift(created);
      if (created.isCovered) {
        await this.update(created.warrantyId, { status: 'claimed' });
      }
      return { success: true, data: created };
    } catch {
      this.localClaims.unshift(newClaim);
      if (newClaim.isCovered) {
        await this.update(newClaim.warrantyId, { status: 'claimed' });
      }
      return { success: true, data: newClaim };
    }
  }

  static async updateClaim(id: string, updates: Partial<WarrantyClaim>): Promise<boolean> {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.decision !== undefined) payload.decision = updates.decision;
      if (updates.decisionReason !== undefined) payload.decision_reason = updates.decisionReason;
      if (updates.technicalAssessment !== undefined) payload.technical_assessment = updates.technicalAssessment;
      if (updates.isCovered !== undefined) payload.is_covered = updates.isCovered;
      if (updates.newOsNumber !== undefined) payload.new_os_number = updates.newOsNumber;
      if (updates.resolutionDate !== undefined) payload.resolution_date = updates.resolutionDate;

      await supabase.from('warranty_claims').update(payload).eq('id', id);

      const idx = this.localClaims.findIndex(c => c.id === id);
      if (idx !== -1) {
        this.localClaims[idx] = { ...this.localClaims[idx], ...updates };
      }
      return true;
    } catch {
      const idx = this.localClaims.findIndex(c => c.id === id);
      if (idx !== -1) {
        this.localClaims[idx] = { ...this.localClaims[idx], ...updates };
      }
      return true;
    }
  }
}
