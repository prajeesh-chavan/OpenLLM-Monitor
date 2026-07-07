const ApiResponse = require("../utils/apiResponse");

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      }));
      return ApiResponse.badRequest(res, "Validation failed", details);
    }

    req[source] = value;
    next();
  };
};

const validateQuery = (schema) => validate(schema, "query");
const validateParams = (schema) => validate(schema, "params");

module.exports = { validate, validateQuery, validateParams };
