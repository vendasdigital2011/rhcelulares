/**
 * Utilitários de Validação e Sanitização — Hiago iPhones ERP
 */

/**
 * Valida se a string é um IMEI válido (15 dígitos numéricos).
 * Aplica algoritmo de Luhn para validação de integridade do dígito verificador.
 */
export function validateIMEI(rawImei: string): boolean {
  const cleaned = rawImei.replace(/\D/g, '');

  if (!cleaned || cleaned.length !== 15) {
    return false;
  }

  // Algoritmo de Luhn para IMEI (Norma 3GPP/Anatel)
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(cleaned.charAt(i), 10);
    // Para índices ímpares (posições 2, 4, 6... do número 0-indexed)
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

/**
 * Valida telefone brasileiro com DDD (celular 11 dígitos ou fixo 10 dígitos).
 */
export function validatePhoneBR(rawPhone: string): { isValid: boolean; error?: string } {
  const cleaned = rawPhone.replace(/\D/g, '');

  if (!cleaned) {
    return { isValid: false, error: 'Telefone é obrigatório' };
  }

  if (cleaned.length < 10 || cleaned.length > 11) {
    return { 
      isValid: false, 
      error: 'Telefone deve incluir DDD + número (10 ou 11 dígitos)' 
    };
  }

  const ddd = parseInt(cleaned.substring(0, 2), 10);
  if (ddd < 11 || ddd > 99) {
    return { isValid: false, error: 'DDD inválido' };
  }

  // Celulares no Brasil iniciam com 9
  if (cleaned.length === 11 && cleaned.charAt(2) !== '9') {
    return { isValid: false, error: 'Celular deve começar com o dígito 9 após o DDD' };
  }

  return { isValid: true };
}

/**
 * Formata telefone para exibição amigável: (77) 98844-2211
 */
export function formatPhoneBR(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
}
