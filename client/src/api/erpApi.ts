import type { 
  Device, 
  Sale, 
  ServiceOrder, 
  CashRegister, 
  Customer, 
  AfterSalesTrigger, 
  TransactionCategory,
  TechnicalService,
  WarrantyEntry,
  WarrantyClaim,
  OSStatus,
  OSQuoteServiceItem,
  OSQuotePartItem,
  OSClientApproval
} from '../types.js';
import { 
  INITIAL_DEVICES, 
  INITIAL_SALES, 
  INITIAL_SERVICE_ORDERS, 
  INITIAL_CASH,
  INITIAL_CUSTOMERS,
  INITIAL_AFTER_SALES_TRIGGERS
} from '../data/erpData.js';
import { DeviceRepository } from '../repositories/deviceRepository.js';
import { SaleRepository } from '../repositories/saleRepository.js';
import { ServiceOrderRepository } from '../repositories/serviceOrderRepository.js';
import { TechnicalServiceRepository } from '../repositories/serviceRepository.js';
import { WarrantyRepository } from '../repositories/warrantyRepository.js';
import { CashRepository } from '../repositories/cashRepository.js';
import { CustomerRepository } from '../repositories/customerRepository.js';
import { AfterSalesRepository } from '../repositories/afterSalesRepository.js';
import { checkSupabaseHealth, isSupabaseConfigured } from '../services/supabaseClient.js';

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'real';
const USE_SUPABASE = DATA_SOURCE === 'real' && isSupabaseConfigured;

// 1. APARELHOS / ESTOQUE
export async function fetchDevices(): Promise<Device[]> {
  if (USE_SUPABASE) {
    try {
      const devices = await DeviceRepository.getAll();
      if (devices) return devices;
    } catch (err) {
      console.warn('Falha no DeviceRepository, caindo para fallback:', err);
    }
  }
  return INITIAL_DEVICES;
}

export async function createDeviceApi(device: Device): Promise<Device> {
  if (USE_SUPABASE) {
    try {
      const res = await DeviceRepository.create(device);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('Falha ao cadastrar no Supabase, mantendo local:', err);
    }
  }
  return device;
}

export async function reserveDeviceForCheckoutApi(imei: string, sellerName: string): Promise<{ success: boolean; message: string }> {
  if (USE_SUPABASE) {
    return await DeviceRepository.reserveDeviceForCheckout(imei, sellerName);
  }
  return { success: true, message: 'Reserva local concedida' };
}

// 2. VENDAS (PDV)
export async function fetchSales(): Promise<Sale[]> {
  if (USE_SUPABASE) {
    try {
      const sales = await SaleRepository.getAll();
      if (sales) return sales;
    } catch (err) {
      console.warn('Falha no SaleRepository, caindo para fallback:', err);
    }
  }
  return INITIAL_SALES;
}

export async function createSaleApi(sale: any): Promise<Sale> {
  if (USE_SUPABASE) {
    try {
      const res = await SaleRepository.create(sale);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('Falha ao registrar venda no Supabase, mantendo local:', err);
    }
  }
  return sale;
}

export async function cancelSaleApi(sale: Sale, reason: string, cancelledBy?: string): Promise<{ success: boolean; message: string }> {
  if (USE_SUPABASE) {
    return await SaleRepository.cancelSale(sale, reason, cancelledBy);
  }
  return { success: true, message: `Venda ${sale.saleNumber} cancelada localmente` };
}

// 3. ORDENS DE SERVIÇO (ASSISTÊNCIA TÉCNICA)
export async function fetchServiceOrders(): Promise<ServiceOrder[]> {
  try {
    return await ServiceOrderRepository.getAll();
  } catch (err) {
    console.warn('Falha no ServiceOrderRepository, caindo para fallback:', err);
    return INITIAL_SERVICE_ORDERS;
  }
}

export async function createServiceOrderApi(os: ServiceOrder): Promise<ServiceOrder> {
  try {
    const res = await ServiceOrderRepository.create(os);
    if (res.data) return res.data;
  } catch (err) {
    console.warn('Falha ao registrar O.S. no Supabase, mantendo local:', err);
  }
  return os;
}

export async function updateServiceOrderStatusApi(
  id: string, 
  status: OSStatus, 
  notes?: string,
  operatorName?: string,
  extraData?: Partial<ServiceOrder>
): Promise<{ success: boolean; error?: string }> {
  return await ServiceOrderRepository.updateStatus(id, status, notes, operatorName, extraData);
}

export async function updateServiceOrderQuoteApi(
  id: string,
  services: OSQuoteServiceItem[],
  parts: OSQuotePartItem[],
  discount: number = 0,
  operatorName?: string
): Promise<boolean> {
  return await ServiceOrderRepository.updateQuote(id, services, parts, discount, operatorName);
}

export async function recordServiceOrderApprovalApi(
  id: string,
  approval: OSClientApproval,
  operatorName?: string
): Promise<boolean> {
  return await ServiceOrderRepository.recordApproval(id, approval, operatorName);
}

// 3.1. CATÁLOGO DE SERVIÇOS TÉCNICOS
export async function fetchTechnicalServices(): Promise<TechnicalService[]> {
  return await TechnicalServiceRepository.getAll();
}

export async function createTechnicalServiceApi(service: Omit<TechnicalService, 'id' | 'createdAt'>) {
  return await TechnicalServiceRepository.create(service);
}

export async function updateTechnicalServiceApi(id: string, updates: Partial<TechnicalService>) {
  return await TechnicalServiceRepository.update(id, updates);
}

export async function deleteTechnicalServiceApi(id: string) {
  return await TechnicalServiceRepository.delete(id);
}

// 3.2. GESTÃO DE GARANTIAS & RETORNOS
export async function fetchWarranties(): Promise<WarrantyEntry[]> {
  return await WarrantyRepository.getAll();
}

export async function createWarrantyApi(warranty: Omit<WarrantyEntry, 'id' | 'createdAt'>) {
  return await WarrantyRepository.create(warranty);
}

export async function updateWarrantyApi(id: string, updates: Partial<WarrantyEntry>) {
  return await WarrantyRepository.update(id, updates);
}

export async function fetchWarrantyClaims(): Promise<WarrantyClaim[]> {
  return await WarrantyRepository.getClaims();
}

export async function createWarrantyClaimApi(claim: Omit<WarrantyClaim, 'id' | 'createdAt'>) {
  return await WarrantyRepository.createClaim(claim);
}

export async function updateWarrantyClaimApi(id: string, updates: Partial<WarrantyClaim>) {
  return await WarrantyRepository.updateClaim(id, updates);
}

// 4. CAIXA & FLUXO DE CAIXA
export async function fetchCashRegister(): Promise<CashRegister> {
  if (USE_SUPABASE) {
    try {
      const cash = await CashRepository.getCurrent();
      if (cash) return cash;
    } catch (err) {
      console.warn('Falha no CashRepository, caindo para fallback:', err);
    }
  }
  return INITIAL_CASH;
}

export async function openCashRegisterApi(initialFloat: number = 300, operatorName?: string): Promise<CashRegister> {
  if (USE_SUPABASE) {
    return await CashRepository.openCash(initialFloat, operatorName);
  }
  return {
    ...INITIAL_CASH,
    isOpen: true,
    initialFloat,
    openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export async function closeCashRegisterApi(cashCounted: number, notes?: string) {
  if (USE_SUPABASE) {
    return await CashRepository.closeCash(cashCounted, notes);
  }
  return {
    success: true,
    expectedCash: 300,
    difference: 0,
    register: { ...INITIAL_CASH, isOpen: false },
  };
}

export async function addCashTransactionApi(
  type: 'inflow' | 'outflow',
  category: TransactionCategory,
  amount: number,
  description: string,
  paymentMethod: string = 'Dinheiro',
  operatorName: string = 'Hiago'
) {
  if (USE_SUPABASE) {
    return await CashRepository.addTransaction(type, category, amount, description, paymentMethod, operatorName);
  }
  return { success: true };
}

export async function toggleCashApi(currentStatus: boolean = true): Promise<CashRegister> {
  if (USE_SUPABASE) {
    try {
      return await CashRepository.toggle(currentStatus);
    } catch (err) {
      console.warn('Falha ao alternar caixa no Supabase, mantendo local:', err);
    }
  }
  return {
    ...INITIAL_CASH,
    isOpen: !currentStatus,
    openedAt: !currentStatus ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
  };
}

// 5. CLIENTES (BASE & CICLO DE VIDA)
export async function fetchCustomers(): Promise<Customer[]> {
  if (USE_SUPABASE) {
    try {
      const customers = await CustomerRepository.getAll();
      if (customers) return customers;
    } catch (err) {
      console.warn('Falha no CustomerRepository, usando fallback:', err);
    }
  }
  return INITIAL_CUSTOMERS;
}

export async function createCustomerApi(customer: Customer): Promise<Customer> {
  if (USE_SUPABASE) {
    try {
      const res = await CustomerRepository.create(customer);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('Falha ao salvar cliente no Supabase:', err);
    }
  }
  return customer;
}

// 6. CENTRAL DE PÓS-VENDA PREDITIVO
export async function fetchAfterSalesTriggers(): Promise<AfterSalesTrigger[]> {
  if (USE_SUPABASE) {
    try {
      const triggers = await AfterSalesRepository.getAll();
      if (triggers) return triggers;
    } catch (err) {
      console.warn('Falha no AfterSalesRepository:', err);
    }
  }
  return INITIAL_AFTER_SALES_TRIGGERS;
}

export async function updateAfterSalesStatusApi(id: string, status: 'sent' | 'converted'): Promise<boolean> {
  if (USE_SUPABASE) {
    return await AfterSalesRepository.updateStatus(id, status);
  }
  return true;
}

// 7. FORNECEDORES
export async function fetchSuppliers(): Promise<import('../types.js').Supplier[]> {
  const { SupplierRepository } = await import('../repositories/supplierRepository.js');
  return await SupplierRepository.getAll();
}

export async function createSupplierApi(supplier: Omit<import('../types.js').Supplier, 'id' | 'createdAt'>) {
  const { SupplierRepository } = await import('../repositories/supplierRepository.js');
  return await SupplierRepository.create(supplier);
}

export async function updateSupplierApi(id: string, updates: Partial<import('../types.js').Supplier>) {
  const { SupplierRepository } = await import('../repositories/supplierRepository.js');
  return await SupplierRepository.update(id, updates);
}

export async function deleteSupplierApi(id: string) {
  const { SupplierRepository } = await import('../repositories/supplierRepository.js');
  return await SupplierRepository.delete(id);
}

// 8. PRODUTOS & ACESSÓRIOS
export async function fetchProducts(): Promise<import('../types.js').Product[]> {
  const { ProductRepository } = await import('../repositories/productRepository.js');
  return await ProductRepository.getAll();
}

export async function createProductApi(product: Omit<import('../types.js').Product, 'id' | 'createdAt'>) {
  const { ProductRepository } = await import('../repositories/productRepository.js');
  return await ProductRepository.create(product);
}

export async function updateProductApi(id: string, updates: Partial<import('../types.js').Product>) {
  const { ProductRepository } = await import('../repositories/productRepository.js');
  return await ProductRepository.update(id, updates);
}

export async function adjustProductStockApi(id: string, deltaQuantity: number, reason: string, operatorName?: string) {
  const { ProductRepository } = await import('../repositories/productRepository.js');
  return await ProductRepository.adjustStock(id, deltaQuantity, reason, operatorName);
}

export async function deleteProductApi(id: string) {
  const { ProductRepository } = await import('../repositories/productRepository.js');
  return await ProductRepository.delete(id);
}

// 9. PEÇAS DE REPARO & BANCADA
export async function fetchParts(): Promise<import('../types.js').Part[]> {
  const { PartRepository } = await import('../repositories/partRepository.js');
  return await PartRepository.getAll();
}

export async function createPartApi(part: Omit<import('../types.js').Part, 'id' | 'createdAt'>) {
  const { PartRepository } = await import('../repositories/partRepository.js');
  return await PartRepository.create(part);
}

export async function updatePartApi(id: string, updates: Partial<import('../types.js').Part>) {
  const { PartRepository } = await import('../repositories/partRepository.js');
  return await PartRepository.update(id, updates);
}

export async function adjustPartStockApi(id: string, deltaQuantity: number, reason: string, operatorName?: string) {
  const { PartRepository } = await import('../repositories/partRepository.js');
  return await PartRepository.adjustStock(id, deltaQuantity, reason, operatorName);
}

export async function deletePartApi(id: string) {
  const { PartRepository } = await import('../repositories/partRepository.js');
  return await PartRepository.delete(id);
}

// 10. COMPRAS DE TELEFONE
export async function fetchPhonePurchases(): Promise<import('../types.js').PhonePurchase[]> {
  const { PurchaseRepository } = await import('../repositories/purchaseRepository.js');
  return await PurchaseRepository.getAll();
}

export async function createPhonePurchaseApi(purchase: Omit<import('../types.js').PhonePurchase, 'id' | 'createdAt'>) {
  const { PurchaseRepository } = await import('../repositories/purchaseRepository.js');
  return await PurchaseRepository.create(purchase);
}

export async function confirmPhonePurchaseApi(id: string) {
  const { PurchaseRepository } = await import('../repositories/purchaseRepository.js');
  return await PurchaseRepository.confirmPurchase(id);
}

// 11. MOVIMENTAÇÕES DE ESTOQUE
export async function fetchInventoryMovements(): Promise<import('../types.js').InventoryMovement[]> {
  const { MovementRepository } = await import('../repositories/movementRepository.js');
  return await MovementRepository.getAll();
}

export async function recordInventoryMovementApi(movement: Omit<import('../types.js').InventoryMovement, 'id' | 'createdAt'>) {
  const { MovementRepository } = await import('../repositories/movementRepository.js');
  return await MovementRepository.record(movement);
}

// 12. ATUALIZAÇÃO E EXCLUSÃO DE APARELHO
export async function updateDeviceApi(imei: string, updates: Partial<Device>) {
  return await DeviceRepository.update(imei, updates);
}

export async function deleteDeviceApi(imei: string) {
  return await DeviceRepository.delete(imei);
}

// 13. STATUS DA CONEXÃO DO SUPABASE
export async function getDatabaseConnectionHealth() {
  return await checkSupabaseHealth();
}

// 14. MÉTRICAS CONSOLIDADAS DO DASHBOARD
export async function fetchDashboardMetrics(_period: string = 'month'): Promise<any> {
  return null;
}

// ========================================================
// 15. MÓDULO GESTÃO: FINANCEIRO, USUÁRIOS, COMISSÕES, PONTO, CONFIGURAÇÕES
// ========================================================

// FINANCEIRO
export async function fetchFinancialAccounts() {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.getAccounts();
}

export async function createFinancialAccountApi(account: any) {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.createAccount(account);
}

export async function updateFinancialAccountApi(id: string, updates: any) {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.updateAccount(id, updates);
}

export async function fetchBillsToPay() {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.getBillsToPay();
}

export async function createBillToPayApi(bill: any) {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.createBillToPay(bill);
}

export async function payBillApi(id: string, payment: any) {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.payBill(id, payment);
}

export async function fetchBillsToReceive() {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.getBillsToReceive();
}

export async function createBillToReceiveApi(bill: any) {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.createBillToReceive(bill);
}

export async function receiveBillApi(id: string, receive: any) {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.receiveBill(id, receive);
}

export async function fetchFinancialTransactions() {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.getTransactions();
}

export async function createFinancialTransactionApi(tx: any) {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.createTransaction(tx);
}

export async function transferBetweenAccountsApi(params: any) {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.transferBetweenAccounts(params);
}

export async function fetchFinancialDashboardSummary() {
  const { FinancialRepository } = await import('../repositories/financialRepository.js');
  return await FinancialRepository.getDashboardSummary();
}

// USUÁRIOS E PERMISSÕES
export async function fetchAppUsers() {
  const { UserRepository } = await import('../repositories/userRepository.js');
  return await UserRepository.getUsers();
}

export async function fetchCurrentUser() {
  const { UserRepository } = await import('../repositories/userRepository.js');
  return await UserRepository.getCurrentUser();
}

export async function createAppUserApi(userData: any) {
  const { UserRepository } = await import('../repositories/userRepository.js');
  return await UserRepository.createUser(userData);
}

export async function updateAppUserApi(id: string, updates: any) {
  const { UserRepository } = await import('../repositories/userRepository.js');
  return await UserRepository.updateUser(id, updates);
}

export async function updateUserPinApi(id: string, pin: string) {
  const { UserRepository } = await import('../repositories/userRepository.js');
  return await UserRepository.updateUserPin(id, pin);
}

export async function updateUserPermissionsApi(id: string, permissions: any) {
  const { UserRepository } = await import('../repositories/userRepository.js');
  return await UserRepository.updateUserPermissions(id, permissions);
}

// COMISSÕES
export async function fetchCommissionRules() {
  const { CommissionRepository } = await import('../repositories/commissionRepository.js');
  return await CommissionRepository.getRules();
}

export async function saveCommissionRuleApi(rule: any) {
  const { CommissionRepository } = await import('../repositories/commissionRepository.js');
  return await CommissionRepository.saveRule(rule);
}

export async function calculateCommissionsApi(sales: any[], startDate: string, endDate: string) {
  const { CommissionRepository } = await import('../repositories/commissionRepository.js');
  return await CommissionRepository.calculateCommissions(sales, startDate, endDate);
}

export async function payCommissionApi(params: any) {
  const { CommissionRepository } = await import('../repositories/commissionRepository.js');
  return await CommissionRepository.payCommission(params);
}

// PONTO ELETRÔNICO
export async function fetchTimecardRecords(userId?: string, monthYear?: string) {
  const { TimecardRepository } = await import('../repositories/timecardRepository.js');
  return await TimecardRepository.getRecords(userId, monthYear);
}

export async function punchTimecardApi(userId: string, userName: string, type: any, coords?: any) {
  const { TimecardRepository } = await import('../repositories/timecardRepository.js');
  return await TimecardRepository.punchTimecard(userId, userName, type, coords);
}

export async function fetchNextAllowedPunch(userId: string) {
  const { TimecardRepository } = await import('../repositories/timecardRepository.js');
  return await TimecardRepository.getNextAllowedPunch(userId);
}

export async function fetchTimecardMonthlyMirror(userId: string, yearMonth: string) {
  const { TimecardRepository } = await import('../repositories/timecardRepository.js');
  return await TimecardRepository.getMonthlyMirror(userId, yearMonth);
}

export async function createTimecardAdjustmentApi(adjustment: any) {
  const { TimecardRepository } = await import('../repositories/timecardRepository.js');
  return await TimecardRepository.createAdjustment(adjustment);
}

export async function fetchStoreLocationConfig() {
  const { TimecardRepository } = await import('../repositories/timecardRepository.js');
  return await TimecardRepository.getLocationConfig();
}

export async function saveStoreLocationConfigApi(config: any) {
  const { TimecardRepository } = await import('../repositories/timecardRepository.js');
  return await TimecardRepository.saveLocationConfig(config);
}

// CONFIGURAÇÕES DA LOJA
export async function fetchStoreSettings() {
  const { StoreSettingsRepository } = await import('../repositories/storeSettingsRepository.js');
  return await StoreSettingsRepository.getSettings();
}

export async function updateStoreSettingsApi(updates: any) {
  const { StoreSettingsRepository } = await import('../repositories/storeSettingsRepository.js');
  return await StoreSettingsRepository.updateSettings(updates);
}

// ----------------------------------------------------
// CRM KANBAN E PROSPECÇÃO COMERCIAL (RM SAAS HARNESS)
// ----------------------------------------------------

export async function fetchLeadsApi(filters?: any) {
  const { LeadRepository } = await import('../repositories/leadRepository.js');
  return await LeadRepository.getLeads(filters);
}

export async function fetchLeadByIdApi(id: string) {
  const { LeadRepository } = await import('../repositories/leadRepository.js');
  return await LeadRepository.getLeadById(id);
}

export async function createLeadApi(data: any) {
  const { LeadRepository } = await import('../repositories/leadRepository.js');
  return await LeadRepository.createLead(data);
}

export async function updateLeadApi(id: string, updates: any) {
  const { LeadRepository } = await import('../repositories/leadRepository.js');
  return await LeadRepository.updateLead(id, updates);
}

export async function moveLeadStageApi(id: string, newStage: any, authorName?: string, reason?: string) {
  const { LeadRepository } = await import('../repositories/leadRepository.js');
  return await LeadRepository.moveLeadStage(id, newStage, authorName, reason);
}

export async function addLeadActivityApi(leadId: string, activity: any) {
  const { LeadRepository } = await import('../repositories/leadRepository.js');
  return await LeadRepository.addActivity(leadId, activity);
}

export async function addLeadTaskApi(leadId: string, task: any) {
  const { LeadRepository } = await import('../repositories/leadRepository.js');
  return await LeadRepository.addTask(leadId, task);
}

export async function toggleLeadTaskApi(leadId: string, taskId: string) {
  const { LeadRepository } = await import('../repositories/leadRepository.js');
  return await LeadRepository.toggleTask(leadId, taskId);
}

export async function checkLeadDuplicatesApi(phone: string, email?: string, excludeLeadId?: string) {
  const { LeadRepository } = await import('../repositories/leadRepository.js');
  return await LeadRepository.checkDuplicates(phone, email, excludeLeadId);
}

export async function fetchCommercialSummaryApi(leads: any[]) {
  const { LeadRepository } = await import('../repositories/leadRepository.js');
  return LeadRepository.getCommercialSummary(leads);
}

export async function fetchAIRecommendationsApi(leads: any[]) {
  const { LeadRepository } = await import('../repositories/leadRepository.js');
  return LeadRepository.getAIRecommendations(leads);
}

