import type { Device, Accessory, ServiceOrder, CashRegister, Sale, Customer, AfterSalesTrigger } from '../types.js';

export const INITIAL_DEVICES: Device[] = [];

export const INITIAL_ACCESSORIES: Accessory[] = [];

export const INITIAL_SERVICE_ORDERS: ServiceOrder[] = [];

export const INITIAL_CASH: CashRegister = {
  isOpen: false,
  openedAt: undefined,
  initialFloat: 0,
  totalSales: 0,
  breakdown: {
    money: 0,
    pix: 0,
    creditCard: 0,
    debitCard: 0,
    tradeIn: 0,
    other: 0,
  },
};

export const INITIAL_SALES: Sale[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_AFTER_SALES_TRIGGERS: AfterSalesTrigger[] = [];
