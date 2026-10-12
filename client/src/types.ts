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
