import { supabase } from '../services/supabaseClient.js';
import type { CashRegister, CashTransaction, TransactionCategory } from '../types.js';
import { INITIAL_CASH } from '../data/erpData.js';

export class CashRepository {
  private static mapTransactionFromDb(row: any): CashTransaction {
    return {
      id: row.id,
      registerId: row.register_id || undefined,
      type: row.type || 'inflow',
      category: row.category || 'sale',
      description: row.description || '',
      amount: Number(row.amount || 0),
      paymentMethod: row.payment_method || undefined,
      saleId: row.sale_id || undefined,
      operatorName: row.operator_name || undefined,
      createdAt: row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR'),
    };
  }

  static async getCurrent(): Promise<CashRegister> {
    try {
      const { data: openRegister, error } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('status', 'open')
        .order('opened_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !openRegister) {
        // Se não houver caixa aberto, busca o último fechado para exibição do histórico
        const { data: lastClosed } = await supabase
          .from('cash_registers')
          .select('*')
          .order('closed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastClosed) {
          return {
            id: lastClosed.id,
            isOpen: false,
            operatorName: lastClosed.operator_name || 'Operador',
            openedAt: lastClosed.opened_at ? new Date(lastClosed.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            closedAt: lastClosed.closed_at ? new Date(lastClosed.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            initialFloat: Number(lastClosed.initial_float || 0),
            totalSales: Number(lastClosed.total_sales || 0),
            closingCashCounted: lastClosed.closing_cash_counted ? Number(lastClosed.closing_cash_counted) : undefined,
            closingDifference: lastClosed.closing_difference ? Number(lastClosed.closing_difference) : undefined,
            breakdown: { money: 0, pix: 0, creditCard: 0, debitCard: 0, tradeIn: 0, other: 0 },
            transactions: [],
          };
        }

        return INITIAL_CASH;
      }

      // Busca todas as transações do caixa atual
      const { data: transactions } = await supabase
        .from('cash_transactions')
        .select('*')
        .eq('register_id', openRegister.id)
        .order('created_at', { ascending: false });

      const breakdown = {
        money: 0,
        pix: 0,
        creditCard: 0,
        debitCard: 0,
        tradeIn: 0,
        other: 0,
      };

      let totalSales = 0;

      const mappedTransactions = (transactions || []).map(this.mapTransactionFromDb);

      mappedTransactions.forEach(tx => {
        const amount = tx.amount;
        if (tx.type === 'inflow') {
          totalSales += amount;
          const method = (tx.paymentMethod || '').toLowerCase();
          if (method.includes('dinheiro') || method.includes('money')) breakdown.money += amount;
          else if (method.includes('pix')) breakdown.pix += amount;
          else if (method.includes('crédito') || method.includes('credit')) breakdown.creditCard += amount;
          else if (method.includes('débito') || method.includes('debit')) breakdown.debitCard += amount;
          else if (method.includes('troca') || method.includes('trade')) breakdown.tradeIn += amount;
          else breakdown.other += amount;
        } else if (tx.type === 'outflow' && tx.category === 'estorno') {
          totalSales -= amount;
        }
      });

      return {
        id: openRegister.id,
        isOpen: true,
        operatorName: openRegister.operator_name || 'Hiago',
        openedAt: openRegister.opened_at ? new Date(openRegister.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        initialFloat: Number(openRegister.initial_float || 300),
        totalSales,
        breakdown,
        transactions: mappedTransactions,
      };
    } catch {
      return INITIAL_CASH;
    }
  }

  /**
   * Abre o caixa com saldo inicial e operador
   */
  static async openCash(initialFloat: number = 300, operatorName: string = 'Hiago'): Promise<CashRegister> {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('cash_registers')
        .insert([{
          status: 'open',
          initial_float: initialFloat,
          operator_name: operatorName,
          opened_at: now.toISOString(),
          total_sales: 0,
        }])
        .select()
        .single();

      if (error) {
        console.warn('Erro ao abrir caixa no Supabase:', error.message);
      }

      return {
        id: data?.id,
        isOpen: true,
        operatorName,
        openedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        initialFloat,
        totalSales: 0,
        breakdown: { money: 0, pix: 0, creditCard: 0, debitCard: 0, tradeIn: 0, other: 0 },
        transactions: [],
      };
    } catch {
      return {
        isOpen: true,
        openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        initialFloat,
        totalSales: 0,
        breakdown: { money: 0, pix: 0, creditCard: 0, debitCard: 0, tradeIn: 0, other: 0 },
      };
    }
  }

  /**
   * Fecha o caixa com conferência cega (contagem do dinheiro pelo operador e cálculo de quebra/sobra)
   */
  static async closeCash(
    cashCounted: number, 
    _notes?: string
  ): Promise<{ success: boolean; expectedCash: number; difference: number; register: CashRegister }> {
    try {
      const current = await this.getCurrent();
      // O saldo esperado na gaveta é: Fundo Inicial + Entradas em Dinheiro - Saídas em Dinheiro (Sangrias)
      const cashInflow = current.breakdown.money;
      const cashOutflow = (current.transactions || [])
        .filter(t => t.type === 'outflow' && (t.paymentMethod?.toLowerCase().includes('dinheiro') || t.category === 'sangria'))
        .reduce((acc, curr) => acc + curr.amount, 0);

      const expectedCash = current.initialFloat + cashInflow - cashOutflow;
      const difference = cashCounted - expectedCash;

      const updates: any = {
        status: 'closed',
        closed_at: new Date().toISOString(),
      };

      if (current.id) {
        await supabase
          .from('cash_registers')
          .update(updates)
          .eq('id', current.id);
      }

      const closedRegister: CashRegister = {
        ...current,
        isOpen: false,
        closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        closingCashCounted: cashCounted,
        closingDifference: difference,
      };

      return {
        success: true,
        expectedCash,
        difference,
        register: closedRegister,
      };
    } catch (err) {
      return {
        success: true,
        expectedCash: 300,
        difference: 0,
        register: { ...INITIAL_CASH, isOpen: false },
      };
    }
  }

  /**
   * Registra movimentações financeiras manuais: Sangria (retirada) ou Suprimento/Reforço
   */
  static async addTransaction(
    type: 'inflow' | 'outflow',
    category: TransactionCategory,
    amount: number,
    description: string,
    paymentMethod: string = 'Dinheiro',
    operatorName: string = 'Hiago'
  ): Promise<{ success: boolean; transaction?: CashTransaction }> {
    try {
      const current = await this.getCurrent();
      const payload: any = {
        register_id: current.id || null,
        type,
        category,
        description,
        amount,
        payment_method: paymentMethod,
      };

      const { data, error } = await supabase
        .from('cash_transactions')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Erro ao salvar movimentação no Supabase:', error.message);
      }

      const createdTx: CashTransaction = data ? this.mapTransactionFromDb(data) : {
        id: `tx-${Date.now()}`,
        type,
        category,
        description,
        amount,
        paymentMethod,
        operatorName,
        createdAt: new Date().toLocaleString('pt-BR'),
      };

      return { success: true, transaction: createdTx };
    } catch (err: any) {
      return { success: false };
    }
  }

  /**
   * Alterna rapidamente abertura/fechamento
   */
  static async toggle(currentStatus: boolean): Promise<CashRegister> {
    if (currentStatus) {
      const res = await this.closeCash(300);
      return res.register;
    } else {
      return await this.openCash(300, 'Hiago');
    }
  }
}
