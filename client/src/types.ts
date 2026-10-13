export type DeviceCondition = 'new_sealed' | 'certified_pre_owned';

export type DeviceStatus = 'available' | 'reserved' | 'sold';

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
}

export interface CashRegister {
  isOpen: boolean;
  openedAt?: string;
  initialFloat: number;
  totalSales: number;
  breakdown: {
    money: number;
    pix: number;
    creditCard: number;
    debitCard: number;
    tradeIn: number;
    other: number;
  };
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

export type PurchaseSituation = 'todas' | 'em_orcamento' | 'em_manutencao' | 'aguardando_peca' | 'finalizada';

export interface PhonePurchase {
  id: string;
  date: string;
  customer: string;
  cpf: string;
  phone: string;
  address?: string;
  seller: string;
  model: string;
  imei: string;
  color: string;
  battery: number;
  condition: 'seminovo' | 'vitrine' | 'lacrado';
  evaluation: number;
  paymentMethod: string;
  status: 'em_orcamento' | 'em_manutencao' | 'aguardando_peca' | 'finalizada';
  notes?: string;
  hasContract: boolean;
}

