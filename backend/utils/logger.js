const pino = require("pino");
const config = require("../config/env");

const transport = config.isDevelopment
  ? {
      target: "pino/file",
      options: { destination: 1 },
    }
  : {
      target: "pino/file",
      options: { destination: 1 },
    };

const logger = pino({
  level: config.isDevelopment ? "debug" : "info",
  transport,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "body.apiKey",
      "body.api_key",
      "config.apiKey",
    ],
    censor: "[REDACTED]",
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      requestId: req.requestId,
      ip: req.ip,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      requestId: res.req?.requestId,
    }),
    err: pino.stdSerializers.err,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
