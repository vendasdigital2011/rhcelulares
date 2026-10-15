import { supabase } from '../services/supabaseClient.js';
import type { AfterSalesTrigger, Sale } from '../types.js';
import { INITIAL_AFTER_SALES_TRIGGERS } from '../data/erpData.js';

export class AfterSalesRepository {
  private static mapFromDb(row: any): AfterSalesTrigger {
    return {
      id: row.id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      deviceModel: row.device_model,
      type: row.type || 'checkup_d180',
      title: row.title,
      description: row.description || '',
      discountOffered: row.discount_offered || undefined,
      suggestedMessage: row.suggested_message || '',
      status: row.status || 'pending',
      date: row.scheduled_date || (row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : ''),
    };
  }

  static async getAll(): Promise<AfterSalesTrigger[]> {
    try {
      const { data, error } = await supabase
        .from('after_sales_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return INITIAL_AFTER_SALES_TRIGGERS;
      }

      if (!data || data.length === 0) {
        return INITIAL_AFTER_SALES_TRIGGERS;
      }

      return data.map(this.mapFromDb);
    } catch {
      return INITIAL_AFTER_SALES_TRIGGERS;
    }
  }

  static async updateStatus(id: string, status: 'pending' | 'sent' | 'converted'): Promise<boolean> {
    try {
      const updates: any = { 
        status,
        ...(status === 'sent' ? { contacted_at: new Date().toISOString() } : {}),
        ...(status === 'converted' ? { converted_at: new Date().toISOString() } : {}),
      };

      const { error } = await supabase
        .from('after_sales_tasks')
        .update(updates)
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Gera réguas de pós-venda preditivas quando uma venda de iPhone é concluída
   */
  static async generateForSale(sale: Sale): Promise<AfterSalesTrigger[]> {
    const deviceItem = sale.items.find(i => i.type === 'device');
    const deviceName = deviceItem?.name || 'iPhone';

    const triggersToCreate: Array<Omit<AfterSalesTrigger, 'id'>> = [
      {
        customerName: sale.customerName,
        customerPhone: sale.customerPhone || '',
        deviceModel: deviceName,
        type: 'accessory_d15',
        title: 'D+15 • Check-in de Adaptação & Acessórios',
        description: 'Verificar se o cliente está satisfeito com o aparelho e oferecer cupom de 15% na compra de fonte rápida ou capa magsafe.',
        discountOffered: '15% OFF em Acessórios',
        suggestedMessage: `Olá ${sale.customerName}! Aqui é o Hiago da Hiago iPhones. Já faz 15 dias que você garantiu seu ${deviceName}! Como está sendo a experiência? Passando para te presentear com 15% de desconto em qualquer capa ou carregador homologado esta semana! 🍏`,
        status: 'pending',
        date: new Date(Date.now() + 15 * 86400000).toLocaleDateString('pt-BR'),
      },
      {
        customerName: sale.customerName,
        customerPhone: sale.customerPhone || '',
        deviceModel: deviceName,
        type: 'checkup_d180',
        title: 'D+180 • Check-up Preventivo da Bateria',
        description: 'Revisão semestral gratuita: diagnóstico dos ciclos de carga, saúde da bateria e limpeza acústica dos alto-falantes.',
        suggestedMessage: `Oi ${sale.customerName}, tudo bem? Seu ${deviceName} completou 6 meses de uso! Você tem direito a um Check-up Preventivo Gratuito aqui na loja com teste de bateria e higienização. Quando pode dar uma passada aqui?`,
        status: 'pending',
        date: new Date(Date.now() + 180 * 86400000).toLocaleDateString('pt-BR'),
      },
      {
        customerName: sale.customerName,
        customerPhone: sale.customerPhone || '',
        deviceModel: deviceName,
        type: 'upgrade_d360',
        title: 'D+360 • Ciclo de Troca / Oferta de Upgrade',
        description: 'Proposta de recompra do aparelho atual com valorização máxima de Trade-in para migração para a nova geração.',
        suggestedMessage: `Fala ${sale.customerName}! Faz 1 ano que você está com o ${deviceName}. Chegaram novos lotes na loja e estamos pagando avaliação especial no seu usado como entrada! Gostaria de uma simulação sem compromisso?`,
        status: 'pending',
        date: new Date(Date.now() + 360 * 86400000).toLocaleDateString('pt-BR'),
      },
    ];

    const createdTriggers: AfterSalesTrigger[] = [];

    for (const t of triggersToCreate) {
      const newTrigger: AfterSalesTrigger = {
        ...t,
        id: `ast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      };
      createdTriggers.push(newTrigger);

      // Tenta gravar no banco se tabela existir
      try {
        await supabase.from('after_sales_tasks').insert([{
          id: newTrigger.id,
          customer_name: newTrigger.customerName,
          customer_phone: newTrigger.customerPhone,
          device_model: newTrigger.deviceModel,
          type: newTrigger.type,
          title: newTrigger.title,
          description: newTrigger.description,
          suggested_message: newTrigger.suggestedMessage,
          status: newTrigger.status,
          sale_id: sale.id,
          scheduled_date: newTrigger.date,
        }]);
      } catch {
        // Fallback gracioso
      }
    }

    return createdTriggers;
  }
}
