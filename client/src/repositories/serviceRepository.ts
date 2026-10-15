import { supabase } from '../services/supabaseClient.js';
import type { TechnicalService } from '../types.js';

export const INITIAL_TECHNICAL_SERVICES: TechnicalService[] = [
  {
    id: 'srv-1',
    name: 'Troca de Tela OLED + True Tone',
    code: 'SRV-TELA-OLED',
    category: 'Troca de tela',
    description: 'Substituição completa do módulo frontal OLED com transferência de serial e ativação True Tone.',
    compatibleDevices: ['iPhone'],
    compatibleModels: ['iPhone X', 'iPhone 11 Pro', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15'],
    defaultPrice: 650.00,
    estimatedCost: 240.00,
    estimatedMinutes: 45,
    defaultWarrantyDays: 90,
    notes: 'Requer gravador JCID para copiar dados do chip eeprom da tela original.',
    status: 'active',
    createdAt: '2026-01-10',
  },
  {
    id: 'srv-2',
    name: 'Troca de Tela Incell Premium',
    code: 'SRV-TELA-INC',
    category: 'Troca de tela',
    description: 'Substituição da tela por modelo Incell com excelente fidelidade de toque e cores.',
    compatibleDevices: ['iPhone'],
    compatibleModels: ['iPhone 11', 'iPhone XR', 'iPhone 12', 'iPhone 13'],
    defaultPrice: 320.00,
    estimatedCost: 95.00,
    estimatedMinutes: 40,
    defaultWarrantyDays: 90,
    notes: 'Excelente custo-benefício para aparelhos da linha de entrada.',
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 'srv-3',
    name: 'Troca de Bateria Foxconn c/ Flex Original',
    code: 'SRV-BAT-FOX',
    category: 'Troca de bateria',
    description: 'Bateria nova grau A com transplante de chip BMS original para não exibir mensagem de peça desconhecida.',
    compatibleDevices: ['iPhone'],
    compatibleModels: ['iPhone XR', 'iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14'],
    defaultPrice: 280.00,
    estimatedCost: 65.00,
    estimatedMinutes: 35,
    defaultWarrantyDays: 90,
    notes: 'Solda por pontos do BMS original e reprogramação de ciclos para 100%.',
    status: 'active',
    createdAt: '2026-02-01',
  },
  {
    id: 'srv-4',
    name: 'Reparo Face ID (Prisma / Flex Dot Projector)',
    code: 'SRV-FACE-ID',
    category: 'Reparo de placa',
    description: 'Microsoldagem e reparo do sensor biométrico Face ID mantendo a segurança original.',
    compatibleDevices: ['iPhone', 'iPad'],
    compatibleModels: ['iPhone X', 'iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14'],
    defaultPrice: 450.00,
    estimatedCost: 80.00,
    estimatedMinutes: 180,
    defaultWarrantyDays: 90,
    notes: 'Reparo de alta precisão na bancada com microscópio estéreo.',
    status: 'active',
    createdAt: '2026-02-10',
  },
  {
    id: 'srv-5',
    name: 'Troca de Vidro Traseiro a Laser',
    code: 'SRV-VIDRO-TR',
    category: 'Outros',
    description: 'Remoção de vidro quebrado com máquina laser de precisão sem necessidade de desmontar todo o aparelho.',
    compatibleDevices: ['iPhone'],
    compatibleModels: ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15'],
    defaultPrice: 380.00,
    estimatedCost: 50.00,
    estimatedMinutes: 120,
    defaultWarrantyDays: 90,
    notes: 'Acabamento com cola B7000/T8000 nas bordas com alinhamento perfeito.',
    status: 'active',
    createdAt: '2026-02-15',
  },
  {
    id: 'srv-6',
    name: 'Reparo do Conector de Carga Lightning / Type-C',
    code: 'SRV-CONECT-CARG',
    category: 'Reparo de conector',
    description: 'Troca do flex dock de carga e microfones inferiores com teste de corrente amperimétrica.',
    compatibleDevices: ['iPhone', 'iPad'],
    compatibleModels: ['Todos os modelos'],
    defaultPrice: 220.00,
    estimatedCost: 40.00,
    estimatedMinutes: 50,
    defaultWarrantyDays: 90,
    notes: 'Testar carregamento rápido e detecção no computador antes de fechar.',
    status: 'active',
    createdAt: '2026-02-20',
  },
  {
    id: 'srv-7',
    name: 'Desoxidação e Limpeza Química Ultrassônica',
    code: 'SRV-DESOX-ULTRA',
    category: 'Limpeza técnica',
    description: 'Banho químico em cuba ultrassônica com álcool isopropílico para aparelhos com contato com líquidos.',
    compatibleDevices: ['iPhone', 'iPad', 'Apple Watch'],
    compatibleModels: ['Todos os modelos'],
    defaultPrice: 200.00,
    estimatedCost: 30.00,
    estimatedMinutes: 240,
    defaultWarrantyDays: 30,
    notes: 'Garantia de 30 dias devido à natureza imprevisível de danos por oxidação.',
    status: 'active',
    createdAt: '2026-03-01',
  },
  {
    id: 'srv-8',
    name: 'Recuperação de Software / Erro de Restauração iTunes',
    code: 'SRV-SOFT-REST',
    category: 'Software',
    description: 'Restauração de firmware DFU, desbrick e atualização de sistema operacional iOS com preservação de dados quando possível.',
    compatibleDevices: ['iPhone', 'iPad'],
    compatibleModels: ['Todos os modelos'],
    defaultPrice: 150.00,
    estimatedCost: 10.00,
    estimatedMinutes: 60,
    defaultWarrantyDays: 30,
    notes: 'Se houver falha de hardware na memória NAND, informar o cliente previamente.',
    status: 'active',
    createdAt: '2026-03-05',
  },
];

export class TechnicalServiceRepository {
  private static localServices: TechnicalService[] = [...INITIAL_TECHNICAL_SERVICES];

  private static mapFromDb(row: any): TechnicalService {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      category: row.category,
      description: row.description || '',
      compatibleDevices: Array.isArray(row.compatible_devices) ? row.compatible_devices : ['iPhone'],
      compatibleModels: Array.isArray(row.compatible_models) ? row.compatible_models : [],
      defaultPrice: Number(row.default_price || 0),
      estimatedCost: Number(row.estimated_cost || 0),
      estimatedMinutes: Number(row.estimated_minutes || 60),
      defaultWarrantyDays: Number(row.default_warranty_days || 90),
      notes: row.notes || '',
      status: row.status === 'inactive' ? 'inactive' : 'active',
      createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-01-01',
      updatedAt: row.updated_at,
    };
  }

  static async getAll(): Promise<TechnicalService[]> {
    try {
      const { data, error } = await supabase
        .from('technical_services')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.localServices;
      }

      const mapped = data.map(this.mapFromDb);
      this.localServices = mapped;
      return mapped;
    } catch {
      return this.localServices;
    }
  }

  static async getById(id: string): Promise<TechnicalService | undefined> {
    const all = await this.getAll();
    return all.find(s => s.id === id);
  }

  static async create(service: Omit<TechnicalService, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: TechnicalService }> {
    const newService: TechnicalService = {
      ...service,
      id: `srv-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      const { data, error } = await supabase
        .from('technical_services')
        .insert([{
          id: newService.id,
          name: newService.name,
          code: newService.code,
          category: newService.category,
          description: newService.description,
          compatible_devices: newService.compatibleDevices || ['iPhone'],
          compatible_models: newService.compatibleModels || [],
          default_price: newService.defaultPrice,
          estimated_cost: newService.estimatedCost,
          estimated_minutes: newService.estimatedMinutes,
          default_warranty_days: newService.defaultWarrantyDays,
          notes: newService.notes,
          status: newService.status,
        }])
        .select()
        .single();

      if (error || !data) {
        this.localServices.unshift(newService);
        return { success: true, data: newService };
      }

      const created = this.mapFromDb(data);
      this.localServices.unshift(created);
      return { success: true, data: created };
    } catch {
      this.localServices.unshift(newService);
      return { success: true, data: newService };
    }
  }

  static async update(id: string, updates: Partial<TechnicalService>): Promise<boolean> {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.code !== undefined) payload.code = updates.code;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.compatibleDevices !== undefined) payload.compatible_devices = updates.compatibleDevices;
      if (updates.compatibleModels !== undefined) payload.compatible_models = updates.compatibleModels;
      if (updates.defaultPrice !== undefined) payload.default_price = updates.defaultPrice;
      if (updates.estimatedCost !== undefined) payload.estimated_cost = updates.estimatedCost;
      if (updates.estimatedMinutes !== undefined) payload.estimated_minutes = updates.estimatedMinutes;
      if (updates.defaultWarrantyDays !== undefined) payload.default_warranty_days = updates.defaultWarrantyDays;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.status !== undefined) payload.status = updates.status;

      await supabase.from('technical_services').update(payload).eq('id', id);

      const idx = this.localServices.findIndex(s => s.id === id);
      if (idx !== -1) {
        this.localServices[idx] = { ...this.localServices[idx], ...updates };
      }
      return true;
    } catch {
      const idx = this.localServices.findIndex(s => s.id === id);
      if (idx !== -1) {
        this.localServices[idx] = { ...this.localServices[idx], ...updates };
      }
      return true;
    }
  }

  static async delete(id: string): Promise<boolean> {
    // Soft delete por desativação para não quebrar integridade de ordens históricas
    return this.update(id, { status: 'inactive' });
  }
}
