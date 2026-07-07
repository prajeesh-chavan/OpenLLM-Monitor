const Joi = require("joi");

const replayPromptSchema = Joi.object({
  prompt: Joi.string().required().min(1).max(100000).messages({
    "string.empty": "Prompt is required",
    "string.max": "Prompt exceeds maximum length of 100000 characters",
  }),
  provider: Joi.string()
    .valid("openai", "openrouter", "mistral", "ollama", "gemini", "grok")
    .required()
    .messages({
      "any.only": "Provider must be one of: openai, openrouter, mistral, ollama, gemini, grok",
    }),
  model: Joi.string().required().messages({
    "string.empty": "Model is required",
  }),
  systemMessage: Joi.string().allow("").max(10000).default(""),
  parameters: Joi.object({
    temperature: Joi.number().min(0).max(2).default(0.7),
    maxTokens: Joi.number().integer().min(1).max(100000),
    topP: Joi.number().min(0).max(1).default(1),
    frequencyPenalty: Joi.number().min(-2).max(2).default(0),
    presencePenalty: Joi.number().min(-2).max(2).default(0),
    stop: [Joi.string(), Joi.array().items(Joi.string())],
  }).default({}),
  originalLogId: Joi.string().allow(null),
});

const compareReplaysSchema = Joi.object({
  prompt: Joi.string().required().min(1).max(10000),
  configurations: Joi.array()
    .items(
      Joi.object({
        provider: Joi.string()
          .valid("openai", "openrouter", "mistral", "ollama", "gemini", "grok")
          .required(),
        model: Joi.string().required(),
        systemMessage: Joi.string().allow("").max(10000).default(""),
        parameters: Joi.object({
          temperature: Joi.number().min(0).max(2).default(0.7),
          maxTokens: Joi.number().integer().min(1).max(100000),
        }).default({}),
      })
    )
    .min(1)
    .max(5)
    .required(),
});

const costEstimateSchema = Joi.object({
  prompt: Joi.string().required().min(1).max(100000),
  provider: Joi.string()
    .valid("openai", "openrouter", "mistral", "ollama", "gemini", "grok")
    .required(),
  model: Joi.string().required(),
  maxTokens: Joi.number().integer().min(1).max(100000),
});

module.exports = {
  replayPromptSchema,
  compareReplaysSchema,
  costEstimateSchema,
};
