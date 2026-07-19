/**
 * Global test setup
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '5000';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/grow_test';
process.env.EXPRESS_SESSION_SECRET = 'test-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:5000/api/v1/auth/google/callback';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
process.env.GOOGLE_CLIENT_ID = 'test-google-id';
process.env.JWT_ACCESS_SECRET = 'test-jwt-secret';
process.env.JWT_ACCESS_EXPIRES = '1h';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_REFRESH_EXPIRES = '7d';
process.env.SUPER_ADMIN_PASSWORD = 'AdminPassword123!';
process.env.SUPER_ADMIN = 'admin@test.com';
process.env.BCRYPT_SALT_ROUND = '10';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.EMAIL_HOST = 'smtp.test.com';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_USER = 'test@test.com';
process.env.EMAIL_PASS = 'test-password';
process.env.EMAIL_FROM = 'test@test.com';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
process.env.LIVEKIT_HOST = 'http://localhost:7880';
process.env.LIVEKIT_API_KEY = 'test-livekit-key';
process.env.LIVEKIT_API_SECRET = 'test-livekit-secret';
process.env.LOG_LEVEL = 'error';
process.env.DIRECT_URL = process.env.DIRECT_URL || 'postgresql://test:test@localhost:5432/grow_test';

// Suppress console output during tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
}

// Global timeout for tests
jest.setTimeout(10000);
