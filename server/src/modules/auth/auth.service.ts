import bcrypt from 'bcryptjs';
import { pool, getDatabaseStatus } from '../../db/client.js';
import type { LoginInput, RegisterTenantInput } from './auth.schemas.js';

export interface AuthUserPayload {
  userId: string;
  tenantId: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'seller';
  storeName?: string;
}

// Usuário padrão de demonstração / fallback local quando o banco não estiver provisionado
const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000002';

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async login(input: LoginInput): Promise<AuthUserPayload> {
    const isDbActive = getDatabaseStatus();

    if (isDbActive) {
      const result = await pool.query(
        `SELECT u.id, u.tenant_id, u.name, u.email, u.password_hash, u.role, t.name as store_name
         FROM users u
         JOIN tenants t ON t.id = u.tenant_id
         WHERE u.email = $1 LIMIT 1`,
        [input.email]
      );

      if (result.rows.length === 0) {
        throw new Error('Credenciais inválidas.');
      }

      const user = result.rows[0];
      const isValid = await this.verifyPassword(input.password, user.password_hash);
      if (!isValid) {
        throw new Error('Credenciais inválidas.');
      }

      return {
        userId: user.id,
        tenantId: user.tenant_id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.store_name,
      };
    }

    // Modo local para desenvolvimento se banco ainda não estiver populado
    if (input.email === 'admin@hiagoiphones.com.br' && input.password === '123456') {
      return {
        userId: DEMO_USER_ID,
        tenantId: DEMO_TENANT_ID,
        name: 'Hiago (Proprietário)',
        email: 'admin@hiagoiphones.com.br',
        role: 'admin',
        storeName: 'Hiago iPhones',
      };
    }

    throw new Error('Credenciais inválidas. Para teste local use: admin@hiagoiphones.com.br / 123456');
  }

  async registerTenant(input: RegisterTenantInput): Promise<AuthUserPayload> {
    const isDbActive = getDatabaseStatus();
    const passwordHash = await this.hashPassword(input.password);

    if (isDbActive) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // 1. Cria Tenant
        const tenantRes = await client.query(
          `INSERT INTO tenants (name, cnpj, phone_number, status)
           VALUES ($1, $2, $3, 'active')
           RETURNING id, name`,
          [input.storeName, input.cnpj || null, input.phoneNumber || null]
        );
        const tenant = tenantRes.rows[0];

        // 2. Cria Usuário Admin
        const userRes = await client.query(
          `INSERT INTO users (tenant_id, name, email, password_hash, role)
           VALUES ($1, $2, $3, $4, 'admin')
           RETURNING id, name, email, role`,
          [tenant.id, input.adminName, input.email, passwordHash]
        );
        const user = userRes.rows[0];

        // 3. Inicializa tabela padrão de taxas de máquina (1x até 18x)
        const defaultFees = [
          { inst: 1, fee: 3.20 },
          { inst: 2, fee: 4.50 },
          { inst: 3, fee: 5.20 },
          { inst: 6, fee: 7.80 },
          { inst: 10, fee: 10.50 },
          { inst: 12, fee: 12.00 },
          { inst: 18, fee: 15.50 },
        ];
        for (const item of defaultFees) {
          await client.query(
            `INSERT INTO card_fee_settings (tenant_id, installment_number, fee_percentage)
             VALUES ($1, $2, $3)`,
            [tenant.id, item.inst, item.fee]
          );
        }

        await client.query('COMMIT');

        return {
          userId: user.id,
          tenantId: tenant.id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeName: tenant.name,
        };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    // Modo simulado quando offline
    return {
      userId: DEMO_USER_ID,
      tenantId: DEMO_TENANT_ID,
      name: input.adminName,
      email: input.email,
      role: 'admin',
      storeName: input.storeName,
    };
  }
}

export const authService = new AuthService();
