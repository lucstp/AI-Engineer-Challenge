import 'server-only';

/**
 * Production-grade AES-256-GCM encryption for API keys
 * Using Web Crypto API for browser compatibility
 * Following Silicon Valley DDD - Pure Utilities & Infrastructure
 */

const algorithm = 'AES-GCM';
const keyLength = 256;

async function getEncryptionKey(): Promise<CryptoKey> {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is required');
  }

  // Derive a cryptographic key from the secret
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('openai-api-key-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: algorithm, length: keyLength },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptApiKey(apiKey: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

    const encrypted = await crypto.subtle.encrypt(
      { name: algorithm, iv },
      key,
      new TextEncoder().encode(apiKey),
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return Buffer.from(combined).toString('base64');
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt API key');
  }
}

export async function decryptApiKey(encryptedData: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

    if (combined.length < 12) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt({ name: algorithm, iv }, key, encrypted);

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt API key');
  }
}
