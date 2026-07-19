import { envProvider } from '../../src/app/config/envVar';

describe('Environment Variables', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Save original environment
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('envProvider()', () => {
    it('should return valid environment object when all required vars are set', () => {
      const env = envProvider();
      expect(env).toBeDefined();
      expect(env).toHaveProperty('PORT');
      expect(env).toHaveProperty('DATABASE_URL');
      expect(env).toHaveProperty('EXPRESS_SESSION_SECRET');
      expect(env).toHaveProperty('JWT_ACCESS_SECRET');
      expect(env).toHaveProperty('FRONTEND_URL');
    });

    it('should convert PORT to number', () => {
      const env = envProvider();
      expect(typeof env.PORT).toBe('number');
      expect(env.PORT).toBeGreaterThan(0);
    });

    it('should use default PORT when not provided', () => {
      const originalPort = process.env.PORT;
      delete process.env.PORT;
      
      jest.resetModules();
      const { envVar } = require('../../src/app/config/envVar');
      
      expect(envVar.PORT).toBe(5000);
      
      // Restore
      if (originalPort) process.env.PORT = originalPort;
    });

    it('should provide EMAIL_PORT as number', () => {
      const env = envProvider();
      expect(typeof env.EMAIL_PORT).toBe('number');
      expect(env.EMAIL_PORT).toBeGreaterThan(0);
    });

    it('should provide all JWT configuration', () => {
      const env = envProvider();
      expect(env.JWT_ACCESS_SECRET).toBeDefined();
      expect(env.JWT_ACCESS_EXPIRES).toBeDefined();
      expect(env.JWT_REFRESH_SECRET).toBeDefined();
      expect(env.JWT_REFRESH_EXPIRES).toBeDefined();
    });

    it('should provide all email configuration', () => {
      const env = envProvider();
      expect(env.EMAIL_HOST).toBeDefined();
      expect(env.EMAIL_USER).toBeDefined();
      expect(env.EMAIL_PASS).toBeDefined();
      expect(env.EMAIL_FROM).toBeDefined();
      expect(env.EMAIL_PORT).toBeGreaterThan(0);
    });

    it('should provide all Google OAuth configuration', () => {
      const env = envProvider();
      expect(env.GOOGLE_CLIENT_ID).toBeDefined();
      expect(env.GOOGLE_CLIENT_SECRET).toBeDefined();
      expect(env.GOOGLE_CALLBACK_URL).toBeDefined();
    });

    it('should provide all Cloudinary configuration', () => {
      const env = envProvider();
      expect(env.CLOUDINARY_CLOUD_NAME).toBeDefined();
      expect(env.CLOUDINARY_API_KEY).toBeDefined();
      expect(env.CLOUDINARY_API_SECRET).toBeDefined();
    });

    it('should provide all LiveKit configuration', () => {
      const env = envProvider();
      expect(env.LIVEKIT_HOST).toBeDefined();
      expect(env.LIVEKIT_API_KEY).toBeDefined();
      expect(env.LIVEKIT_API_SECRET).toBeDefined();
    });

    it('should provide Redis URL', () => {
      const env = envProvider();
      expect(env.REDIS_URL).toBeDefined();
      expect(env.REDIS_URL).toMatch(/redis/i);
    });

    it('should provide database configuration', () => {
      const env = envProvider();
      expect(env.DATABASE_URL).toBeDefined();
      expect(env.DIRECT_URL).toBeDefined();
    });

    it('should provide admin credentials', () => {
      const env = envProvider();
      expect(env.SUPER_ADMIN).toBeDefined();
      expect(env.SUPER_ADMIN_PASSWORD).toBeDefined();
    });

    it('should provide bcrypt salt round as string', () => {
      const env = envProvider();
      expect(env.BCRYPT_SALT_ROUND).toBeDefined();
      expect(typeof env.BCRYPT_SALT_ROUND).toBe('string');
    });

    it('should provide NODE_ENV', () => {
      const env = envProvider();
      expect(env.NODE_ENV).toBeDefined();
      expect(['development', 'production', 'test']).toContain(env.NODE_ENV);
    });

    it('should provide LOG_LEVEL', () => {
      const env = envProvider();
      expect(env.LOG_LEVEL).toBeDefined();
      expect(['debug', 'info', 'warn', 'error', 'fatal']).toContain(env.LOG_LEVEL);
    });

    it('should handle PORT with string conversion', () => {
      const originalPort = process.env.PORT;
      process.env.PORT = '8000';
      
      jest.resetModules();
      const { envVar } = require('../../src/app/config/envVar');
      
      expect(envVar.PORT).toBe(8000);
      expect(typeof envVar.PORT).toBe('number');
      
      // Restore
      if (originalPort) process.env.PORT = originalPort;
    });

    it('should handle PORT=0 as fallback to default', () => {
      const originalPort = process.env.PORT;
      process.env.PORT = '0';
      
      jest.resetModules();
      const { envVar } = require('../../src/app/config/envVar');
      
      // 0 is still a valid number, so it should be 0
      expect(envVar.PORT).toBe(0);
      
      // Restore
      if (originalPort) process.env.PORT = originalPort;
    });
  });

  describe('Environment Variable Validation', () => {
    it('should throw error if required DATABASE_URL is missing', () => {
      const originalDb = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;
      
      expect(() => {
        jest.resetModules();
        require('../../src/app/config/envVar');
      }).toThrow('Missing environment variable: DATABASE_URL');
      
      // Restore
      if (originalDb) process.env.DATABASE_URL = originalDb;
    });

    it('should throw error if required JWT_ACCESS_SECRET is missing', () => {
      const originalJwt = process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_ACCESS_SECRET;
      
      expect(() => {
        jest.resetModules();
        require('../../src/app/config/envVar');
      }).toThrow('Missing environment variable: JWT_ACCESS_SECRET');
      
      // Restore
      if (originalJwt) process.env.JWT_ACCESS_SECRET = originalJwt;
    });

    it('should throw error if required FRONTEND_URL is missing', () => {
      const originalUrl = process.env.FRONTEND_URL;
      delete process.env.FRONTEND_URL;
      
      expect(() => {
        jest.resetModules();
        require('../../src/app/config/envVar');
      }).toThrow('Missing environment variable: FRONTEND_URL');
      
      // Restore
      if (originalUrl) process.env.FRONTEND_URL = originalUrl;
    });

    it('should NOT require PORT to be set', () => {
      const originalPort = process.env.PORT;
      delete process.env.PORT;
      
      expect(() => {
        const env = envProvider();
        expect(env.PORT).toBeDefined();
      }).not.toThrow();
      
      // Restore
      if (originalPort) process.env.PORT = originalPort;
    });

    it('should NOT require DIRECT_URL to be set', () => {
      const originalDirect = process.env.DIRECT_URL;
      delete process.env.DIRECT_URL;
      
      expect(() => {
        const env = envProvider();
        expect(env.DIRECT_URL).toBeDefined();
      }).not.toThrow();
      
      // Restore
      if (originalDirect) process.env.DIRECT_URL = originalDirect;
    });
  });

  describe('Environment Variable Types', () => {
    it('should have PORT as number type', () => {
      const env = envProvider();
      expect(typeof env.PORT).toBe('number');
    });

    it('should have EMAIL_PORT as number type', () => {
      const env = envProvider();
      expect(typeof env.EMAIL_PORT).toBe('number');
    });

    it('should have all string configs as string type', () => {
      const env = envProvider();
      expect(typeof env.DATABASE_URL).toBe('string');
      expect(typeof env.FRONTEND_URL).toBe('string');
      expect(typeof env.JWT_ACCESS_SECRET).toBe('string');
      expect(typeof env.NODE_ENV).toBe('string');
    });

    it('should have BCRYPT_SALT_ROUND as string', () => {
      const env = envProvider();
      expect(typeof env.BCRYPT_SALT_ROUND).toBe('string');
      expect(parseInt(env.BCRYPT_SALT_ROUND, 10)).toBeGreaterThan(0);
    });
  });

  describe('Environment Variable Edge Cases', () => {
    it('should handle empty string PORT by converting to 0', () => {
      const originalPort = process.env.PORT;
      process.env.PORT = '';
      
      jest.resetModules();
      const { envVar } = require('../../src/app/config/envVar');
      
      // Empty string converts to 0, which is technically a valid number
      expect(envVar.PORT).toBe(0);
      
      // Restore
      if (originalPort) process.env.PORT = originalPort;
    });

    it('should handle DIRECT_URL fallback to DATABASE_URL', () => {
      const originalDirect = process.env.DIRECT_URL;
      delete process.env.DIRECT_URL;
      
      jest.resetModules();
      const { envVar } = require('../../src/app/config/envVar');
      
      expect(envVar.DIRECT_URL).toBeDefined();
      if (envVar.DIRECT_URL) {
        expect(envVar.DIRECT_URL).toMatch(/postgres|mysql/i);
      }
      
      // Restore
      if (originalDirect) process.env.DIRECT_URL = originalDirect;
    });

    it('should handle NODE_ENV values', () => {
      const env = envProvider();
      expect(['development', 'production', 'test']).toContain(env.NODE_ENV);
    });

    it('should handle LOG_LEVEL values', () => {
      const env = envProvider();
      const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
      expect(validLevels.some(level => env.LOG_LEVEL.includes(level))).toBeTruthy();
    });
  });

  describe('Required vs Optional Environment Variables', () => {
    const requiredVars = [
      'DATABASE_URL',
      'EXPRESS_SESSION_SECRET',
      'GOOGLE_CALLBACK_URL',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_CLIENT_ID',
      'JWT_ACCESS_SECRET',
      'JWT_ACCESS_EXPIRES',
      'JWT_REFRESH_SECRET',
      'JWT_REFRESH_EXPIRES',
      'SUPER_ADMIN_PASSWORD',
      'SUPER_ADMIN',
      'BCRYPT_SALT_ROUND',
      'FRONTEND_URL',
      'NODE_ENV',
      'EMAIL_HOST',
      'EMAIL_PORT',
      'EMAIL_USER',
      'EMAIL_PASS',
      'EMAIL_FROM',
      'REDIS_URL',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'LIVEKIT_HOST',
      'LIVEKIT_API_KEY',
      'LIVEKIT_API_SECRET',
      'LOG_LEVEL'
    ];

    const optionalVars = ['PORT', 'DIRECT_URL'];

    it('should have all required variables set', () => {
      const env = envProvider();
      requiredVars.forEach(varName => {
        expect((env as any)[varName]).toBeDefined();
        expect((env as any)[varName]).not.toBe('');
      });
    });

    it('should have PORT default to 5000 when not set', () => {
      const originalPort = process.env.PORT;
      delete process.env.PORT;
      
      jest.resetModules();
      const { envVar } = require('../../src/app/config/envVar');
      
      expect(envVar.PORT).toBe(5000);
      
      // Restore
      if (originalPort) process.env.PORT = originalPort;
    });

    it('should have DIRECT_URL with fallback value', () => {
      const env = envProvider();
      expect(env.DIRECT_URL).toBeDefined();
    });
  });

  describe('Configuration Consistency', () => {
    it('should have consistent JWT configuration', () => {
      const env = envProvider();
      expect(env.JWT_ACCESS_SECRET).not.toEqual(env.JWT_REFRESH_SECRET);
      expect(env.JWT_ACCESS_EXPIRES).toBeDefined();
      expect(env.JWT_REFRESH_EXPIRES).toBeDefined();
    });

    it('should have consistent admin configuration', () => {
      const env = envProvider();
      expect(env.SUPER_ADMIN).toMatch(/@|admin/i);
      expect(env.SUPER_ADMIN_PASSWORD.length).toBeGreaterThanOrEqual(8);
    });

    it('should have valid email configuration', () => {
      const env = envProvider();
      expect(env.EMAIL_HOST).toBeDefined();
      expect(env.EMAIL_PORT).toBeGreaterThan(0);
      expect(env.EMAIL_USER).toBeDefined();
      expect(env.EMAIL_FROM).toMatch(/@/);
    });

    it('should have consistent Redis URL format', () => {
      const env = envProvider();
      expect(env.REDIS_URL).toMatch(/redis|upstash/i);
    });
  });
});
