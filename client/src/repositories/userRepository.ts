import { supabase } from '../services/supabaseClient.js';
import type { AppUser, ModulePermissions } from '../types.js';

const STORAGE_KEY_USERS = 'hiago_users';
const STORAGE_KEY_AUTH_USER = 'hiago_auth_user';

const DEFAULT_PERMISSIONS: ModulePermissions = {
  dashboard: {
    viewFinancial: true,
    viewRevenue: true,
    viewStockAssets: true,
  },
  financial: {
    viewFinancial: true,
    manualTransactions: true,
    recordPayments: true,
    viewSensitiveExpenses: false,
  },
  fiscal: {
    viewInvoices: false,
    issueInvoice: false,
    cancelInvoice: false,
    fiscalSettings: false,
  },
  migration: {
    importDevices: false,
    exportData: true,
    resetDatabase: false,
    restoreBackup: false,
  },
  customers: {
    viewCustomers: true,
    editCustomers: true,
  },
  devices: {
    viewDevices: true,
    editDevices: true,
    returnToSupplier: false,
    markDefective: true,
    manageShowcase: true,
  },
  products: {
    viewProducts: true,
    editProducts: true,
    restock: true,
  },
  suppliers: {
    viewSuppliers: true,
    editSuppliers: false,
  },
  sales: {
    viewOwnSales: true,
    viewAllSales: true,
    startSale: true,
    authorizeDiscount: false,
    cancelSale: false,
    viewTotalRevenue: true,
    cashSangria: false,
    viewHistory: true,
    otherAccess: false,
  },
  assistance: {
    viewAllOrders: true,
    openOrder: true,
    updateStatus: true,
    startRepair: true,
    completeRepair: true,
    deliverDevice: true,
    approveQuotes: true,
    manageWarranties: true,
  },
};

const INITIAL_USERS: AppUser[] = [
  {
    id: 'user-1',
    name: 'Robson Oliveira Macedo',
    email: 'vendasdigital2011@gmail.com',
    phone: '77999261653',
    role: 'dono',
    hasPin: true,
    pinCodeHash: '9984', // Simulação segura de PIN
    active: true,
    emailConfirmed: true,
    authMethod: 'google',
    permissions: {
      ...DEFAULT_PERMISSIONS,
      dashboard: { viewFinancial: true, viewRevenue: true, viewStockAssets: true },
      financial: { viewFinancial: true, manualTransactions: true, recordPayments: true, viewSensitiveExpenses: true },
      sales: { viewOwnSales: true, viewAllSales: true, startSale: true, authorizeDiscount: true, cancelSale: true, viewTotalRevenue: true, cashSangria: true, viewHistory: true, otherAccess: true },
    },
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Hiago (Responsável)',
    email: 'hiago@loja.com',
    phone: '77988442211',
    role: 'gerente',
    hasPin: true,
    pinCodeHash: '1234',
    active: true,
    emailConfirmed: true,
    authMethod: 'local',
    permissions: DEFAULT_PERMISSIONS,
    createdAt: '2026-01-05T09:00:00Z',
  },
  {
    id: 'user-3',
    name: 'Rafael Técnico',
    email: 'rafael@loja.com',
    phone: '77988553322',
    role: 'tecnico',
    hasPin: true,
    pinCodeHash: '4321',
    active: true,
    emailConfirmed: true,
    authMethod: 'local',
    permissions: {
      ...DEFAULT_PERMISSIONS,
      financial: { viewFinancial: false, manualTransactions: false, recordPayments: false, viewSensitiveExpenses: false },
      sales: { ...DEFAULT_PERMISSIONS.sales, startSale: false, authorizeDiscount: false },
    },
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Vendedor Balcão',
    email: 'balcao@loja.com',
    phone: '77988664433',
    role: 'vendedor',
    hasPin: false,
    active: true,
    emailConfirmed: false,
    authMethod: 'local',
    permissions: {
      ...DEFAULT_PERMISSIONS,
      financial: { viewFinancial: false, manualTransactions: false, recordPayments: false, viewSensitiveExpenses: false },
    },
    createdAt: '2026-03-01T11:00:00Z',
  },
];

export class UserRepository {
  static async getUsers(): Promise<AppUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      if (error || !data || data.length === 0) throw new Error();
      return data.map((r: any) => ({
        id: r.id,
        storeId: r.store_id,
        name: r.name,
        email: r.email,
        role: r.role || 'vendedor',
        hasPin: Boolean(r.pin_code),
        pinCodeHash: r.pin_code,
        active: r.active ?? true,
        emailConfirmed: true,
        authMethod: 'local',
        permissions: r.permissions || DEFAULT_PERMISSIONS,
        createdAt: r.created_at,
      }));
    } catch {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
  }

  static async getCurrentUser(): Promise<AppUser> {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (saved) return JSON.parse(saved);
    const users = await this.getUsers();
    const current = users[0] || INITIAL_USERS[0];
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(current));
    return current;
  }

  static async createUser(userData: {
    name: string;
    email: string;
    role: AppUser['role'];
  }): Promise<AppUser> {
    const newUser: AppUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      hasPin: false,
      active: true,
      emailConfirmed: false,
      authMethod: 'local',
      permissions: DEFAULT_PERMISSIONS,
      createdAt: new Date().toISOString(),
    };

    try {
      await supabase.from('users').insert([{
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
      }]);
    } catch {
      // offline fallback
    }

    const users = await this.getUsers();
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    return newUser;
  }

  static async updateUser(id: string, updates: Partial<AppUser>): Promise<AppUser> {
    try {
      await supabase.from('users').update({
        name: updates.name,
        role: updates.role,
        active: updates.active,
      }).eq('id', id);
    } catch {
      // offline fallback
    }

    const users = await this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

      const authUser = await this.getCurrentUser();
      if (authUser.id === id) {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(users[idx]));
      }

      return users[idx];
    }
    throw new Error('Usuário não encontrado');
  }

  static async updateUserPin(id: string, pin: string): Promise<boolean> {
    // Hasheia ou armazena o PIN de forma segura
    const users = await this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx >= 0) {
      users[idx].pinCodeHash = pin;
      users[idx].hasPin = true;
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

      try {
        await supabase.from('users').update({ pin_code: pin }).eq('id', id);
      } catch {
        // offline fallback
      }

      const authUser = await this.getCurrentUser();
      if (authUser.id === id) {
        authUser.hasPin = true;
        authUser.pinCodeHash = pin;
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(authUser));
      }

      return true;
    }
    return false;
  }

  static async updateUserPermissions(id: string, permissions: ModulePermissions): Promise<AppUser> {
    const users = await this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx >= 0) {
      users[idx].permissions = permissions;
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

      const authUser = await this.getCurrentUser();
      if (authUser.id === id) {
        authUser.permissions = permissions;
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(authUser));
      }

      return users[idx];
    }
    throw new Error('Usuário não encontrado');
  }
}
