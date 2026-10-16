import { supabase } from '../services/supabaseClient.js';
import type { StoreSettings, CardMachineConfig } from '../types.js';

const STORAGE_KEY_SETTINGS = 'hiago_store_settings';

const DEFAULT_CARD_MACHINES: CardMachineConfig[] = [
  {
    id: 'cm-1',
    name: 'Stone Principal - Balcão',
    acquirer: 'Stone',
    debitFee: 1.15,
    creditCashFee: 2.89,
    installmentFees: {
      2: 3.80,
      3: 4.50,
      4: 5.20,
      5: 5.90,
      6: 6.60,
      10: 9.40,
      12: 10.80,
      18: 14.50,
    },
    payoutDays: 1,
    active: true,
  },
  {
    id: 'cm-2',
    name: 'PagBank / Mercado Pago - Reserva',
    acquirer: 'PagBank',
    debitFee: 1.39,
    creditCashFee: 3.19,
    installmentFees: {
      2: 4.10,
      3: 4.80,
      4: 5.50,
      6: 7.10,
      12: 11.50,
    },
    payoutDays: 1,
    active: true,
  },
];

const DEFAULT_SETTINGS: StoreSettings = {
  id: 'settings-1',
  storeName: 'RH Celulares',
  logoUrl: '',
  slug: 'loja-vendasdigital2011-gmail-com',
  cnpjCpf: '12.345.678/0001-90',
  phone: '77999261653',
  whatsapp: '77999261653',
  instagram: '@sualoja',
  cep: '45000-000',
  street: 'Preenchida pelo CNPJ',
  number: '120',
  complement: 'Sala, bloco, referência',
  neighborhood: 'Preenchido pelo CNPJ',
  city: 'Manaus',
  uf: 'AM',
  timezone: 'America/Manaus',
  warrantyReservationDays: 90,
  isShowcaseActive: false,
  termsSale: 'Garantia legal de 90 dias conforme artigo 26 do Código de Defesa do Consumidor. Aparelhos novos lacrados possuem garantia mundial Apple de 1 ano.',
  termsWarrantyNew: '1 ano de garantia oficial Apple com suporte em centros autorizados.',
  termsWarrantyUsed: '90 dias de garantia da loja cobrindo defeitos de funcionamento, placa e componentes internos.',
  termsAssistance: 'Garantia de 90 dias exclusivamente sobre o serviço executado e peças substituídas informadas nesta OS.',
  cardMachines: DEFAULT_CARD_MACHINES,
  locationConfig: {
    latitude: -3.1190275,
    longitude: -60.0217314,
    radiusMeters: 150,
    requireGps: true,
  },
};

export class StoreSettingsRepository {
  static async getSettings(): Promise<StoreSettings> {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error || !data) throw new Error();
      return {
        id: data.id,
        storeId: data.store_id,
        storeName: data.store_name,
        logoUrl: data.logo_url,
        slug: data.slug,
        cnpjCpf: data.cnpj_cpf,
        phone: data.phone,
        whatsapp: data.whatsapp,
        instagram: data.instagram,
        cep: data.cep,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        uf: data.uf,
        timezone: data.timezone,
        warrantyReservationDays: data.warranty_reservation_days || 90,
        isShowcaseActive: data.is_showcase_active ?? false,
        termsSale: data.terms_sale,
        termsWarrantyNew: data.terms_warranty_new,
        termsWarrantyUsed: data.terms_warranty_used,
        termsAssistance: data.terms_assistance,
        cardMachines: data.card_machines || DEFAULT_CARD_MACHINES,
        locationConfig: data.location_config || DEFAULT_SETTINGS.locationConfig,
      };
    } catch {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
  }

  static async updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getSettings();
    const updated: StoreSettings = {
      ...current,
      ...updates,
    };

    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));

    try {
      await supabase.from('store_settings').upsert({
        id: updated.id,
        store_name: updated.storeName,
        logo_url: updated.logoUrl,
        slug: updated.slug,
        cnpj_cpf: updated.cnpjCpf,
        phone: updated.phone,
        whatsapp: updated.whatsapp,
        instagram: updated.instagram,
        cep: updated.cep,
        street: updated.street,
        number: updated.number,
        complement: updated.complement,
        neighborhood: updated.neighborhood,
        city: updated.city,
        uf: updated.uf,
        timezone: updated.timezone,
        warranty_reservation_days: updated.warrantyReservationDays,
        is_showcase_active: updated.isShowcaseActive,
        terms_sale: updated.termsSale,
        terms_warranty_new: updated.termsWarrantyNew,
        terms_warranty_used: updated.termsWarrantyUsed,
        terms_assistance: updated.termsAssistance,
        card_machines: updated.cardMachines,
        location_config: updated.locationConfig,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // offline fallback
    }

    return updated;
  }
}
