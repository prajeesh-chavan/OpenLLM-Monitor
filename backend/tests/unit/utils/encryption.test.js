const { encrypt, decrypt } = require("../../../utils/encryption");

describe("encryption utility", () => {
  it("should encrypt and decrypt a string", () => {
    const original = "sk-test-api-key-12345";
    const encrypted = encrypt(original);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(original);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it("should return null/undefined unchanged", () => {
    expect(encrypt(null)).toBeNull();
    expect(encrypt(undefined)).toBeUndefined();
    expect(decrypt(null)).toBeNull();
    expect(decrypt(undefined)).toBeUndefined();
  });

  it("should return empty string unchanged", () => {
    expect(encrypt("")).toBe("");
  });

  it("should produce different ciphertexts for same input", () => {
    const input = "same-key";
    const result1 = encrypt(input);
    const result2 = encrypt(input);
    expect(result1).not.toBe(result2);
  });

  it("should fail to decrypt with tampered ciphertext", () => {
    const encrypted = encrypt("secret-value");
    const tampered = encrypted.slice(0, -1) + "0";
    expect(() => decrypt(tampered)).toThrow();
  });
});
