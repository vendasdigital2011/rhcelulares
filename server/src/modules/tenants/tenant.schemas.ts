import { z } from 'zod';

export const updateWabaSchema = z.object({
  wabaId: z.string().min(1, 'WABA ID é obrigatório'),
  phoneNumberId: z.string().min(1, 'Phone Number ID é obrigatório'),
  phoneNumber: z.string().min(10, 'Número de telefone é obrigatório'),
  accessToken: z.string().min(10, 'Token de Acesso da Meta é obrigatório'),
});

export const updateCardFeeItemSchema = z.object({
  installmentNumber: z.number().int().min(1).max(24),
  feePercentage: z.number().min(0).max(100),
});

export const updateCardFeesSchema = z.object({
  fees: z.array(updateCardFeeItemSchema).min(1, 'Informe ao menos uma taxa'),
});

export type UpdateWabaInput = z.infer<typeof updateWabaSchema>;
export type UpdateCardFeesInput = z.infer<typeof updateCardFeesSchema>;
