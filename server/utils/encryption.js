import crypto from 'crypto';

// AES-256-GCM encryption
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Derives a key from password using PBKDF2
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
}

/**
 * Encrypt data using AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @param {string} password - Password for encryption
 * @returns {string} - Encrypted data in base64 format
 */
export function encryptAES256(text, password) {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = deriveKey(password, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(String(text), 'utf8'),
      cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted
    const result = Buffer.concat([salt, iv, tag, encrypted]);

    return result.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Encrypted data in base64 format
 * @param {string} password - Password for decryption
 * @returns {string} - Decrypted plain text
 */
export function decryptAES256(encryptedData, password) {
  try {
    const data = Buffer.from(encryptedData, 'base64');

    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = data.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = data.subarray(ENCRYPTED_POSITION);

    const key = deriveKey(password, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Generate encryption key
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create checksum for data integrity
 */
export function createChecksum(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify checksum
 */
export function verifyChecksum(data, checksum) {
  const calculatedChecksum = createChecksum(data);
  return calculatedChecksum === checksum;
}

/**
 * Encrypt file buffer
 */
export function encryptFile(fileBuffer, password) {
  const encrypted = encryptAES256(fileBuffer.toString('base64'), password);
  return Buffer.from(encrypted, 'utf8');
}

/**
 * Decrypt file buffer
 */
export function decryptFile(encryptedBuffer, password) {
  const decrypted = decryptAES256(encryptedBuffer.toString('utf8'), password);
  return Buffer.from(decrypted, 'base64');
}

export default {
  encryptAES256,
  decryptAES256,
  generateEncryptionKey,
  createChecksum,
  verifyChecksum,
  encryptFile,
  decryptFile
};
