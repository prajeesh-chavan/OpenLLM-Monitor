process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-for-testing";
process.env.ENCRYPTION_KEY = "test-encryption-key-32-chars-long!!";
process.env.MONGODB_URI = "mongodb://localhost:27017/openllm-monitor-test";
process.env.LOG_RETENTION_DAYS = "30";

jest.setTimeout(30000);
