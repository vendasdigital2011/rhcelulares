import pg from 'pg';
import { env } from '../config/index.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

let isDbConnected = false;

pool.on('error', (err) => {
  console.error('❌ Erro no pool do PostgreSQL:', err.message);
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isDbConnected = true;
    console.log('✅ PostgreSQL conectado com sucesso.');
    return true;
  } catch (err: any) {
    isDbConnected = false;
    console.warn('⚠️ PostgreSQL não conectado:', err.message);
    return false;
  }
}

export function getDatabaseStatus(): boolean {
  return isDbConnected;
}

/**
 * Executa uma transação com isolamento estrito de Tenant via PostgreSQL RLS:
 * SET LOCAL app.current_tenant_id = '<tenantId>';
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Define a variável de contexto de sessão que o RLS utiliza
    await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId]);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
