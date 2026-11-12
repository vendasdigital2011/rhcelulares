import { sendWhatsAppCloudMessage } from './whatsapp.service.js';

export interface AmbassadorReferral {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceBought: string;
  referralCode: string;
  referralLink: string;
  friendsInvited: number;
  friendsConverted: number;
  totalRewardEarned: number; // R$
  pendingReward: number; // R$
  createdAt: string;
}

export interface RoiDashboardMetrics {
  totalRevenueRecovered: number;
  salesFromAutomationsCount: number;
  salesFromReferralsCount: number;
  softwareCostMonthly: number;
  roiMultiplier: number;
  tmrMinutesAverage: number;
  activeAttendantsCount: number;
}

let ambassadors: AmbassadorReferral[] = [
  {
    id: 'amb-01',
    customerName: 'Lucas Rodrigues',
    customerPhone: '(77) 99122-3344',
    deviceBought: 'iPhone 15 Pro 256GB',
    referralCode: 'HIAGO-LUCAS15',
    referralLink: 'https://hiago-iphones.vercel.app/?ref=HIAGO-LUCAS15',
    friendsInvited: 6,
    friendsConverted: 3,
    totalRewardEarned: 300,
    pendingReward: 100,
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'amb-02',
    customerName: 'Mariana Costa',
    customerPhone: '(77) 98844-5566',
    deviceBought: 'iPhone 14 128GB',
    referralCode: 'HIAGO-MARI14',
    referralLink: 'https://hiago-iphones.vercel.app/?ref=HIAGO-MARI14',
    friendsInvited: 4,
    friendsConverted: 2,
    totalRewardEarned: 200,
    pendingReward: 0,
    createdAt: '2026-10-20T14:30:00Z',
  },
  {
    id: 'amb-03',
    customerName: 'Rafael Guimarães',
    customerPhone: '(77) 99911-8822',
    deviceBought: 'iPhone 13 Pro Max',
    referralCode: 'HIAGO-RAFA13',
    referralLink: 'https://hiago-iphones.vercel.app/?ref=HIAGO-RAFA13',
    friendsInvited: 3,
    friendsConverted: 1,
    totalRewardEarned: 100,
    pendingReward: 100,
    createdAt: '2026-11-01T09:15:00Z',
  },
];

export class WhatsAppReferralService {
  /**
   * Retorna os embaixadores do programa Member-Get-Member
   */
  public static getAmbassadors(): AmbassadorReferral[] {
    return ambassadors;
  }

  /**
   * Gera código e link exclusivo de embaixador
   */
  public static generateReferral(customerName: string, customerPhone: string, deviceBought: string): AmbassadorReferral {
    const slug = customerName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const referralCode = `HIAGO-${slug}${randomSuffix}`;
    const referralLink = `https://hiago-iphones.vercel.app/?ref=${referralCode}`;

    const newAmb: AmbassadorReferral = {
      id: `amb-${Date.now()}`,
      customerName,
      customerPhone,
      deviceBought,
      referralCode,
      referralLink,
      friendsInvited: 0,
      friendsConverted: 0,
      totalRewardEarned: 0,
      pendingReward: 0,
      createdAt: new Date().toISOString(),
    };

    ambassadors.unshift(newAmb);
    return newAmb;
  }

  /**
   * Dispara convite de embaixador via WhatsApp Cloud API Oficial
   */
  public static async sendReferralInvite(ambassadorId: string, operator: string = 'Hiago Vendas'): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    const amb = ambassadors.find(a => a.id === ambassadorId);
    if (!amb) {
      return { success: false, error: 'Embaixador não encontrado' };
    }

    const message = `Olá ${amb.customerName.split(' ')[0]}! Esperamos que esteja amando o seu ${amb.deviceBought}! 📱✨\n\n` +
      `Como você é nosso cliente VIP, liberamos seu link exclusivo do nosso Clube de Embaixadores Hiago iPhones:\n` +
      `🔗 ${amb.referralLink}\n\n` +
      `🎁 Como funciona:\n` +
      `1. Você envia esse link para qualquer amigo ou familiar;\n` +
      `2. Eles ganham R$ 100 de desconto ou kit proteção premium (capa + película) na compra de qualquer iPhone;\n` +
      `3. Você ganha R$ 100 em Pix ou créditos na loja para cada compra confirmada!\n\n` +
      `Basta compartilhar esta mensagem!`;

    const res = await sendWhatsAppCloudMessage({
      to: amb.customerPhone,
      message,
      senderName: operator,
    });

    return {
      success: res.success,
      messageId: res.messageId,
      error: res.error,
    };
  }

  /**
   * Calcula as métricas executivas de ROI da plataforma
   */
  public static getExecutiveRoiMetrics(): RoiDashboardMetrics {
    const softwareCostMonthly = 497.00;
    const automationsRevenue = 38450.00; // Vendas D+15, D+180, D+360
    const referralRevenue = 15750.00; // Vendas trazidas por indicação
    const totalRevenueRecovered = automationsRevenue + referralRevenue;

    const roiMultiplier = Number((totalRevenueRecovered / softwareCostMonthly).toFixed(1));

    return {
      totalRevenueRecovered,
      salesFromAutomationsCount: 14,
      salesFromReferralsCount: 6,
      softwareCostMonthly,
      roiMultiplier,
      tmrMinutesAverage: 4.2,
      activeAttendantsCount: 4,
    };
  }
}
