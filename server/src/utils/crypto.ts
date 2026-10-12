import crypto from 'node:crypto';
import { env } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recomendado para GCM

function getKey(): Buffer {
  // Converte a chave mestra hex ou ajusta para 32 bytes
  const keyHex = env.ENCRYPTION_MASTER_KEY;
  if (keyHex.length === 64) {
    return Buffer.from(keyHex, 'hex');
  }
  return crypto.createHash('sha256').update(keyHex).digest();
}

/**
 * Criptografa texto usando AES-256-GCM (ex: tokens WABA da Meta)
 * Retorna string no formato: iv_hex:auth_tag_hex:encrypted_hex
 */
export function encryptSensitiveData(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Descriptografa string criptografada com AES-256-GCM
 */
export function decryptSensitiveData(encryptedString: string): string {
  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    throw new Error('Formato inválido de dado criptografado.');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Valida a assinatura HMAC SHA256 do webhook da Meta
 * Cabeçalho: x-hub-signature-256 = sha256=<hash>
 */
export function verifyMetaSignature(rawBody: string | Buffer, signatureHeader: string | undefined): boolean {
  if (!signatureHeader || !env.META_APP_SECRET) {
    return false;
  }

  const [scheme, signature] = signatureHeader.split('=');
  if (scheme !== 'sha256' || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.META_APP_SECRET)
    .update(rawBody)
    .digest('hex');

  const sourceBuffer = Buffer.from(signature, 'utf8');
  const targetBuffer = Buffer.from(expectedSignature, 'utf8');

  if (sourceBuffer.length !== targetBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sourceBuffer, targetBuffer);
}
