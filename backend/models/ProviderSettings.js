const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/encryption");

const PROVIDERS = [
  "openai", "openrouter", "mistral", "ollama", "gemini", "grok",
];

const providerSettingsSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      unique: true,
      enum: {
        values: PROVIDERS,
        message: "{VALUE} is not a supported provider",
      },
    },
    apiKey: {
      type: String,
      set: encrypt,
      get: decrypt,
    },
    baseUrl: { type: String },
    enabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

providerSettingsSchema.index({ provider: 1 }, { unique: true });
providerSettingsSchema.index({ enabled: 1 });

module.exports = mongoose.model("ProviderSettings", providerSettingsSchema);
