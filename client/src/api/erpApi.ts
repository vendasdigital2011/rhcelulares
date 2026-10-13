import type { Device, Sale, ServiceOrder, CashRegister } from '../types.js';
import { INITIAL_DEVICES, INITIAL_SALES, INITIAL_SERVICE_ORDERS, INITIAL_CASH } from '../data/erpData.js';

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/erp` 
  : '/api/erp';

export async function fetchDevices(): Promise<Device[]> {
  try {
    const res = await fetch(`${API_BASE}/devices`);
    if (!res.ok) throw new Error('API offline');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend API offline, usando fallback local para aparelhos:', err);
    return INITIAL_DEVICES;
  }
}

export async function createDeviceApi(device: Device): Promise<Device> {
  try {
    const res = await fetch(`${API_BASE}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(device),
    });
    if (!res.ok) throw new Error('Erro ao salvar no backend');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend offline, salvando localmente:', err);
    return device;
  }
}

export async function fetchSales(): Promise<Sale[]> {
  try {
    const res = await fetch(`${API_BASE}/sales`);
    if (!res.ok) throw new Error('API offline');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend API offline, usando fallback local para vendas:', err);
    return INITIAL_SALES;
  }
}

export async function createSaleApi(sale: any): Promise<Sale> {
  try {
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
    if (!res.ok) throw new Error('Erro ao salvar no backend');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend offline, salvando venda localmente:', err);
    return sale;
  }
}

export async function fetchServiceOrders(): Promise<ServiceOrder[]> {
  try {
    const res = await fetch(`${API_BASE}/service-orders`);
    if (!res.ok) throw new Error('API offline');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend API offline, usando fallback local para O.S.:', err);
    return INITIAL_SERVICE_ORDERS;
  }
}

export async function createServiceOrderApi(os: ServiceOrder): Promise<ServiceOrder> {
  try {
    const res = await fetch(`${API_BASE}/service-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(os),
    });
    if (!res.ok) throw new Error('Erro ao salvar no backend');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend offline, salvando O.S. localmente:', err);
    return os;
  }
}

export async function fetchCashRegister(): Promise<CashRegister> {
  try {
    const res = await fetch(`${API_BASE}/cash`);
    if (!res.ok) throw new Error('API offline');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend API offline, usando fallback local para caixa:', err);
    return INITIAL_CASH;
  }
}

export async function toggleCashApi(): Promise<CashRegister> {
  try {
    const res = await fetch(`${API_BASE}/cash/toggle`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Erro ao alternar caixa no backend');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend offline, alternando caixa localmente:', err);
    return INITIAL_CASH;
  }
}

export async function fetchDashboardMetrics(period: string = 'month'): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/metrics?period=${period}`);
    if (!res.ok) throw new Error('Erro ao carregar métricas');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend offline para métricas, fallback para cálculo local:', err);
    return null;
  }
}

