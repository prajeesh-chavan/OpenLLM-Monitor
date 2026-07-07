class ApiResponse {
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static created(res, data) {
    return ApiResponse.success(res, data, 201);
  }

  static paginated(res, data, pagination) {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalCount: pagination.totalCount,
        totalPages: pagination.totalPages,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  }

  static error(res, message, statusCode = 500, details = null) {
    const body = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
    if (details) {
      body.details = details;
    }
    return res.status(statusCode).json(body);
  }

  static badRequest(res, message = "Bad request", details = null) {
    return ApiResponse.error(res, message, 400, details);
  }

  static unauthorized(res, message = "Unauthorized") {
    return ApiResponse.error(res, message, 401);
  }

  static forbidden(res, message = "Forbidden") {
    return ApiResponse.error(res, message, 403);
  }

  static notFound(res, message = "Resource not found") {
    return ApiResponse.error(res, message, 404);
  }

  static rateLimited(res, retryAfter, message = "Too many requests") {
    return res.status(429).json({
      success: false,
      error: message,
      retryAfter,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ApiResponse;
