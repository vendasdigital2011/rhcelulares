import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/hiago_iphones_saas'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(16).default('super_secret_jwt_key_hiago_iphones_2026_dev_32char_min'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),
  ENCRYPTION_MASTER_KEY: z.string().default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
  META_WEBHOOK_VERIFY_TOKEN: z.string().default('hiago_meta_verify_token_dev'),
  META_APP_SECRET: z.string().default('meta_app_secret_here_for_hmac_sha256'),
  META_GRAPH_API_VERSION: z.string().default('v20.0'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('⚠️ Configuração de ambiente inválida:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
