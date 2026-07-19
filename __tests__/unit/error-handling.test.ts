import AppError from '../../src/app/errorHelper/AppError';

describe('Error Handling', () => {
  describe('AppError Class', () => {
    it('should create an error with status code and message', () => {
      const error = new AppError(404, 'Not found');
      expect(error.statusCode).toEqual(404);
      expect(error.message).toEqual('Not found');
    });

    it('should handle 400 Bad Request', () => {
      const error = new AppError(400, 'Invalid input');
      expect(error.statusCode).toEqual(400);
      expect(error.message).toEqual('Invalid input');
    });

    it('should handle 401 Unauthorized', () => {
      const error = new AppError(401, 'Unauthorized access');
      expect(error.statusCode).toEqual(401);
    });

    it('should handle 403 Forbidden', () => {
      const error = new AppError(403, 'Access forbidden');
      expect(error.statusCode).toEqual(403);
    });

    it('should handle 500 Internal Server Error', () => {
      const error = new AppError(500, 'Internal server error');
      expect(error.statusCode).toEqual(500);
    });
  });

  describe('HTTP Status Codes', () => {
    it('should distinguish between client and server errors', () => {
      const clientError = new AppError(400, 'Bad request');
      const serverError = new AppError(500, 'Server error');

      expect(clientError.statusCode).toBeLessThan(500);
      expect(serverError.statusCode).toBeGreaterThanOrEqual(500);
    });
  });

  describe('Error Messages', () => {
    it('should provide clear error descriptions', () => {
      const errors = [
        { code: 400, msg: 'Email already exists' },
        { code: 401, msg: 'Invalid credentials' },
        { code: 403, msg: 'Insufficient permissions' },
        { code: 404, msg: 'Resource not found' }
      ];

      errors.forEach(({ code, msg }) => {
        const error = new AppError(code, msg);
        expect(error.message).toEqual(msg);
        expect(error.statusCode).toEqual(code);
      });
    });
  });
});
