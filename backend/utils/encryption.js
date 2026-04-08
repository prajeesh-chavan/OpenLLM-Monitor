const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment (must be 32 bytes / 64 hex chars)
 * Falls back to JWT_SECRET hashed to 32 bytes if ENCRYPTION_KEY not set
 */
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (key && Buffer.from(key, "hex").length === 32) {
    return Buffer.from(key, "hex");
  }
  // Derive a 32-byte key from JWT_SECRET
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_KEY or JWT_SECRET must be set for API key encryption");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 * @param {string} plaintext - The string to encrypt
 * @returns {string} Encrypted string in format: iv:authTag:ciphertext (hex encoded)
 */
function encrypt(plaintext) {
  if (!plaintext) return plaintext;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // Format: iv:authTag:ciphertext
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an encrypted string using AES-256-GCM
 * @param {string} encryptedText - The encrypted string in format: iv:authTag:ciphertext
 * @returns {string} Decrypted plaintext string
 */
function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;

  // Check if the value looks encrypted (has the iv:authTag:ciphertext format)
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    // Not encrypted (legacy plaintext value), return as-is
    return encryptedText;
  }

  const key = getEncryptionKey();
  const [ivHex, authTagHex, ciphertext] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Check if a string appears to be encrypted
 * @param {string} value - The string to check
 * @returns {boolean}
 */
function isEncrypted(value) {
  if (!value) return false;
  const parts = value.split(":");
  return parts.length === 3 && parts[0].length === IV_LENGTH * 2;
}

module.exports = { encrypt, decrypt, isEncrypted };
