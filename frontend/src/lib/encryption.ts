import 'server-only';

/**
 * Production-grade AES-256-GCM encryption for API keys
 * Using Web Crypto API for browser compatibility
 * Following Silicon Valley DDD - Pure Utilities & Infrastructure
 */

const algorithm = 'AES-GCM';
const keyLength = 256;

/**
 * Derives an AES-256-GCM CryptoKey using PBKDF2 from a secret and a provided salt.
 *
 * @param salt - A 32-byte Uint8Array used as the dynamic salt for key derivation
 * @returns A Promise that resolves to a CryptoKey suitable for AES-GCM encryption and decryption
 * @throws If the ENCRYPTION_SECRET environment variable is missing
 */
async function getEncryptionKey(salt: Uint8Array): Promise<CryptoKey> {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is required');
  }

  // Derive a cryptographic key from the secret using dynamic salt
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
      salt: salt, // Use dynamic salt instead of fixed salt
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: algorithm, length: keyLength },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypts an API key string using AES-256-GCM with a randomly generated salt and IV.
 *
 * @param apiKey - The API key string to encrypt
 * @returns A base64-encoded string containing the salt, IV, and encrypted API key
 *
 * Throws a generic error if encryption fails.
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  try {
    // Generate random salt for PBKDF2 (32 bytes)
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const key = await getEncryptionKey(salt);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

    const encrypted = await crypto.subtle.encrypt(
      { name: algorithm, iv },
      key,
      new TextEncoder().encode(apiKey),
    );

    // Combine salt, IV, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return Buffer.from(combined).toString('base64');
  } catch (error) {
    // Do not log sensitive encryption details to console for security
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypts a base64-encoded string containing an API key encrypted with AES-256-GCM.
 *
 * @param encryptedData - The base64-encoded string produced by the encryption utility, containing the salt, IV, and ciphertext.
 * @returns The original decrypted API key string.
 * @throws If the input is not properly formatted or decryption fails, a generic error is thrown without revealing sensitive details.
 */
export async function decryptApiKey(encryptedData: string): Promise<string> {
  try {
    const combined = Buffer.from(encryptedData, 'base64');

    // Minimum length: 32 bytes (salt) + 12 bytes (IV) + encrypted data
    if (combined.length < 44) {
      throw new Error('Invalid encrypted data format');
    }

    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 32);
    const iv = combined.slice(32, 44);
    const encrypted = combined.slice(44);

    const key = await getEncryptionKey(salt);
    const decrypted = await crypto.subtle.decrypt({ name: algorithm, iv }, key, encrypted);

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    // Do not log sensitive decryption details to console for security
    throw new Error('Failed to decrypt API key');
  }
}
