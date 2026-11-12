import { sendWhatsAppCloudMessage } from './whatsapp.service.js';

export interface WhatsAppLifecycleRule {
  id: string;
  code: 'd0_warranty' | 'd15_accessories' | 'd180_battery_checkup' | 'd360_upgrade';
  name: string;
  triggerDays: number;
  description: string;
  active: boolean;
  templateMessage: string;
  eligibleCount: number;
  executedCount: number;
  convertedCount: number;
  lastExecutedAt?: string;
  eligibleClients: Array<{
    id: string;
    customerName: string;
    customerPhone: string;
    deviceModel: string;
    purchaseDate: string;
    batteryHealth?: number;
  }>;
}

// Estado em memória das 4 réguas do ciclo de vida
let lifecycleRules: WhatsAppLifecycleRule[] = [
  {
    id: 'rule-d0',
    code: 'd0_warranty',
    name: 'D+0: Termo de Garantia Imediato & Agradecimento',
    triggerDays: 0,
    description: 'Disparado logo após a conclusão da venda no balcão com o termo de garantia oficial de 90 dias.',
    active: true,
    templateMessage: 'Olá {cliente}! Parabéns pelo seu novo {aparelho}! 📱✨ Segue o seu Termo de Garantia de 90 dias da Hiago iPhones. Seu aparelho foi 100% testado e higienizado antes da entrega. Qualquer dúvida sobre o uso ou backup, estamos à disposição por aqui!',
    eligibleCount: 3,
    executedCount: 42,
    convertedCount: 42,
    lastExecutedAt: new Date(Date.now() - 1800000).toISOString(),
    eligibleClients: [
      { id: 'cli-01', customerName: 'Felipe Santana', customerPhone: '(77) 99112-8877', deviceModel: 'iPhone 14 128GB Azul', purchaseDate: 'Hoje' },
      { id: 'cli-02', customerName: 'Renata Meireles', customerPhone: '(77) 99881-2233', deviceModel: 'iPhone 13 128GB Estelar', purchaseDate: 'Hoje' },
      { id: 'cli-03', customerName: 'Diego Silveira', customerPhone: '(77) 98114-5566', deviceModel: 'iPhone 15 256GB Preto', purchaseDate: 'Hoje' },
    ],
  },
  {
    id: 'rule-d15',
    code: 'd15_accessories',
    name: 'D+15: Oferta de Acessórios & Proteção',
    triggerDays: 15,
    description: 'Contato pós-adaptação para oferecer fonte turbo 20W, cabos homologados e película de reposição.',
    active: true,
    templateMessage: 'Olá {cliente}, tudo bem? Passando para checar como está a sua experiência com o seu {aparelho}! 🔋⚡ Se estiver precisando de fonte turbo USB-C de 20W original, fones ou uma capinha de silicone extra, separamos um cupom de 15% OFF de boas-vindas na loja para você hoje!',
    eligibleCount: 4,
    executedCount: 38,
    convertedCount: 14,
    lastExecutedAt: new Date(Date.now() - 86400000).toISOString(),
    eligibleClients: [
      { id: 'cli-04', customerName: 'Larissa Alencar', customerPhone: '(77) 98822-4411', deviceModel: 'iPhone 13 128GB', purchaseDate: 'Há 15 dias' },
      { id: 'cli-05', customerName: 'Bruno Carvalho', customerPhone: '(77) 99933-7788', deviceModel: 'iPhone 12 64GB', purchaseDate: 'Há 15 dias' },
      { id: 'cli-06', customerName: 'Juliana Pires', customerPhone: '(77) 99122-3344', deviceModel: 'iPhone 14 Pro 128GB', purchaseDate: 'Há 16 dias' },
      { id: 'cli-07', customerName: 'Gustavo Lima', customerPhone: '(77) 99877-6655', deviceModel: 'iPhone 11 128GB', purchaseDate: 'Há 15 dias' },
    ],
  },
  {
    id: 'rule-d180',
    code: 'd180_battery_checkup',
    name: 'D+180: Revisão Preventiva & Saúde da Bateria (6 Meses)',
    triggerDays: 180,
    description: 'Convite para avaliação de bancada gratuita e diagnóstico da saúde da bateria aos 6 meses de uso.',
    active: true,
    templateMessage: 'Olá {cliente}! Seu {aparelho} completou 6 meses com você! 🛠️✨ Como está a saúde da bateria dele? Gostaríamos de te convidar para passar aqui na nossa loja física para um check-up preventivo gratuito de bancada e limpeza interna de conectores. Vamos agendar?',
    eligibleCount: 3,
    executedCount: 29,
    convertedCount: 11,
    lastExecutedAt: new Date(Date.now() - 172800000).toISOString(),
    eligibleClients: [
      { id: 'cli-08', customerName: 'Thiago Nogueira', customerPhone: '(77) 98112-9900', deviceModel: 'iPhone 12 128GB', purchaseDate: 'Há 6 meses', batteryHealth: 87 },
      { id: 'cli-09', customerName: 'Beatriz Ramos', customerPhone: '(77) 99911-3322', deviceModel: 'iPhone 13 128GB', purchaseDate: 'Há 6 meses', batteryHealth: 89 },
      { id: 'cli-10', customerName: 'Carlos Eduardo', customerPhone: '(77) 98844-1122', deviceModel: 'iPhone 11 64GB', purchaseDate: 'Há 6 meses', batteryHealth: 83 },
    ],
  },
  {
    id: 'rule-d360',
    code: 'd360_upgrade',
    name: 'D+360: Ciclo de Upgrade & Avaliação de Trade-in (1 Ano)',
    triggerDays: 360,
    description: 'Campanha de aniversário de 1 ano do aparelho com avaliação máxima garantida do usado na troca.',
    active: true,
    templateMessage: 'Olá {cliente}! Seu {aparelho} completou 1 ano de uso hoje! 🥳🎉 Essa é a melhor janela de mercado para troca antes da desvalorização do próximo ciclo da Apple. Nós pré-aprovamos uma avaliação excelente do seu aparelho atual como entrada para você sair de iPhone mais novo hoje. Quer que eu faça uma simulação de parcelas sem compromisso?',
    eligibleCount: 2,
    executedCount: 18,
    convertedCount: 9,
    lastExecutedAt: new Date(Date.now() - 259200000).toISOString(),
    eligibleClients: [
      { id: 'cli-11', customerName: 'Marcelo Queiroz', customerPhone: '(77) 99188-7766', deviceModel: 'iPhone 13 128GB', purchaseDate: 'Há 12 meses', batteryHealth: 84 },
      { id: 'cli-12', customerName: 'Fernanda Diniz', customerPhone: '(77) 98877-2211', deviceModel: 'iPhone 12 64GB', purchaseDate: 'Há 12 meses', batteryHealth: 81 },
    ],
  },
];

export class WhatsAppLifecycleRulesService {
  /**
   * Retorna a lista de todas as réguas ativas do ciclo de vida
   */
  public static getRules(): WhatsAppLifecycleRule[] {
    return lifecycleRules;
  }

  /**
   * Alterna status da régua (Ativa / Pausada)
   */
  public static toggleRule(ruleId: string): WhatsAppLifecycleRule | null {
    const rule = lifecycleRules.find(r => r.id === ruleId);
    if (!rule) return null;
    rule.active = !rule.active;
    return rule;
  }

  /**
   * Atualiza o template da mensagem da régua
   */
  public static updateTemplate(ruleId: string, templateMessage: string): WhatsAppLifecycleRule | null {
    const rule = lifecycleRules.find(r => r.id === ruleId);
    if (!rule) return null;
    rule.templateMessage = templateMessage;
    return rule;
  }

  /**
   * Dispara a régua em lote para todos os clientes elegíveis via Meta Cloud API Oficial
   */
  public static async triggerBatch(ruleId: string, operator: string = 'Hiago Vendas'): Promise<{
    success: boolean;
    dispatchedCount: number;
    ruleName: string;
    details: Array<{ clientName: string; phone: string; messageId?: string; status: string }>;
  }> {
    const rule = lifecycleRules.find(r => r.id === ruleId);
    if (!rule) {
      throw new Error('Régua não encontrada');
    }

    const details: Array<{ clientName: string; phone: string; messageId?: string; status: string }> = [];

    for (const client of rule.eligibleClients) {
      const formattedMessage = rule.templateMessage
        .replace('{cliente}', client.customerName.split(' ')[0])
        .replace('{aparelho}', client.deviceModel);

      const res = await sendWhatsAppCloudMessage({
        to: client.customerPhone,
        message: formattedMessage,
        senderName: operator,
      });

      details.push({
        clientName: client.customerName,
        phone: client.customerPhone,
        messageId: res.messageId,
        status: res.success ? 'sent' : 'failed',
      });
    }

    rule.executedCount += rule.eligibleClients.length;
    rule.lastExecutedAt = new Date().toISOString();

    return {
      success: true,
      dispatchedCount: details.filter(d => d.status === 'sent').length,
      ruleName: rule.name,
      details,
    };
  }
}

