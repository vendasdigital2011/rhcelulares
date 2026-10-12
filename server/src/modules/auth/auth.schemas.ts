import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  tenantId: z.string().uuid().optional(),
});

export const registerTenantSchema = z.object({
  storeName: z.string().min(2, 'Nome da loja é obrigatório'),
  cnpj: z.string().optional(),
  adminName: z.string().min(2, 'Nome do administrador é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  phoneNumber: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterTenantInput = z.infer<typeof registerTenantSchema>;
