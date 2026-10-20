import { supabase } from '../services/supabaseClient.js';
import type {
  FinancialAccount,
  BillToPay,
  BillToReceive,
  FinancialTransaction,
  FinancialDashboardSummary,
  Sale,
  PhonePurchase,
  ServiceOrder,
} from '../types.js';

const STORAGE_KEY_ACCOUNTS = 'hiago_financial_accounts';
const STORAGE_KEY_BILLS_PAY = 'hiago_bills_to_pay';
const STORAGE_KEY_BILLS_RECEIVE = 'hiago_bills_to_receive';
const STORAGE_KEY_TRANSACTIONS = 'hiago_financial_transactions';

const INITIAL_ACCOUNTS: FinancialAccount[] = [
  {
    id: 'acc-1',
    name: 'Banco Santander - Conta Principal',
    type: 'checking',
    bankName: 'Santander',
    initialBalance: 0,
    initialBalanceDate: '2026-01-01',
    currentBalance: 0,
    status: 'active',
    notes: 'Conta de movimentação PIX e recebimento de maquininhas',
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 'acc-2',
    name: 'Gaveta do Balcão (Dinheiro Físico)',
    type: 'cash',
    bankName: 'Caixa Loja',
    initialBalance: 0,
    initialBalanceDate: '2026-01-01',
    currentBalance: 0,
    status: 'active',
    notes: 'Fundo de troco e pagamentos em espécie',
    createdAt: '2026-01-01T10:00:00Z',
  },
];

const INITIAL_BILLS_PAY: BillToPay[] = [];

const INITIAL_BILLS_RECEIVE: BillToReceive[] = [];

const INITIAL_TRANSACTIONS: FinancialTransaction[] = [];

export class FinancialRepository {
  // ACCOUNTS
  static async getAccounts(): Promise<FinancialAccount[]> {
    try {
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('*')
        .order('name');
      if (error || !data || data.length === 0) throw new Error();
      return data.map((r: any) => ({
        id: r.id,
        storeId: r.store_id,
        name: r.name,
        type: r.type,
        bankName: r.bank_name,
        initialBalance: Number(r.initial_balance || 0),
        initialBalanceDate: r.initial_balance_date || '',
        currentBalance: Number(r.current_balance || 0),
        status: r.status || 'active',
        notes: r.notes,
        createdAt: r.created_at,
      }));
    } catch {
      const saved = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
  }

  static async createAccount(account: Omit<FinancialAccount, 'id' | 'createdAt'>): Promise<FinancialAccount> {
    const newAccount: FinancialAccount = {
      ...account,
      id: `acc-${Date.now()}`,
      currentBalance: account.initialBalance,
      createdAt: new Date().toISOString(),
    };
    try {
      await supabase.from('financial_accounts').insert([{
        id: newAccount.id,
        name: newAccount.name,
        type: newAccount.type,
        bank_name: newAccount.bankName,
        initial_balance: newAccount.initialBalance,
        initial_balance_date: newAccount.initialBalanceDate,
        current_balance: newAccount.currentBalance,
        status: newAccount.status,
        notes: newAccount.notes,
      }]);
    } catch {
      // offline fallback
    }
    const accounts = await this.getAccounts();
    accounts.push(newAccount);
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    return newAccount;
  }

  static async updateAccount(id: string, updates: Partial<FinancialAccount>): Promise<FinancialAccount> {
    try {
      await supabase.from('financial_accounts').update({
        name: updates.name,
        type: updates.type,
        bank_name: updates.bankName,
        current_balance: updates.currentBalance,
        status: updates.status,
        notes: updates.notes,
      }).eq('id', id);
    } catch {
      // offline fallback
    }
    const accounts = await this.getAccounts();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], ...updates };
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
      return accounts[idx];
    }
    throw new Error('Account not found');
  }

  // BILLS TO PAY
  static async getBillsToPay(): Promise<BillToPay[]> {
    try {
      const { data, error } = await supabase
        .from('bills_to_pay')
        .select('*')
        .order('due_date', { ascending: true });
      if (error || !data || data.length === 0) throw new Error();
      return data.map((r: any) => ({
        id: r.id,
        storeId: r.store_id,
        supplierId: r.supplier_id,
        supplierName: r.supplier_name,
        category: r.category,
        description: r.description,
        originalAmount: Number(r.original_amount || 0),
        discountAmount: Number(r.discount_amount || 0),
        penaltyAmount: Number(r.penalty_amount || 0),
        interestAmount: Number(r.interest_amount || 0),
        finalAmount: Number(r.final_amount || 0),
        paidAmount: Number(r.paid_amount || 0),
        remainingAmount: Number(r.remaining_amount || 0),
        issueDate: r.issue_date,
        dueDate: r.due_date,
        paymentDate: r.payment_date,
        paymentMethod: r.payment_method,
        accountId: r.account_id,
        status: r.status,
        installmentsCount: r.installments_count || 1,
        installmentNumber: r.installment_number || 1,
        purchaseId: r.purchase_id,
        notes: r.notes,
        createdAt: r.created_at,
      }));
    } catch {
      const saved = localStorage.getItem(STORAGE_KEY_BILLS_PAY);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(STORAGE_KEY_BILLS_PAY, JSON.stringify(INITIAL_BILLS_PAY));
      return INITIAL_BILLS_PAY;
    }
  }

  static async createBillToPay(bill: Omit<BillToPay, 'id' | 'createdAt'>): Promise<BillToPay> {
    const newBill: BillToPay = {
      ...bill,
      id: `bp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      await supabase.from('bills_to_pay').insert([{
        id: newBill.id,
        supplier_id: newBill.supplierId,
        supplier_name: newBill.supplierName,
        category: newBill.category,
        description: newBill.description,
        original_amount: newBill.originalAmount,
        discount_amount: newBill.discountAmount || 0,
        penalty_amount: newBill.penaltyAmount || 0,
        interest_amount: newBill.interestAmount || 0,
        final_amount: newBill.finalAmount,
        paid_amount: newBill.paidAmount,
        remaining_amount: newBill.remainingAmount,
        issue_date: newBill.issueDate,
        due_date: newBill.dueDate,
        payment_date: newBill.paymentDate,
        payment_method: newBill.paymentMethod,
        account_id: newBill.accountId,
        status: newBill.status,
        installments_count: newBill.installmentsCount,
        installment_number: newBill.installmentNumber,
        purchase_id: newBill.purchaseId,
        notes: newBill.notes,
      }]);
    } catch {
      // offline fallback
    }
    const bills = await this.getBillsToPay();
    bills.push(newBill);
    localStorage.setItem(STORAGE_KEY_BILLS_PAY, JSON.stringify(bills));
    return newBill;
  }

  static async payBill(id: string, payment: {
    paidAmount: number;
    paymentMethod: string;
    accountId: string;
    paymentDate?: string;
    operatorName?: string;
  }): Promise<BillToPay> {
    const bills = await this.getBillsToPay();
    const bill = bills.find(b => b.id === id);
    if (!bill) throw new Error('Conta a pagar não encontrada');

    const totalPaid = Number(bill.paidAmount || 0) + Number(payment.paidAmount);
    const newRemaining = Math.max(0, Number(bill.finalAmount) - totalPaid);
    const newStatus = newRemaining <= 0.01 ? 'paid' : 'partial';

    const updatedBill: BillToPay = {
      ...bill,
      paidAmount: totalPaid,
      remainingAmount: newRemaining,
      status: newStatus,
      paymentDate: payment.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: payment.paymentMethod,
      accountId: payment.accountId,
    };

    // Atualiza saldo da conta bancária e gera lançamento
    const accounts = await this.getAccounts();
    const acc = accounts.find(a => a.id === payment.accountId);
    if (acc) {
      acc.currentBalance -= payment.paidAmount;
      await this.updateAccount(acc.id, { currentBalance: acc.currentBalance });
    }

    await this.createTransaction({
      accountId: payment.accountId,
      accountName: acc?.name || 'Conta Bancária',
      type: 'outflow',
      category: bill.category,
      amount: payment.paidAmount,
      description: `Pagamento de conta: ${bill.description} (${bill.supplierName})`,
      origin: 'bill_pay',
      referenceId: bill.id,
      operatorName: payment.operatorName || 'Operador',
      status: 'confirmed',
      date: payment.paymentDate || new Date().toISOString().split('T')[0],
    });

    const idx = bills.findIndex(b => b.id === id);
    bills[idx] = updatedBill;
    localStorage.setItem(STORAGE_KEY_BILLS_PAY, JSON.stringify(bills));

    try {
      await supabase.from('bills_to_pay').update({
        paid_amount: updatedBill.paidAmount,
        remaining_amount: updatedBill.remainingAmount,
        status: updatedBill.status,
        payment_date: updatedBill.paymentDate,
        payment_method: updatedBill.paymentMethod,
        account_id: updatedBill.accountId,
      }).eq('id', id);
    } catch {
      // offline fallback
    }

    return updatedBill;
  }

  // BILLS TO RECEIVE
  static async getBillsToReceive(): Promise<BillToReceive[]> {
    try {
      const { data, error } = await supabase
        .from('bills_to_receive')
        .select('*')
        .order('due_date', { ascending: true });
      if (error || !data || data.length === 0) throw new Error();
      return data.map((r: any) => ({
        id: r.id,
        storeId: r.store_id,
        customerId: r.customer_id,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        saleId: r.sale_id,
        saleNumber: r.sale_number,
        osId: r.os_id,
        osNumber: r.os_number,
        category: r.category,
        description: r.description,
        originalAmount: Number(r.original_amount || 0),
        receivedAmount: Number(r.received_amount || 0),
        remainingAmount: Number(r.remaining_amount || 0),
        issueDate: r.issue_date,
        dueDate: r.due_date,
        receiveDate: r.receive_date,
        paymentMethod: r.payment_method,
        accountId: r.account_id,
        status: r.status,
        installmentsCount: r.installments_count || 1,
        installmentNumber: r.installment_number || 1,
        notes: r.notes,
        createdAt: r.created_at,
      }));
    } catch {
      const saved = localStorage.getItem(STORAGE_KEY_BILLS_RECEIVE);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(STORAGE_KEY_BILLS_RECEIVE, JSON.stringify(INITIAL_BILLS_RECEIVE));
      return INITIAL_BILLS_RECEIVE;
    }
  }

  static async createBillToReceive(bill: Omit<BillToReceive, 'id' | 'createdAt'>): Promise<BillToReceive> {
    const newBill: BillToReceive = {
      ...bill,
      id: `br-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      await supabase.from('bills_to_receive').insert([{
        id: newBill.id,
        customer_id: newBill.customerId,
        customer_name: newBill.customerName,
        customer_phone: newBill.customerPhone,
        sale_id: newBill.saleId,
        sale_number: newBill.saleNumber,
        os_id: newBill.osId,
        os_number: newBill.osNumber,
        category: newBill.category,
        description: newBill.description,
        original_amount: newBill.originalAmount,
        received_amount: newBill.receivedAmount,
        remaining_amount: newBill.remainingAmount,
        issue_date: newBill.issueDate,
        due_date: newBill.dueDate,
        receive_date: newBill.receiveDate,
        payment_method: newBill.paymentMethod,
        account_id: newBill.accountId,
        status: newBill.status,
        installments_count: newBill.installmentsCount,
        installment_number: newBill.installmentNumber,
        notes: newBill.notes,
      }]);
    } catch {
      // offline fallback
    }
    const bills = await this.getBillsToReceive();
    bills.push(newBill);
    localStorage.setItem(STORAGE_KEY_BILLS_RECEIVE, JSON.stringify(bills));
    return newBill;
  }

  static async receiveBill(id: string, receive: {
    receivedAmount: number;
    paymentMethod: string;
    accountId: string;
    receiveDate?: string;
    operatorName?: string;
  }): Promise<BillToReceive> {
    const bills = await this.getBillsToReceive();
    const bill = bills.find(b => b.id === id);
    if (!bill) throw new Error('Conta a receber não encontrada');

    const totalReceived = Number(bill.receivedAmount || 0) + Number(receive.receivedAmount);
    const newRemaining = Math.max(0, Number(bill.originalAmount) - totalReceived);
    const newStatus = newRemaining <= 0.01 ? 'received' : 'partial';

    const updatedBill: BillToReceive = {
      ...bill,
      receivedAmount: totalReceived,
      remainingAmount: newRemaining,
      status: newStatus,
      receiveDate: receive.receiveDate || new Date().toISOString().split('T')[0],
      paymentMethod: receive.paymentMethod,
      accountId: receive.accountId,
    };

    // Atualiza saldo da conta financeira e gera lançamento de entrada
    const accounts = await this.getAccounts();
    const acc = accounts.find(a => a.id === receive.accountId);
    if (acc) {
      acc.currentBalance += receive.receivedAmount;
      await this.updateAccount(acc.id, { currentBalance: acc.currentBalance });
    }

    await this.createTransaction({
      accountId: receive.accountId,
      accountName: acc?.name || 'Conta Bancária',
      type: 'inflow',
      category: bill.category,
      amount: receive.receivedAmount,
      description: `Recebimento de título: ${bill.description} (${bill.customerName})`,
      origin: 'bill_receive',
      referenceId: bill.id,
      operatorName: receive.operatorName || 'Operador',
      status: 'confirmed',
      date: receive.receiveDate || new Date().toISOString().split('T')[0],
    });

    const idx = bills.findIndex(b => b.id === id);
    bills[idx] = updatedBill;
    localStorage.setItem(STORAGE_KEY_BILLS_RECEIVE, JSON.stringify(bills));

    try {
      await supabase.from('bills_to_receive').update({
        received_amount: updatedBill.receivedAmount,
        remaining_amount: updatedBill.remainingAmount,
        status: updatedBill.status,
        receive_date: updatedBill.receiveDate,
        payment_method: updatedBill.paymentMethod,
        account_id: updatedBill.accountId,
      }).eq('id', id);
    } catch {
      // offline fallback
    }

    return updatedBill;
  }

  // TRANSACTIONS
  static async getTransactions(): Promise<FinancialTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error || !data || data.length === 0) throw new Error();
      return data.map((r: any) => ({
        id: r.id,
        storeId: r.store_id,
        accountId: r.account_id,
        accountName: r.account_name || 'Conta',
        destinationAccountId: r.destination_account_id,
        type: r.type,
        category: r.category,
        amount: Number(r.amount || 0),
        description: r.description,
        origin: r.origin,
        referenceId: r.reference_id,
        operatorName: r.operator_name,
        status: r.status,
        date: r.date,
        createdAt: r.created_at,
      }));
    } catch {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
  }

  static async createTransaction(tx: Omit<FinancialTransaction, 'id' | 'createdAt'>): Promise<FinancialTransaction> {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `ft-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      await supabase.from('financial_transactions').insert([{
        id: newTx.id,
        account_id: newTx.accountId,
        destination_account_id: newTx.destinationAccountId,
        type: newTx.type,
        category: newTx.category,
        amount: newTx.amount,
        description: newTx.description,
        origin: newTx.origin,
        reference_id: newTx.referenceId,
        operator_name: newTx.operatorName,
        status: newTx.status,
        date: newTx.date,
      }]);
    } catch {
      // offline fallback
    }
    const list = await this.getTransactions();
    list.unshift(newTx);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(list));
    return newTx;
  }

  static async transferBetweenAccounts(params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
    operatorName: string;
  }): Promise<{ success: boolean }> {
    const accounts = await this.getAccounts();
    const fromAcc = accounts.find(a => a.id === params.fromAccountId);
    const toAcc = accounts.find(a => a.id === params.toAccountId);
    if (!fromAcc || !toAcc) throw new Error('Contas para transferência inválidas');

    fromAcc.currentBalance -= params.amount;
    toAcc.currentBalance += params.amount;

    await this.updateAccount(fromAcc.id, { currentBalance: fromAcc.currentBalance });
    await this.updateAccount(toAcc.id, { currentBalance: toAcc.currentBalance });

    await this.createTransaction({
      accountId: fromAcc.id,
      accountName: fromAcc.name,
      destinationAccountId: toAcc.id,
      destinationAccountName: toAcc.name,
      type: 'transfer',
      category: 'Transferência entre Contas',
      amount: params.amount,
      description: params.description || `Transferência de ${fromAcc.name} para ${toAcc.name}`,
      origin: 'transfer',
      operatorName: params.operatorName,
      status: 'confirmed',
      date: new Date().toISOString().split('T')[0],
    });

    return { success: true };
  }

  // DASHBOARD SUMMARY
  static async getDashboardSummary(): Promise<FinancialDashboardSummary> {
    const [accounts, billsPay, billsReceive, transactions] = await Promise.all([
      this.getAccounts(),
      this.getBillsToPay(),
      this.getBillsToReceive(),
      this.getTransactions(),
    ]);

    const registeredBalance = accounts.reduce((acc, a) => acc + (a.status === 'active' ? Number(a.currentBalance || 0) : 0), 0);

    const todayStr = new Date().toISOString().split('T')[0];

    let pendingToPay = 0;
    let overdueAmount = 0;
    billsPay.forEach(b => {
      if (b.status === 'pending' || b.status === 'partial') {
        pendingToPay += Number(b.remainingAmount || 0);
        if (b.dueDate < todayStr) overdueAmount += Number(b.remainingAmount || 0);
      }
    });

    let pendingToReceive = 0;
    billsReceive.forEach(b => {
      if (b.status === 'pending' || b.status === 'partial') {
        pendingToReceive += Number(b.remainingAmount || 0);
        if (b.dueDate < todayStr) overdueAmount += Number(b.remainingAmount || 0);
      }
    });

    const projectedBalance = registeredBalance + pendingToReceive - pendingToPay;

    let todayInflow = 0;
    let todayOutflow = 0;
    let periodInflow = 0;
    let periodOutflow = 0;

    transactions.forEach(t => {
      if (t.status === 'confirmed') {
        if (t.type === 'inflow') {
          periodInflow += t.amount;
          if (t.date === todayStr) todayInflow += t.amount;
        } else if (t.type === 'outflow') {
          periodOutflow += t.amount;
          if (t.date === todayStr) todayOutflow += t.amount;
        }
      }
    });

    return {
      registeredBalance,
      pendingToPay,
      pendingToReceive,
      projectedBalance,
      overdueAmount,
      todayInflow,
      todayOutflow,
      periodInflow,
      periodOutflow,
      periodResult: periodInflow - periodOutflow,
    };
  }

  // INTEGRAÇÕES REALIZADAS: VENDAS, COMPRAS, ASSISTÊNCIA
  static async syncFromSale(sale: Sale): Promise<void> {
    const accounts = await this.getAccounts();
    const primaryAcc = accounts[0] || INITIAL_ACCOUNTS[0];

    const isInstallment = (sale.installments || 1) > 1;

    if (isInstallment) {
      // Venda parcelada gera recebíveis divididos pelas parcelas
      const installmentsCount = sale.installments || 1;
      const installmentValue = Number((sale.total / installmentsCount).toFixed(2));

      for (let i = 1; i <= installmentsCount; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        const dueStr = dueDate.toISOString().split('T')[0];

        await this.createBillToReceive({
          customerName: sale.customerName,
          customerPhone: sale.customerPhone,
          saleId: sale.id,
          saleNumber: sale.saleNumber,
          category: 'Venda Aparelho',
          description: `Venda ${sale.saleNumber} - Parcela ${i}/${installmentsCount}`,
          originalAmount: installmentValue,
          receivedAmount: 0,
          remainingAmount: installmentValue,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: dueStr,
          status: 'pending',
          installmentsCount,
          installmentNumber: i,
          accountId: primaryAcc.id,
        });
      }
    } else {
      // À vista: entrada imediata na conta
      await this.createTransaction({
        accountId: primaryAcc.id,
        accountName: primaryAcc.name,
        type: 'inflow',
        category: 'Venda Balcão',
        amount: sale.total,
        description: `Venda à vista ${sale.saleNumber} (${sale.customerName})`,
        origin: 'sale',
        referenceId: sale.saleNumber,
        operatorName: sale.sellerName,
        status: 'confirmed',
        date: new Date().toISOString().split('T')[0],
      });

      primaryAcc.currentBalance += sale.total;
      await this.updateAccount(primaryAcc.id, { currentBalance: primaryAcc.currentBalance });
    }
  }

  static async syncFromPurchase(purchase: PhonePurchase): Promise<void> {
    const isPaid = purchase.paymentStatus === 'paid';
    const accounts = await this.getAccounts();
    const primaryAcc = accounts[0] || INITIAL_ACCOUNTS[0];

    if (isPaid) {
      await this.createTransaction({
        accountId: primaryAcc.id,
        accountName: primaryAcc.name,
        type: 'outflow',
        category: 'Compra de Usados / Trade-in',
        amount: purchase.totalAmount,
        description: `Compra de Aparelho ${purchase.purchaseNumber} (${purchase.customer})`,
        origin: 'purchase',
        referenceId: purchase.purchaseNumber,
        operatorName: purchase.seller,
        status: 'confirmed',
        date: new Date().toISOString().split('T')[0],
      });

      primaryAcc.currentBalance -= purchase.totalAmount;
      await this.updateAccount(primaryAcc.id, { currentBalance: primaryAcc.currentBalance });
    } else {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      await this.createBillToPay({
        supplierName: purchase.customer,
        category: 'Compra de Aparelhos',
        description: `Compra ${purchase.purchaseNumber} - ${purchase.items.map(i => i.model).join(', ')}`,
        originalAmount: purchase.totalAmount,
        finalAmount: purchase.totalAmount,
        paidAmount: 0,
        remainingAmount: purchase.totalAmount,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        installmentsCount: 1,
        installmentNumber: 1,
        purchaseId: purchase.id,
      });
    }
  }

  static async syncFromOSDelivery(os: ServiceOrder): Promise<void> {
    const value = os.finalValue || os.estimatedValue || 0;
    if (value <= 0) return;

    const accounts = await this.getAccounts();
    const primaryAcc = accounts[0] || INITIAL_ACCOUNTS[0];

    if (os.paymentStatus === 'paid') {
      await this.createTransaction({
        accountId: primaryAcc.id,
        accountName: primaryAcc.name,
        type: 'inflow',
        category: 'Assistência Técnica',
        amount: value,
        description: `Serviço Concluído & Entregue - OS ${os.osNumber} (${os.deviceModel})`,
        origin: 'os',
        referenceId: os.osNumber,
        operatorName: os.technician || 'Técnico',
        status: 'confirmed',
        date: new Date().toISOString().split('T')[0],
      });

      primaryAcc.currentBalance += value;
      await this.updateAccount(primaryAcc.id, { currentBalance: primaryAcc.currentBalance });
    } else {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 10);

      await this.createBillToReceive({
        customerName: os.customerName,
        customerPhone: os.customerPhone,
        osId: os.id,
        osNumber: os.osNumber,
        category: 'Assistência Técnica',
        description: `OS ${os.osNumber} - ${os.deviceModel} (${os.serviceExecuted || os.reportedIssue})`,
        originalAmount: value,
        receivedAmount: 0,
        remainingAmount: value,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        installmentsCount: 1,
        installmentNumber: 1,
        accountId: primaryAcc.id,
      });
    }
  }
}
