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

export type OSStatus = 
  | 'received' 
  | 'diagnosing' 
  | 'waiting_parts' 
  | 'ready' 
  | 'delivered';

export interface ServiceOrder {
  id: string;
  osNumber: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  imei?: string;
  color?: string;
  technician: string;
  status: OSStatus;
  checklistCount: number;
  reportedIssue: string;
  technicalDiagnosis?: string;
  serviceExecuted?: string;
  estimatedValue: number;
  finalValue?: number;
  entryDate: string;
  deliveredDate?: string;
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

