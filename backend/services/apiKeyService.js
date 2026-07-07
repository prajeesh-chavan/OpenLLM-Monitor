const config = require("../config/env");
const ProviderSettings = require("../models/ProviderSettings");
const logger = require("../utils/logger");

const PROVIDERS = Object.keys(config.providers);

class ApiKeyService {
  constructor() {
    this._cache = null;
  }

  async loadAll() {
    const dbSettings = await ProviderSettings.find({});
    const dbMap = {};
    for (const s of dbSettings) {
      dbMap[s.provider] = s;
    }

    const result = {};
    for (const provider of PROVIDERS) {
      const envCfg = config.providers[provider];
      const dbCfg = dbMap[provider];
      result[provider] = {
        apiKey: envCfg.apiKey || (dbCfg ? dbCfg.apiKey : null),
        baseUrl: envCfg.baseUrl || (dbCfg ? dbCfg.baseUrl : null),
        enabled: dbCfg ? dbCfg.enabled : true,
      };
    }
    this._cache = result;
    return result;
  }

  get(provider) {
    if (!this._cache) return null;
    return this._cache[provider] || null;
  }

  getAll() {
    if (!this._cache) return {};
    return { ...this._cache };
  }

  getEffectiveApiKey(provider) {
    const envKey = config.providers[provider]?.apiKey;
    if (envKey) return envKey;
    if (this._cache?.[provider]?.apiKey) return this._cache[provider].apiKey;
    return null;
  }

  async save(provider, { apiKey, baseUrl, enabled }) {
    const update = {};
    if (apiKey !== undefined) update.apiKey = apiKey || null;
    if (baseUrl !== undefined) update.baseUrl = baseUrl || null;
    if (enabled !== undefined) update.enabled = enabled;

    const doc = await ProviderSettings.findOneAndUpdate(
      { provider },
      { $set: update },
      { upsert: true, new: true }
    );

    if (this._cache) {
      this._cache[provider] = {
        apiKey: doc.apiKey || null,
        baseUrl: doc.baseUrl || null,
        enabled: doc.enabled,
      };
    }

    logger.info({ provider }, "Provider API key saved to database");
    return doc;
  }

  async delete(provider) {
    await ProviderSettings.deleteOne({ provider });
    if (this._cache) {
      this._cache[provider] = {
        apiKey: null,
        baseUrl: config.providers[provider]?.baseUrl || null,
        enabled: true,
      };
    }
    logger.info({ provider }, "Provider API key deleted from database");
  }
}

module.exports = new ApiKeyService();
