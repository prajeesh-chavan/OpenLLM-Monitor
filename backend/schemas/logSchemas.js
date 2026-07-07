const Joi = require("joi");

const createLogSchema = Joi.object({
  requestId: Joi.string(),
  provider: Joi.string()
    .valid("openai", "openrouter", "mistral", "ollama", "gemini", "grok")
    .required(),
  model: Joi.string().required(),
  prompt: Joi.string().allow("").max(100000),
  completion: Joi.string().allow("").max(100000),
  status: Joi.string()
    .valid("success", "error", "timeout", "rate_limited")
    .default("success"),
  latency: Joi.number().min(0).default(0),
  tokenUsage: Joi.object({
    promptTokens: Joi.number().integer().min(0).default(0),
    completionTokens: Joi.number().integer().min(0).default(0),
    totalTokens: Joi.number().integer().min(0).default(0),
  }).default({ promptTokens: 0, completionTokens: 0, totalTokens: 0 }),
  cost: Joi.object({
    promptCost: Joi.number().min(0).default(0),
    completionCost: Joi.number().min(0).default(0),
    totalCost: Joi.number().min(0).default(0),
  }).default({ promptCost: 0, completionCost: 0, totalCost: 0, currency: "USD" }),
  error: Joi.object({
    message: Joi.string().allow(""),
    code: Joi.string().allow(""),
  }),
});

const updateLogSchema = Joi.object({
  status: Joi.string().valid("success", "error", "timeout", "rate_limited"),
  latency: Joi.number().min(0),
  completion: Joi.string().allow("").max(100000),
  error: Joi.object({
    message: Joi.string().allow(""),
    code: Joi.string().allow(""),
  }),
}).min(1);

const bulkDeleteSchema = Joi.object({
  ids: Joi.array().items(Joi.string()).min(1),
  olderThan: Joi.date().iso(),
}).or("ids", "olderThan");

const logQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  provider: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  model: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  status: Joi.alternatives().try(
    Joi.string().valid("success", "error", "timeout", "rate_limited"),
    Joi.array().items(Joi.string())
  ),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  sortBy: Joi.string().valid("createdAt", "latency", "cost.totalCost", "tokenUsage.totalTokens").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().allow("").max(200),
});

const logIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid log ID format",
    }),
});

module.exports = {
  createLogSchema,
  updateLogSchema,
  bulkDeleteSchema,
  logQuerySchema,
  logIdParamSchema,
};
