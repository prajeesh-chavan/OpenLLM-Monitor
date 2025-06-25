/**
 * Response caching middleware for Express
 * Caches GET requests to improve response times
 */

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const responseCache = (duration = CACHE_DURATION) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Create cache key
    const cacheKey = `${req.originalUrl}:${JSON.stringify(req.query)}`;

    // Check if response is cached
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < duration) {
      res.set("X-Cache-Hit", "true");
      return res.json(cachedResponse.data);
    }

    // Store original json function
    const originalJson = res.json;

    // Override json function to cache response
    res.json = function (data) {
      // Cache successful responses only
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });

        // Clean up old cache entries periodically
        if (cache.size > 100) {
          const cutoff = Date.now() - duration;
          for (const [key, value] of cache.entries()) {
            if (value.timestamp < cutoff) {
              cache.delete(key);
            }
          }
        }
      }

      res.set("X-Cache-Hit", "false");
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = responseCache;
