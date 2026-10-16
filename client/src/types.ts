export type DeviceCondition = 'new_sealed' | 'certified_pre_owned';

export type DeviceStatus = 
  | 'available' 
  | 'reserved' 
  | 'showcase' 
  | 'sold' 
  | 'warranty' 
  | 'in_technical_service' 
  | 'returned_to_supplier';

export interface Device {
  id: string;
  imei?: string;
  serialNumber?: string;
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: DeviceCondition;
  batteryHealth?: number; // Para seminovos
  purchasePrice: number;
  sellPrice: number;
  supplier: string;
  status: DeviceStatus;
  location?: string; // Gaveta 1, Vitrine Central, Bancada
  purchaseId?: string;
  internalCode?: string;
  isShowcasePublic?: boolean;
  isShowcaseFeatured?: boolean;
  notes?: string;
  createdAt: string;
}

export interface Accessory {
  id: string;
  name: string;
  category: 'Capa' | 'Película' | 'Carregador' | 'Fone' | 'Outros';
  stock: number;
  costPrice: number;
  sellPrice: number;
}

export type OSLifecycleStatus = 
  | 'aberta' 
  | 'aguardando_diagnostico' 
  | 'em_diagnostico' 
  | 'aguardando_orcamento' 
  | 'aguardando_aprovacao' 
  | 'aprovada' 
  | 'reprovada' 
  | 'aguardando_pecas' 
  | 'em_reparo' 
  | 'em_testes' 
  | 'pronta' 
  | 'entregue' 
  | 'cancelada';

export type OSStatus = 
  | 'received' 
  | 'diagnosing' 
  | 'waiting_parts' 
  | 'ready' 
  | 'delivered'
  | OSLifecycleStatus;

export interface OSQuoteServiceItem {
  id: string;
  serviceId?: string;
  name: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
  estimatedMinutes?: number;
  warrantyDays?: number;
}

export interface OSQuotePartItem {
  id: string;
  partId?: string;
  name: string;
  code?: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  subtotal: number;
  reserved?: boolean;
  consumed?: boolean;
}

export interface OSChecklistItem {
  item: string;
  status: 'ok' | 'issue' | 'na' | 'untested';
  notes?: string;
}

export interface OSStatusHistoryEntry {
  id: string;
  fromStatus?: string;
  toStatus: string;
  changedAt: string;
  changedBy: string;
  notes?: string;
}

export interface OSClientApproval {
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  approvedByCustomerName?: string;
  channel?: 'presencial' | 'whatsapp' | 'telefone' | 'outro';
  valueApproved?: number;
  notes?: string;
  registeredBy?: string;
}

export interface ServiceOrder {
  id: string;
  osNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerCpf?: string;
  deviceType?: string; // Smartphone, Tablet, Smartwatch, Notebook
  brand?: string;
  deviceModel: string;
  imei?: string;
  imei2?: string;
  serialNumber?: string;
  color?: string;
  deviceOwnerType?: 'customer' | 'store_stock';
  stockDeviceId?: string;
  physicalCondition?: string;
  reportedIssue: string;
  accessoriesReceived?: string;
  checklistCount: number;
  checklistItems?: OSChecklistItem[];
  technician: string;
  status: OSStatus;
  statusHistory?: OSStatusHistoryEntry[];
  technicalDiagnosis?: string;
  serviceExecuted?: string;
  quoteServices?: OSQuoteServiceItem[];
  quoteParts?: OSQuotePartItem[];
  subtotalServices?: number;
  subtotalParts?: number;
  discount?: number;
  estimatedValue: number;
  finalValue?: number;
  clientApproval?: OSClientApproval;
  partsConsumed?: boolean;
  finalTestsSummary?: string;
  deliveryNotes?: string;
  deliveredTo?: string;
  deliveredBy?: string;
  paymentMethod?: string;
  paymentStatus?: 'paid' | 'pending' | 'partial';
  entryDate: string;
  estimatedDeliveryDate?: string;
  readyDate?: string;
  deliveredDate?: string;
  warrantyDays?: number;
  warrantyId?: string;
  internalNotes?: string;
  createdAt?: string;
}

export interface TechnicalService {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  compatibleDevices?: string[];
  compatibleModels?: string[];
  defaultPrice: number;
  estimatedCost?: number;
  estimatedMinutes?: number;
  defaultWarrantyDays: number;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export type WarrantyType = 'service' | 'part' | 'supplier' | 'commercial' | 'legal';
export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired' | 'claimed' | 'voided';

export interface WarrantyEntry {
  id: string;
  warrantyNumber: string;
  osId?: string;
  osNumber?: string;
  saleId?: string;
  saleNumber?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  imei?: string;
  serialNumber?: string;
  warrantyType: WarrantyType;
  serviceName?: string;
  partsCovered?: string[];
  startDate: string;
  endDate: string;
  warrantyDays: number;
  status: WarrantyStatus;
  terms?: string;
  notes?: string;
  registeredBy?: string;
  createdAt: string;
}

export type WarrantyClaimDecision = 'analyzing' | 'approved' | 'rejected' | 'in_repair' | 'resolved' | 'closed';

export interface WarrantyClaim {
  id: string;
  claimNumber: string;
  warrantyId: string;
  warrantyNumber: string;
  originalOsNumber?: string;
  newOsNumber?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  imei?: string;
  reportedDefect: string;
  entryCondition?: string;
  technicalAssessment?: string;
  decision: WarrantyClaimDecision;
  decisionReason?: string;
  isCovered: boolean;
  resolutionDate?: string;
  createdBy?: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  type: 'device' | 'accessory' | 'service';
  name: string;
  price: number;
  quantity: number;
  imei?: string;
}

export interface TradeInEntry {
  model: string;
  imei?: string;
  batteryHealth?: number;
  evaluatedValue: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  sellerName: string;
  date: string;
  items: SaleItem[];
  tradeIn?: TradeInEntry;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  installments?: number;
  status?: 'completed' | 'cancelled';
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
}

export type TransactionCategory = 'sale' | 'sangria' | 'reforco' | 'trade_in' | 'estorno' | 'despesa';

export interface CashTransaction {
  id: string;
  registerId?: string;
  type: 'inflow' | 'outflow';
  category: TransactionCategory;
  description: string;
  amount: number;
  paymentMethod?: string;
  saleId?: string;
  operatorName?: string;
  createdAt: string;
}

export interface CashRegister {
  id?: string;
  isOpen: boolean;
  operatorName?: string;
  openedAt?: string;
  closedAt?: string;
  initialFloat: number;
  totalSales: number;
  closingCashCounted?: number;
  closingDifference?: number;
  breakdown: {
    money: number;
    pix: number;
    creditCard: number;
    debitCard: number;
    tradeIn: number;
    other: number;
  };
  transactions?: CashTransaction[];
}

export interface CustomerDevice {
  model: string;
  imei?: string;
  purchaseDate: string;
  batteryHealth?: number;
  value: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
  email?: string;
  purchasedDevices: CustomerDevice[];
  totalSpent: number;
  lastPurchaseDate: string;
  notes?: string;
  birthday?: string;
}

export interface AfterSalesTrigger {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  type: 'birthday' | 'upgrade_d360' | 'checkup_d180' | 'accessory_d15' | 'referral';
  title: string;
  description: string;
  discountOffered?: string;
  suggestedMessage: string;
  status: 'pending' | 'sent' | 'converted';
  date: string;
}

export type PurchaseSituation = 'todas' | 'draft' | 'confirmed' | 'cancelled';

export interface PhonePurchaseItem {
  id?: string;
  model: string;
  storage: string;
  color: string;
  imei: string;
  serialNumber?: string;
  condition: DeviceCondition;
  batteryHealth?: number;
  costPrice: number;
  sellPrice: number;
}

export interface PhonePurchase {
  id: string;
  purchaseNumber: string;
  date: string;
  supplierId?: string;
  customer: string; // Vendedor / Origem
  cpf?: string;
  phone?: string;
  address?: string;
  seller: string; // Operador da loja que comprou
  items: PhonePurchaseItem[];
  subtotal: number;
  additionalExpenses: number;
  discounts: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'partial';
  status: 'draft' | 'confirmed' | 'cancelled';
  notes?: string;
  hasContract?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  brand: string;
  category: string;
  description?: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  currentStock: number;
  minStock: number;
  reservedStock: number;
  supplierId?: string;
  supplierName?: string;
  location?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Part {
  id: string;
  name: string;
  code: string;
  sku?: string;
  category: 'Display' | 'Bateria' | 'Conector' | 'Câmera' | 'Carcaça' | 'Flex' | 'Outros';
  manufacturer: string;
  compatibleModels: string[];
  currentStock: number;
  minStock: number;
  reservedStock: number;
  costPrice: number;
  sellPrice: number;
  supplierId?: string;
  supplierName?: string;
  location?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Supplier {
  id: string;
  type: 'pj' | 'pf';
  name: string;
  tradeName?: string;
  document: string; // CNPJ ou CPF
  phone: string;
  email?: string;
  city?: string;
  contactPerson?: string;
  categories: string[];
  paymentTerms?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  itemType: 'device' | 'product' | 'part';
  itemId: string;
  itemName: string;
  movementType: 
    | 'inflow_purchase' 
    | 'outflow_sale' 
    | 'adjustment' 
    | 'devolution' 
    | 'reserve' 
    | 'transfer_location' 
    | 'os_consumption';
  quantity: number;
  previousStock?: number;
  newStock?: number;
  unitCost?: number;
  reason: string;
  referenceId?: string;
  operatorName: string;
  createdAt: string;
}

// ==========================================
// MÓDULO GESTÃO: FINANCEIRO, USUÁRIOS, COMISSÕES, PONTO, CONFIGURAÇÕES, RELATÓRIOS
// ==========================================

export type FinancialAccountType = 'checking' | 'cash' | 'savings' | 'digital_wallet' | 'card_settlement';

export interface FinancialAccount {
  id: string;
  storeId?: string;
  name: string;
  type: FinancialAccountType;
  bankName?: string;
  initialBalance: number;
  initialBalanceDate: string;
  currentBalance: number;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
}

export type BillStatus = 'pending' | 'partial' | 'paid' | 'received' | 'overdue' | 'cancelled';

export interface BillToPay {
  id: string;
  storeId?: string;
  supplierId?: string;
  supplierName: string;
  category: string;
  description: string;
  originalAmount: number;
  discountAmount?: number;
  penaltyAmount?: number;
  interestAmount?: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  accountId?: string;
  accountName?: string;
  status: BillStatus;
  installmentsCount: number;
  installmentNumber: number;
  purchaseId?: string;
  notes?: string;
  createdAt: string;
}

export interface BillToReceive {
  id: string;
  storeId?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  saleId?: string;
  saleNumber?: string;
  osId?: string;
  osNumber?: string;
  category: string;
  description: string;
  originalAmount: number;
  receivedAmount: number;
  remainingAmount: number;
  issueDate: string;
  dueDate: string;
  receiveDate?: string;
  paymentMethod?: string;
  accountId?: string;
  accountName?: string;
  status: BillStatus;
  installmentsCount: number;
  installmentNumber: number;
  notes?: string;
  createdAt: string;
}

export type FinancialTransactionType = 'inflow' | 'outflow' | 'transfer' | 'adjustment';

export interface FinancialTransaction {
  id: string;
  storeId?: string;
  accountId: string;
  accountName: string;
  destinationAccountId?: string;
  destinationAccountName?: string;
  type: FinancialTransactionType;
  category: string;
  amount: number;
  description: string;
  origin: 'sale' | 'os' | 'purchase' | 'commission' | 'cash_register' | 'manual' | 'transfer' | 'bill_pay' | 'bill_receive';
  referenceId?: string;
  operatorName: string;
  status: 'confirmed' | 'pending' | 'reconciled' | 'cancelled';
  date: string;
  createdAt: string;
}

export interface FinancialDashboardSummary {
  registeredBalance: number;
  pendingToPay: number;
  pendingToReceive: number;
  projectedBalance: number;
  overdueAmount: number;
  todayInflow: number;
  todayOutflow: number;
  periodInflow: number;
  periodOutflow: number;
  periodResult: number;
}

// 2. USUÁRIOS E PERMISSÕES
export type AppUserRole = 'dono' | 'gerente' | 'vendedor' | 'tecnico' | 'financeiro';

export interface ModulePermissions {
  dashboard: {
    viewFinancial: boolean;
    viewRevenue: boolean;
    viewStockAssets: boolean;
  };
  financial: {
    viewFinancial: boolean;
    manualTransactions: boolean;
    recordPayments: boolean;
    viewSensitiveExpenses: boolean;
  };
  fiscal: {
    viewInvoices: boolean;
    issueInvoice: boolean;
    cancelInvoice: boolean;
    fiscalSettings: boolean;
  };
  migration: {
    importDevices: boolean;
    exportData: boolean;
    resetDatabase: boolean;
    restoreBackup: boolean;
  };
  customers: {
    viewCustomers: boolean;
    editCustomers: boolean;
  };
  devices: {
    viewDevices: boolean;
    editDevices: boolean;
    returnToSupplier: boolean;
    markDefective: boolean;
    manageShowcase: boolean;
  };
  products: {
    viewProducts: boolean;
    editProducts: boolean;
    restock: boolean;
  };
  suppliers: {
    viewSuppliers: boolean;
    editSuppliers: boolean;
  };
  sales: {
    viewOwnSales: boolean;
    viewAllSales: boolean;
    startSale: boolean;
    authorizeDiscount: boolean;
    cancelSale: boolean;
    viewTotalRevenue: boolean;
    cashSangria: boolean;
    viewHistory: boolean;
    otherAccess: boolean;
  };
  assistance: {
    viewAllOrders: boolean;
    openOrder: boolean;
    updateStatus: boolean;
    startRepair: boolean;
    completeRepair: boolean;
    deliverDevice: boolean;
    approveQuotes: boolean;
    manageWarranties: boolean;
  };
}

export interface AppUser {
  id: string;
  storeId?: string;
  name: string;
  email: string;
  phone?: string;
  role: AppUserRole;
  pinCodeHash?: string;
  hasPin: boolean;
  active: boolean;
  emailConfirmed?: boolean;
  authMethod: 'local' | 'google';
  permissions: ModulePermissions;
  createdAt: string;
}

// 3. COMISSÕES
export interface CommissionRule {
  id: string;
  storeId?: string;
  userId: string;
  userName: string;
  fixedPerDevice: number;
  minDevices: number;
  period: 'semana' | 'quinzena' | 'mes';
  percentAccessories?: number;
  active: boolean;
  createdAt: string;
}

export interface CommissionRecord {
  id: string;
  storeId?: string;
  saleId?: string;
  saleNumber?: string;
  userId: string;
  userName: string;
  devicesSoldCount: number;
  eligibleRevenue: number;
  calculatedAmount: number;
  status: 'pending_target' | 'unlocked' | 'paid' | 'cancelled';
  periodLabel: string;
  paidAt?: string;
  paidBy?: string;
  financialTransactionId?: string;
  createdAt: string;
}

// 4. PONTO ELETRÔNICO
export type TimecardType = 'entry' | 'lunch_start' | 'lunch_end' | 'exit';

export interface TimecardRecord {
  id: string;
  storeId?: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: TimecardType;
  origin: 'web' | 'mobile' | 'ajuste_manual';
  latitude?: number;
  longitude?: number;
  isWithinRadius: boolean;
  locationStatus: 'validated' | 'outside_radius' | 'gps_unavailable';
  rawDeviceTime?: string;
  serverTime: string;
  notes?: string;
  hash: string;
  createdAt: string;
}

export interface TimecardAdjustment {
  id: string;
  storeId?: string;
  userId: string;
  userName: string;
  targetDate: string;
  adjustedType: TimecardType;
  adjustedTime: string;
  reason: string;
  authorId: string;
  authorName: string;
  status: 'approved' | 'rejected' | 'pending';
  createdAt: string;
}

export interface StoreLocationConfig {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  requireGps: boolean;
}

// 5. CONFIGURAÇÕES DA LOJA
export interface CardMachineConfig {
  id: string;
  name: string;
  acquirer: string;
  debitFee: number;
  creditCashFee: number;
  installmentFees: Record<number, number>;
  payoutDays: number;
  active: boolean;
}

export interface StoreSettings {
  id: string;
  storeId?: string;
  storeName: string;
  logoUrl?: string;
  slug: string;
  cnpjCpf?: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  uf: string;
  timezone: string;
  warrantyReservationDays: number;
  isShowcaseActive: boolean;
  termsSale?: string;
  termsWarrantyNew?: string;
  termsWarrantyUsed?: string;
  termsAssistance?: string;
  cardMachines?: CardMachineConfig[];
  locationConfig?: StoreLocationConfig;
}

// 6. RELATÓRIOS
export type ReportAnalysisType =
  | 'total_sales'
  | 'device_sales'
  | 'accessory_sales'
  | 'payment_methods'
  | 'seller_sales'
  | 'os_report'
  | 'top_items'
  | 'min_stock'
  | 'bills_summary';

// ----------------------------------------------------
// 7. CRM KANBAN E PROSPECÇÃO COMERCIAL (RM SAAS HARNESS)
// ----------------------------------------------------

export type LeadStage =
  | 'novo_lead'
  | 'qualificacao'
  | 'primeiro_contato'
  | 'em_negociacao'
  | 'aguardando_retorno'
  | 'convertido'
  | 'perdido';

export type LeadOrigin =
  | 'pesquisa_manual'
  | 'indicacao'
  | 'formulario'
  | 'importacao'
  | 'evento'
  | 'fonte_autorizada'
  | 'outros';

export type LeadPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export type BusinessType =
  | 'varejo'
  | 'b2b'
  | 'revenda'
  | 'consumidor_final'
  | 'assistencia'
  | 'outro';

export type LeadActivityType =
  | 'ligacao'
  | 'email'
  | 'reuniao'
  | 'retorno'
  | 'observacao'
  | 'mudanca_etapa';

export interface LeadActivity {
  id: string;
  leadId: string;
  type: LeadActivityType;
  description: string;
  timestamp: string;
  authorName: string;
}

export interface LeadTask {
  id: string;
  leadId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface ERPIntegrationLink {
  erpCustomerCode?: string;
  erpOrderRef?: string;
  syncStatus: 'not_linked' | 'pending' | 'linked';
  lastSyncedAt?: string;
  notes?: string;
}

export interface Lead {
  id: string;
  tenantId: string;
  contactName: string;
  companyName?: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  website?: string;
  businessType?: BusinessType;
  commercialInterest: string;
  potentialValue?: number;
  priority: LeadPriority;
  stage: LeadStage;
  assignedUserId?: string;
  assignedUserName: string;
  origin: LeadOrigin;
  entryDate: string;
  lastContactDate?: string;
  nextAction?: string;
  nextReturnDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdByUserName?: string;
  updatedByUserName?: string;
  erpLink?: ERPIntegrationLink;
  activities: LeadActivity[];
  tasks: LeadTask[];
}

export interface CommercialSummary {
  totalLeads: number;
  newLeadsCount: number;
  inProgressCount: number;
  pendingReturnCount: number;
  convertedCount: number;
  totalPotentialValue: number;
  conversionRate: number;
}

export interface AIRecommendation {
  id: string;
  leadId?: string;
  leadName?: string;
  problemOrOpportunity: string;
  usedData: string;
  analyzedPeriod: string;
  justification: string;
  recommendedAction: string;
  suggestedActionType?: 'schedule_return' | 'add_activity' | 'move_stage';
  suggestedStage?: LeadStage;
  urgency: 'baixa' | 'media' | 'alta';
}

// -------------------------------------------------------------------------
// MÓDULO INTELIGÊNCIA FINANCEIRA COM IA (RM SAAS HARNESS)
// -------------------------------------------------------------------------

export type PeriodFilter = 'this_month' | 'last_month' | 'last_30_days' | 'last_90_days' | 'year_to_date';

export type FinancialIntelligenceSubtab =
  | 'executive_dashboard'
  | 'cash_flow'
  | 'payables_receivables'
  | 'profitability'
  | 'forecast_scenarios'
  | 'ai_analyst'
  | 'action_plans'
  | 'analysis_history'
  | 'financial_settings';

export interface DREMetrics {
  period: string;
  grossRevenue: number;
  cardFeesAndDiscounts: number;
  netRevenue: number;
  cmvTotal: number;
  cmvDevices: number;
  cmvAccessories: number;
  cmvParts: number;
  grossProfit: number;
  grossMarginPercent: number;
  operationalExpenses: number;
  operationalResult: number;
  netResult: number;
  netMarginPercent: number;
  ticketMediumSales: number;
  ticketMediumOS: number;
  totalSalesCount: number;
  totalOSCount: number;
  dataQuality: 'complete' | 'estimated' | 'partial';
  notes: string[];
}

export interface CategoryProfitability {
  category: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  marginPercent: number;
  volume: number;
  shareOfTotalRevenuePercent: number;
}

export interface CashFlowPeriodSummary {
  period: string;
  realizedInflows: number;
  realizedOutflows: number;
  netRealized: number;
  currentTotalBalance: number;
  reconciledBalance: number;
  pendingBillsToPayAmount: number;
  overdueBillsToPayAmount: number;
  pendingBillsToReceiveAmount: number;
  overdueBillsToReceiveAmount: number;
  defaultRatePercent: number;
}

export interface CashFlowDayPoint {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

export interface CashFlowScenario {
  daysHorizon: 7 | 30 | 60 | 90;
  scenarioType: 'provavel' | 'pessimista' | 'otimista';
  title: string;
  projectedFinalBalance: number;
  lowestBalanceInPeriod: number;
  lowestBalanceDate: string;
  riskOfCashShortage: boolean;
  shortageAmount: number;
  assumptions: string[];
  timeline: CashFlowDayPoint[];
}

export interface FinancialAlert {
  id: string;
  type: 'cash_shortage' | 'overdue_bill_pay' | 'overdue_bill_receive' | 'margin_drop' | 'expense_spike' | 'unreconciled_divergence';
  severity: 'info' | 'alerta' | 'critico';
  title: string;
  description: string;
  detectedValue: string;
  ruleApplied: string;
  recommendedAction: string;
}

export interface FinancialConsolidatedData {
  summary: CashFlowPeriodSummary;
  dre: DREMetrics;
  categoryProfitability: CategoryProfitability[];
  scenarios: {
    d7: { provavel: CashFlowScenario; pessimista: CashFlowScenario; otimista: CashFlowScenario };
    d30: { provavel: CashFlowScenario; pessimista: CashFlowScenario; otimista: CashFlowScenario };
    d60: { provavel: CashFlowScenario; pessimista: CashFlowScenario; otimista: CashFlowScenario };
    d90: { provavel: CashFlowScenario; pessimista: CashFlowScenario; otimista: CashFlowScenario };
  };
  alerts: FinancialAlert[];
  accountsCount: number;
  unreconciledTransactionsCount: number;
  lastUpdated: string;
}

export interface PrioritizedRecommendation {
  id: string;
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  action: string;
  justification: string;
  estimatedFinancialImpact: string;
  status: 'pending' | 'approved' | 'rejected';
  category: 'custos' | 'preco_margem' | 'cobranca' | 'estoque' | 'fornecedores' | 'metas';
}

export interface AIStructuredAnalysis {
  id: string;
  createdAt: string;
  period: string;
  questionRequested: string;
  modelUsed: string;
  source: 'openai' | 'deterministic_engine';
  executiveSummary: string;
  identifiedSituation: string;
  evidenceAndValues: Array<{ metric: string; value: string; context: string }>;
  comparisonWithPast: string;
  identifiedRisks: Array<{ risk: string; severity: 'baixa' | 'media' | 'alta' | 'critica'; explanation: string }>;
  possibleScenarios: Array<{ name: string; probability: string; outcome: string }>;
  prioritizedRecommendations: PrioritizedRecommendation[];
  estimatedFinancialImpactSummary: string;
  assumptionsAndLimitations: string[];
  additionalDataNeeded: string[];
  distinctionBreakdown: {
    factsObserved: string[];
    systemCalculations: string[];
    estimates: string[];
    hypotheses: string[];
    recommendations: string[];
  };
}

export interface FinancialDecisionRecord {
  id: string;
  analysisId: string;
  recommendationId: string;
  recommendationTitle: string;
  actionTaken: 'approved' | 'rejected' | 'revised';
  decidedBy: string;
  decidedAt: string;
  justification: string;
  observedResult?: string;
}

export interface FinancialIntelligenceConfig {
  openaiApiKeyConfigured: boolean;
  openaiApiKeyMasked?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  defaultCardFeeRate: number;
  targetGrossMargin: number;
  targetNetMargin: number;
  minCashReserveDays: number;
}

