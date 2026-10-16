import { supabase } from '../services/supabaseClient.js';
import type { CommissionRule, CommissionRecord, Sale } from '../types.js';
import { FinancialRepository } from './financialRepository.js';

const STORAGE_KEY_COMMISSION_RULES = 'hiago_commission_rules';
const STORAGE_KEY_COMMISSION_RECORDS = 'hiago_commission_records';

const INITIAL_RULES: CommissionRule[] = [
  {
    id: 'crule-1',
    userId: 'user-1',
    userName: 'Robson Oliveira Macedo',
    fixedPerDevice: 25.00,
    minDevices: 10,
    period: 'mes',
    percentAccessories: 5,
    active: true,
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 'crule-2',
    userId: 'user-2',
    userName: 'Hiago (Responsável)',
    fixedPerDevice: 20.00,
    minDevices: 10,
    period: 'mes',
    percentAccessories: 3,
    active: true,
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 'crule-3',
    userId: 'user-4',
    userName: 'Vendedor Balcão',
    fixedPerDevice: 20.00,
    minDevices: 10,
    period: 'mes',
    percentAccessories: 2,
    active: true,
    createdAt: '2026-01-01T10:00:00Z',
  },
];

export class CommissionRepository {
  static async getRules(): Promise<CommissionRule[]> {
    try {
      const { data, error } = await supabase
        .from('commission_rules')
        .select('*');
      if (error || !data || data.length === 0) throw new Error();
      return data.map((r: any) => ({
        id: r.id,
        storeId: r.store_id,
        userId: r.user_id,
        userName: r.user_name,
        fixedPerDevice: Number(r.fixed_per_device || 0),
        minDevices: Number(r.min_devices || 0),
        period: r.period || 'mes',
        percentAccessories: Number(r.percent_accessories || 0),
        active: r.active ?? true,
        createdAt: r.created_at,
      }));
    } catch {
      const saved = localStorage.getItem(STORAGE_KEY_COMMISSION_RULES);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(STORAGE_KEY_COMMISSION_RULES, JSON.stringify(INITIAL_RULES));
      return INITIAL_RULES;
    }
  }

  static async saveRule(rule: Omit<CommissionRule, 'id' | 'createdAt'>): Promise<CommissionRule> {
    const rules = await this.getRules();
    const existingIndex = rules.findIndex(r => r.userId === rule.userId);

    let savedRule: CommissionRule;
    if (existingIndex >= 0) {
      savedRule = {
        ...rules[existingIndex],
        ...rule,
      };
      rules[existingIndex] = savedRule;
    } else {
      savedRule = {
        ...rule,
        id: `crule-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      rules.push(savedRule);
    }

    localStorage.setItem(STORAGE_KEY_COMMISSION_RULES, JSON.stringify(rules));

    try {
      await supabase.from('commission_rules').upsert({
        id: savedRule.id,
        user_id: savedRule.userId,
        user_name: savedRule.userName,
        fixed_per_device: savedRule.fixedPerDevice,
        min_devices: savedRule.minDevices,
        period: savedRule.period,
        percent_accessories: savedRule.percentAccessories,
        active: savedRule.active,
      });
    } catch {
      // offline fallback
    }

    return savedRule;
  }

  static async calculateCommissions(
    sales: Sale[],
    startDate: string,
    endDate: string
  ): Promise<{
    ranking: Array<{
      userId: string;
      userName: string;
      devicesSold: number;
      minDevices: number;
      targetReached: boolean;
      totalRevenue: number;
      calculatedAmount: number;
      unlockedAmount: number;
      paidAmount: number;
      pendingPayoutAmount: number;
      status: string;
    }>;
    summary: {
      bestSellerName: string;
      commissionableRevenue: number;
      unlockedCommission: number;
      belowTargetCount: number;
    };
  }> {
    const rules = await this.getRules();
    const paidRecords = await this.getPaidRecords();

    // Filtra vendas concluídas no período
    const periodSales = sales.filter(s => {
      if (s.status === 'cancelled') return false;
      const saleDate = s.date || '';
      return (!startDate || saleDate >= startDate) && (!endDate || saleDate <= endDate);
    });

    // Agrupa vendas por vendedor
    const sellerMap: Record<string, {
      userName: string;
      devicesSold: number;
      totalRevenue: number;
    }> = {};

    periodSales.forEach(s => {
      const seller = s.sellerName || 'Hiago';
      if (!sellerMap[seller]) {
        sellerMap[seller] = {
          userName: seller,
          devicesSold: 0,
          totalRevenue: 0,
        };
      }

      // Conta aparelhos vendidos
      const deviceItems = (s.items || []).filter(i => i.type === 'device');
      const count = deviceItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
      sellerMap[seller].devicesSold += count > 0 ? count : 1;
      sellerMap[seller].totalRevenue += s.total || 0;
    });

    let bestSellerName = 'Sem vendas';
    let maxRevenue = -1;
    let commissionableRevenue = 0;
    let unlockedCommission = 0;
    let belowTargetCount = 0;

    const ranking = Object.keys(sellerMap).map(sellerName => {
      const data = sellerMap[sellerName];
      const rule = rules.find(r => r.userName.toLowerCase().includes(sellerName.toLowerCase()) || sellerName.toLowerCase().includes(r.userName.toLowerCase()))
        || { fixedPerDevice: 20, minDevices: 10, period: 'mes', userId: `usr-${sellerName}` };

      const targetReached = data.devicesSold >= rule.minDevices;
      const calculatedAmount = data.devicesSold * rule.fixedPerDevice;
      const unlockedAmount = targetReached ? calculatedAmount : 0;

      // Verifica quanto já foi pago para este vendedor no período
      const paidToSeller = paidRecords
        .filter(r => r.userName === sellerName)
        .reduce((sum, r) => sum + r.calculatedAmount, 0);

      const pendingPayoutAmount = Math.max(0, unlockedAmount - paidToSeller);

      if (data.totalRevenue > maxRevenue) {
        maxRevenue = data.totalRevenue;
        bestSellerName = data.userName;
      }

      commissionableRevenue += data.totalRevenue;
      unlockedCommission += unlockedAmount;
      if (!targetReached) belowTargetCount++;

      return {
        userId: rule.userId || sellerName,
        userName: data.userName,
        devicesSold: data.devicesSold,
        minDevices: rule.minDevices,
        targetReached,
        totalRevenue: data.totalRevenue,
        calculatedAmount,
        unlockedAmount,
        paidAmount: paidToSeller,
        pendingPayoutAmount,
        status: targetReached
          ? (pendingPayoutAmount === 0 ? 'Pago' : 'Liberado para Pagamento')
          : `Faltam ${rule.minDevices - data.devicesSold} aparelhos`,
      };
    });

    ranking.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      ranking,
      summary: {
        bestSellerName,
        commissionableRevenue,
        unlockedCommission,
        belowTargetCount,
      },
    };
  }

  static async getPaidRecords(): Promise<CommissionRecord[]> {
    const saved = localStorage.getItem(STORAGE_KEY_COMMISSION_RECORDS);
    if (saved) return JSON.parse(saved);
    return [];
  }

  static async payCommission(params: {
    userName: string;
    amount: number;
    paidBy: string;
    accountId: string;
    periodLabel: string;
  }): Promise<CommissionRecord> {
    const record: CommissionRecord = {
      id: `comm-rec-${Date.now()}`,
      userId: `usr-${params.userName}`,
      userName: params.userName,
      devicesSoldCount: 0,
      eligibleRevenue: 0,
      calculatedAmount: params.amount,
      status: 'paid',
      periodLabel: params.periodLabel,
      paidAt: new Date().toISOString(),
      paidBy: params.paidBy,
      createdAt: new Date().toISOString(),
    };

    // Gera saída no Financeiro vinculada
    const accounts = await FinancialRepository.getAccounts();
    const acc = accounts.find(a => a.id === params.accountId) || accounts[0];

    const tx = await FinancialRepository.createTransaction({
      accountId: acc.id,
      accountName: acc.name,
      type: 'outflow',
      category: 'Comissões de Vendas',
      amount: params.amount,
      description: `Pagamento de comissão - ${params.userName} (${params.periodLabel})`,
      origin: 'commission',
      referenceId: record.id,
      operatorName: params.paidBy,
      status: 'confirmed',
      date: new Date().toISOString().split('T')[0],
    });

    record.financialTransactionId = tx.id;

    // Atualiza saldo bancário
    acc.currentBalance -= params.amount;
    await FinancialRepository.updateAccount(acc.id, { currentBalance: acc.currentBalance });

    const records = await this.getPaidRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEY_COMMISSION_RECORDS, JSON.stringify(records));

    return record;
  }
}
