const mongoose = require("mongoose");

const ProviderSettingsSchema = new mongoose.Schema({
  provider: { type: String, required: true, unique: true },
  apiKey: { type: String }, // Store securely in production
  baseUrl: { type: String },
  enabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ProviderSettings", ProviderSettingsSchema);
