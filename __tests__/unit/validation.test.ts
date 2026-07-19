import { z } from 'zod';

describe('Validation Tests', () => {
  describe('Email Validation', () => {
    const emailSchema = z.string().email('Invalid email format');

    it('should accept valid emails', () => {
      expect(() => emailSchema.parse('test@example.com')).not.toThrow();
      expect(() => emailSchema.parse('user.name+tag@domain.co.uk')).not.toThrow();
    });

    it('should reject invalid emails', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow();
      expect(() => emailSchema.parse('test@')).toThrow();
      expect(() => emailSchema.parse('@example.com')).toThrow();
    });
  });

  describe('Password Validation', () => {
    const passwordSchema = z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[a-z]/, 'Password must contain lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number');

    it('should accept strong passwords', () => {
      expect(() => passwordSchema.parse('ValidPassword123')).not.toThrow();
      expect(() => passwordSchema.parse('SecurePass456')).not.toThrow();
    });

    it('should reject weak passwords', () => {
      expect(() => passwordSchema.parse('weak')).toThrow();
      expect(() => passwordSchema.parse('noupperccase123')).toThrow();
      expect(() => passwordSchema.parse('NOLOWERCASE123')).toThrow();
      expect(() => passwordSchema.parse('NoNumbers')).toThrow();
    });
  });

  describe('URL Validation', () => {
    const urlSchema = z.string().url('Invalid URL format');

    it('should accept valid URLs', () => {
      expect(() => urlSchema.parse('https://example.com')).not.toThrow();
      expect(() => urlSchema.parse('http://localhost:3000')).not.toThrow();
    });

    it('should reject invalid URLs', () => {
      expect(() => urlSchema.parse('not-a-url')).toThrow();
      expect(() => urlSchema.parse('example.com')).toThrow();
    });
  });

  describe('Pagination Validation', () => {
    const paginationSchema = z.object({
      page: z.coerce.number().int().positive().optional().default(1),
      limit: z.coerce.number().int().min(1).max(100).optional().default(10)
    });

    it('should accept valid pagination params', () => {
      const result = paginationSchema.parse({ page: 1, limit: 10 });
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should apply defaults', () => {
      const result = paginationSchema.parse({});
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should reject limit exceeding max', () => {
      expect(() => paginationSchema.parse({ limit: 500 })).toThrow();
    });
  });
});
