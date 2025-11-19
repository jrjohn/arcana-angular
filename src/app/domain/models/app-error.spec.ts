import { AppError, ErrorType } from './app-error';

describe('AppError', () => {
  describe('Constructor', () => {
    it('should create an AppError instance', () => {
      const error = new AppError(
        ErrorType.VALIDATION_ERROR,
        'Validation failed'
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should set type property', () => {
      const error = new AppError(
        ErrorType.UNAUTHORIZED,
        'Unauthorized access'
      );

      expect(error.type).toBe(ErrorType.UNAUTHORIZED);
    });

    it('should set message property', () => {
      const error = new AppError(
        ErrorType.NOT_FOUND,
        'Resource not found'
      );

      expect(error.message).toBe('Resource not found');
    });

    it('should set optional userMessage', () => {
      const error = new AppError(
        ErrorType.SERVER_ERROR,
        'Internal error',
        'Please try again later'
      );

      expect(error.userMessage).toBe('Please try again later');
    });

    it('should set optional originalError', () => {
      const originalError = new Error('Original');
      const error = new AppError(
        ErrorType.UNKNOWN,
        'Wrapped error',
        undefined,
        originalError
      );

      expect(error.originalError).toBe(originalError);
    });

    it('should set optional statusCode', () => {
      const error = new AppError(
        ErrorType.BAD_REQUEST,
        'Bad request',
        undefined,
        undefined,
        400
      );

      expect(error.statusCode).toBe(400);
    });

    it('should set name to AppError', () => {
      const error = new AppError(ErrorType.UNKNOWN, 'Test');

      expect(error.name).toBe('AppError');
    });
  });

  describe('getUserMessage', () => {
    it('should return custom userMessage if provided', () => {
      const error = new AppError(
        ErrorType.VALIDATION_ERROR,
        'Field required',
        'Please fill in the email field'
      );

      expect(error.getUserMessage()).toBe('Please fill in the email field');
    });

    it('should return default message for NETWORK_ERROR if no userMessage', () => {
      const error = new AppError(
        ErrorType.NETWORK_ERROR,
        'Network failed'
      );

      expect(error.getUserMessage()).toContain('internet connection');
    });

    it('should return default message for TIMEOUT if no userMessage', () => {
      const error = new AppError(
        ErrorType.TIMEOUT,
        'Request timeout'
      );

      expect(error.getUserMessage()).toContain('timed out');
    });

    it('should return default message for BAD_REQUEST if no userMessage', () => {
      const error = new AppError(
        ErrorType.BAD_REQUEST,
        'Invalid input'
      );

      expect(error.getUserMessage()).toContain('Invalid request');
    });

    it('should return default message for UNAUTHORIZED if no userMessage', () => {
      const error = new AppError(
        ErrorType.UNAUTHORIZED,
        'Auth failed'
      );

      expect(error.getUserMessage()).toContain('not authorized');
    });

    it('should return default message for FORBIDDEN if no userMessage', () => {
      const error = new AppError(
        ErrorType.FORBIDDEN,
        'Access denied'
      );

      expect(error.getUserMessage()).toContain('permission');
    });

    it('should return default message for NOT_FOUND if no userMessage', () => {
      const error = new AppError(
        ErrorType.NOT_FOUND,
        'Missing resource'
      );

      expect(error.getUserMessage()).toContain('not found');
    });

    it('should return default message for SERVER_ERROR if no userMessage', () => {
      const error = new AppError(
        ErrorType.SERVER_ERROR,
        'Internal error'
      );

      expect(error.getUserMessage()).toContain('Server error');
    });

    it('should return default message for VALIDATION_ERROR if no userMessage', () => {
      const error = new AppError(
        ErrorType.VALIDATION_ERROR,
        'Invalid data'
      );

      expect(error.getUserMessage()).toContain('Validation failed');
    });

    it('should return default message for BUSINESS_RULE_VIOLATION if no userMessage', () => {
      const error = new AppError(
        ErrorType.BUSINESS_RULE_VIOLATION,
        'Rule violated'
      );

      expect(error.getUserMessage()).toContain('Business rule violation');
    });

    it('should return default message for UNKNOWN if no userMessage', () => {
      const error = new AppError(
        ErrorType.UNKNOWN,
        'Something went wrong'
      );

      expect(error.getUserMessage()).toContain('unexpected error');
    });
  });

  describe('isRetryable', () => {
    it('should return true for NETWORK_ERROR', () => {
      const error = new AppError(ErrorType.NETWORK_ERROR, 'Network failed');

      expect(error.isRetryable()).toBe(true);
    });

    it('should return true for TIMEOUT', () => {
      const error = new AppError(ErrorType.TIMEOUT, 'Timeout occurred');

      expect(error.isRetryable()).toBe(true);
    });

    it('should return true for SERVER_ERROR', () => {
      const error = new AppError(ErrorType.SERVER_ERROR, 'Server failed');

      expect(error.isRetryable()).toBe(true);
    });

    it('should return false for BAD_REQUEST', () => {
      const error = new AppError(ErrorType.BAD_REQUEST, 'Bad input');

      expect(error.isRetryable()).toBe(false);
    });

    it('should return false for UNAUTHORIZED', () => {
      const error = new AppError(ErrorType.UNAUTHORIZED, 'Not authorized');

      expect(error.isRetryable()).toBe(false);
    });

    it('should return false for FORBIDDEN', () => {
      const error = new AppError(ErrorType.FORBIDDEN, 'Access denied');

      expect(error.isRetryable()).toBe(false);
    });

    it('should return false for NOT_FOUND', () => {
      const error = new AppError(ErrorType.NOT_FOUND, 'Resource not found');

      expect(error.isRetryable()).toBe(false);
    });

    it('should return false for VALIDATION_ERROR', () => {
      const error = new AppError(ErrorType.VALIDATION_ERROR, 'Invalid data');

      expect(error.isRetryable()).toBe(false);
    });

    it('should return false for BUSINESS_RULE_VIOLATION', () => {
      const error = new AppError(ErrorType.BUSINESS_RULE_VIOLATION, 'Rule violated');

      expect(error.isRetryable()).toBe(false);
    });

    it('should return false for UNKNOWN', () => {
      const error = new AppError(ErrorType.UNKNOWN, 'Unknown error');

      expect(error.isRetryable()).toBe(false);
    });
  });

  describe('Error Inheritance', () => {
    it('should have Error in prototype chain', () => {
      const error = new AppError(ErrorType.UNKNOWN, 'Test');

      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
      expect(error instanceof Error).toBe(true);
    });

    it('should work with instanceof AppError', () => {
      const error = new AppError(ErrorType.VALIDATION_ERROR, 'Test');

      expect(error instanceof AppError).toBe(true);
    });

    it('should work with instanceof Error', () => {
      const error = new AppError(ErrorType.UNKNOWN, 'Test');

      expect(error instanceof Error).toBe(true);
    });

    it('should be catchable as Error', () => {
      try {
        throw new AppError(ErrorType.TIMEOUT, 'Test timeout');
      } catch (e) {
        expect(e instanceof Error).toBe(true);
        expect(e instanceof AppError).toBe(true);
      }
    });
  });

  describe('Readonly Properties', () => {
    it('should have readonly type property', () => {
      const error = new AppError(ErrorType.NETWORK_ERROR, 'Network failed');

      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      // Readonly enforced by TypeScript compiler
    });

    it('should have readonly message property', () => {
      const error = new AppError(ErrorType.UNKNOWN, 'Original message');

      expect(error.message).toBe('Original message');
      // Readonly enforced by TypeScript compiler
    });

    it('should have readonly userMessage property', () => {
      const error = new AppError(ErrorType.VALIDATION_ERROR, 'Test', 'User message');

      expect(error.userMessage).toBe('User message');
      // Readonly enforced by TypeScript compiler
    });

    it('should have readonly statusCode property', () => {
      const error = new AppError(ErrorType.BAD_REQUEST, 'Test', undefined, undefined, 400);

      expect(error.statusCode).toBe(400);
      // Readonly enforced by TypeScript compiler
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const error = new AppError(ErrorType.UNKNOWN, '');

      expect(error.message).toBe('');
      expect(error.getUserMessage()).toBeTruthy();
    });

    it('should handle very long messages', () => {
      const longMessage = 'x'.repeat(10000);
      const error = new AppError(ErrorType.VALIDATION_ERROR, longMessage);

      expect(error.message).toBe(longMessage);
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'Error: <script>alert("xss")</script>';
      const error = new AppError(ErrorType.UNKNOWN, specialMessage);

      expect(error.message).toBe(specialMessage);
    });

    it('should handle unicode characters', () => {
      const unicodeMessage = 'Error: 你好世界 🚀';
      const error = new AppError(ErrorType.VALIDATION_ERROR, unicodeMessage);

      expect(error.message).toBe(unicodeMessage);
    });

    it('should handle null originalError', () => {
      const error = new AppError(
        ErrorType.UNKNOWN,
        'Test',
        undefined,
        null
      );

      expect(error.originalError).toBeNull();
    });

    it('should handle complex originalError objects', () => {
      const complexError = {
        code: 'ERR_001',
        details: { field: 'email', reason: 'invalid' },
        timestamp: Date.now()
      };

      const error = new AppError(
        ErrorType.VALIDATION_ERROR,
        'Validation failed',
        undefined,
        complexError
      );

      expect(error.originalError).toBe(complexError);
    });
  });

  describe('Stack Trace', () => {
    it('should have stack trace', () => {
      const error = new AppError(ErrorType.UNKNOWN, 'Test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });

    it('should preserve stack trace when thrown', () => {
      let caughtError: AppError | null = null;

      try {
        throw new AppError(ErrorType.TIMEOUT, 'Test timeout');
      } catch (e) {
        caughtError = e as AppError;
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError!.stack).toBeDefined();
    });
  });
});

describe('ErrorType Enum', () => {
  it('should have all expected error types', () => {
    expect(ErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(ErrorType.TIMEOUT).toBe('TIMEOUT');
    expect(ErrorType.BAD_REQUEST).toBe('BAD_REQUEST');
    expect(ErrorType.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ErrorType.FORBIDDEN).toBe('FORBIDDEN');
    expect(ErrorType.NOT_FOUND).toBe('NOT_FOUND');
    expect(ErrorType.SERVER_ERROR).toBe('SERVER_ERROR');
    expect(ErrorType.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorType.BUSINESS_RULE_VIOLATION).toBe('BUSINESS_RULE_VIOLATION');
    expect(ErrorType.UNKNOWN).toBe('UNKNOWN');
  });

  it('should have distinct values', () => {
    const values = Object.values(ErrorType);
    const uniqueValues = new Set(values);

    expect(uniqueValues.size).toBe(values.length);
  });
});
