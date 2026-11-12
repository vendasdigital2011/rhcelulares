import type { ERPNavTab } from '../components/Sidebar.js';

export type UserRole = 'admin' | 'manager' | 'seller' | 'technician';

export interface AuthUser {
  userId: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  storeName: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  cnpj?: string;
  active: boolean;
}

const STORAGE_KEY_AUTH = 'hiago_crm_auth_user';
const STORAGE_KEY_TOKEN = 'hiago_crm_jwt_token';
const STORAGE_KEY_TENANTS = 'hiago_crm_tenants';

const DEFAULT_TENANTS: TenantInfo[] = [
  {
    id: 'tenant-001',
    name: 'Hiago iPhones - Matriz Centro',
    slug: 'hiago-iphones-matriz',
    cnpj: '12.345.678/0001-90',
    active: true,
  },
  {
    id: 'tenant-002',
    name: 'Hiago iPhones - Shopping Boulevard',
    slug: 'hiago-iphones-shopping',
    cnpj: '12.345.678/0002-71',
    active: true,
  },
];

// Perfis pré-configurados para testes e homologação rápida RBAC
export const DEMO_USERS: Record<UserRole, AuthUser> = {
  admin: {
    userId: 'usr-admin-01',
    tenantId: 'tenant-001',
    name: 'Hiago (Proprietário)',
    email: 'admin@hiagoiphones.com.br',
    role: 'admin',
    storeName: 'Hiago iPhones - Matriz Centro',
  },
  manager: {
    userId: 'usr-mgr-02',
    tenantId: 'tenant-001',
    name: 'Camila Fernandes (Gerente)',
    email: 'gerente@hiagoiphones.com.br',
    role: 'manager',
    storeName: 'Hiago iPhones - Matriz Centro',
  },
  seller: {
    userId: 'usr-sell-03',
    tenantId: 'tenant-001',
    name: 'Lucas Rodrigues (Vendedor)',
    email: 'vendas@hiagoiphones.com.br',
    role: 'seller',
    storeName: 'Hiago iPhones - Matriz Centro',
  },
  technician: {
    userId: 'usr-tech-04',
    tenantId: 'tenant-001',
    name: 'André Santos (Técnico Bancada)',
    email: 'tecnico@hiagoiphones.com.br',
    role: 'technician',
    storeName: 'Hiago iPhones - Matriz Centro',
  },
};

export class AuthService {
  /**
   * Obtém o usuário atualmente autenticado
   */
  public static getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Erro ao ler usuário autenticado:', e);
    }
    // Retorna admin como padrão caso ainda não haja sessão salva
    return DEMO_USERS.admin;
  }

  /**
   * Verifica se há sessão ativa
   */
  public static isAuthenticated(): boolean {
    return Boolean(this.getCurrentUser());
  }

  /**
   * Realiza login por E-mail e Senha
   */
  public static async login(email: string, password: string): Promise<AuthUser> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.setSession(data.user, data.token);
          return data.user;
        }
      }
    } catch (err) {
      // Backend offline ou ambiente estático
    }

    // Validação local de fallback para testes
    const matched = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched && password.length >= 4) {
      this.setSession(matched, 'mock-jwt-token-dev');
      return matched;
    }

    // Login genérico se senha bater
    if (password === '123456' || password === 'admin') {
      const user: AuthUser = {
        userId: 'usr-custom-' + Date.now(),
        tenantId: 'tenant-001',
        name: email.split('@')[0],
        email,
        role: 'admin',
        storeName: 'Hiago iPhones',
      };
      this.setSession(user, 'mock-jwt-token-dev');
      return user;
    }

    throw new Error('E-mail ou senha inválidos. Tente: admin@hiagoiphones.com.br / 123456');
  }

  /**
   * Login Rápido por Perfil (1-Click para Homologação)
   */
  public static quickLoginAs(role: UserRole): AuthUser {
    const user = DEMO_USERS[role];
    this.setSession(user, `demo-token-${role}`);
    return user;
  }

  /**
   * Grava a sessão localmente
   */
  public static setSession(user: AuthUser, token?: string): void {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    if (token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    }
  }

  /**
   * Encerra a sessão
   */
  public static logout(): void {
    try {
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
    localStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }

  /**
   * Lista as lojas (Tenants) cadastradas
   */
  public static getTenants(): TenantInfo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TENANTS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_TENANTS;
  }

  /**
   * Alterna a loja ativa (Multi-Tenant)
   */
  public static switchTenant(tenantId: string): AuthUser | null {
    const tenants = this.getTenants();
    const target = tenants.find(t => t.id === tenantId);
    if (!target) return null;

    const current = this.getCurrentUser();
    if (!current) return null;

    const updated: AuthUser = {
      ...current,
      tenantId: target.id,
      storeName: target.name,
    };
    this.setSession(updated);
    return updated;
  }

  /**
   * Regras de RBAC: Verifica se o papel tem permissão de visualizar a aba
   */
  public static canAccessTab(role: UserRole, tab: ERPNavTab): boolean {
    if (role === 'admin') return true; // Dono tem acesso total

    if (role === 'manager') {
      // Gerente não mexe em configurações estruturais de loja ou migrações
      const restrictedForManager: ERPNavTab[] = ['migration', 'subscription'];
      return !restrictedForManager.includes(tab);
    }

    if (role === 'seller') {
      // Vendedor tem acesso a Operação (Checkout, Vendas, CRM, Estoque Vitrine/Consulta)
      const allowedForSeller: ERPNavTab[] = [
        'dashboard',
        'checkout',
        'sales_history',
        'customers',
        'crm_customers',
        'after_sales',
        'showcase',
        'stock_dashboard',
        'inventory',
      ];
      return allowedForSeller.includes(tab);
    }

    if (role === 'technician') {
      // Técnico foca em Assistência Técnica, OS, Serviços, Garantias e Peças
      const allowedForTech: ERPNavTab[] = [
        'dashboard',
        'assistance_dashboard',
        'service_order',
        'services',
        'warranty',
        'parts',
        'crm_customers',
      ];
      return allowedForTech.includes(tab);
    }

    return true;
  }
}

