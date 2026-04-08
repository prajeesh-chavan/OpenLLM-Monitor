const mongoose = require("mongoose");
const { encrypt, decrypt, isEncrypted } = require("../utils/encryption");

const ProviderSettingsSchema = new mongoose.Schema({
  provider: { type: String, required: true, unique: true },
  apiKey: { type: String }, // Stored encrypted using AES-256-GCM
  baseUrl: { type: String },
  enabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

// Encrypt apiKey before saving to database
ProviderSettingsSchema.pre("save", function (next) {
  if (this.isModified("apiKey") && this.apiKey && !isEncrypted(this.apiKey)) {
    this.apiKey = encrypt(this.apiKey);
  }
  next();
});

// Encrypt apiKey on findOneAndUpdate
ProviderSettingsSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update && update.apiKey && !isEncrypted(update.apiKey)) {
    update.apiKey = encrypt(update.apiKey);
  }
  next();
});

/**
 * Decrypt apiKey for use in application
 * @returns {string|null} Decrypted API key
 */
ProviderSettingsSchema.methods.getDecryptedApiKey = function () {
  if (!this.apiKey) return null;
  return decrypt(this.apiKey);
};

module.exports = mongoose.model("ProviderSettings", ProviderSettingsSchema);
