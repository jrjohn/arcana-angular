import {
  AppError,
  ErrorCategory,
  createAppError,
} from './app-error.model';

describe('ErrorCategory', () => {
  it('should have NETWORK category', () => {
    expect(ErrorCategory.NETWORK).toBe('NETWORK');
  });

  it('should have VALIDATION category', () => {
    expect(ErrorCategory.VALIDATION).toBe('VALIDATION');
  });

  it('should have STORAGE category', () => {
    expect(ErrorCategory.STORAGE).toBe('STORAGE');
  });

  it('should have AUTHENTICATION category', () => {
    expect(ErrorCategory.AUTHENTICATION).toBe('AUTHENTICATION');
  });

  it('should have AUTHORIZATION category', () => {
    expect(ErrorCategory.AUTHORIZATION).toBe('AUTHORIZATION');
  });

  it('should have NOT_FOUND category', () => {
    expect(ErrorCategory.NOT_FOUND).toBe('NOT_FOUND');
  });

  it('should have UNKNOWN category', () => {
    expect(ErrorCategory.UNKNOWN).toBe('UNKNOWN');
  });
});

describe('createAppError', () => {
  it('should create AppError from an Error instance', () => {
    const original = new Error('Connection failed');
    const appError = createAppError(original, ErrorCategory.NETWORK);

    expect(appError.code).toBe(ErrorCategory.NETWORK);
    expect(appError.message).toBe('Connection failed');
    expect(appError.category).toBe(ErrorCategory.NETWORK);
    expect(appError.underlyingError).toBe(original);
    expect(appError.timestamp).toBeInstanceOf(Date);
  });

  it('should use default UNKNOWN category when not specified', () => {
    const original = new Error('Some error');
    const appError = createAppError(original);
    expect(appError.category).toBe(ErrorCategory.UNKNOWN);
  });

  it('should create AppError from a string error', () => {
    const appError = createAppError('something went wrong', ErrorCategory.VALIDATION);
    expect(appError.message).toBe('something went wrong');
    expect(appError.category).toBe(ErrorCategory.VALIDATION);
    expect(appError.underlyingError).toBeUndefined();
  });

  it('should use custom userMessage when provided', () => {
    const appError = createAppError(new Error('raw'), ErrorCategory.NETWORK, 'Custom user message');
    expect(appError.userMessage).toBe('Custom user message');
  });

  it('should use default user message for NETWORK category', () => {
    const appError = createAppError(new Error('network fail'), ErrorCategory.NETWORK);
    expect(appError.userMessage).toBe('error.network');
  });

  it('should use default user message for VALIDATION category', () => {
    const appError = createAppError(new Error('bad input'), ErrorCategory.VALIDATION);
    expect(appError.userMessage).toBe('error.validation');
  });

  it('should use default user message for STORAGE category', () => {
    const appError = createAppError(new Error('storage fail'), ErrorCategory.STORAGE);
    expect(appError.userMessage).toBe('error.storage');
  });

  it('should use default user message for AUTHENTICATION category', () => {
    const appError = createAppError(new Error('auth fail'), ErrorCategory.AUTHENTICATION);
    expect(appError.userMessage).toBe('error.authentication');
  });

  it('should use default user message for AUTHORIZATION category', () => {
    const appError = createAppError(new Error('forbidden'), ErrorCategory.AUTHORIZATION);
    expect(appError.userMessage).toBe('error.authorization');
  });

  it('should use default user message for NOT_FOUND category', () => {
    const appError = createAppError(new Error('not found'), ErrorCategory.NOT_FOUND);
    expect(appError.userMessage).toBe('error.not.found');
  });

  it('should use default user message for UNKNOWN category', () => {
    const appError = createAppError(new Error('unknown'), ErrorCategory.UNKNOWN);
    expect(appError.userMessage).toBe('error.unknown');
  });

  it('should set timestamp close to now', () => {
    const before = new Date();
    const appError = createAppError(new Error('timed'));
    const after = new Date();
    expect(appError.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(appError.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should accept context on a raw AppError object', () => {
    const appError: AppError = {
      code: 'E001',
      message: 'Something broke',
      category: ErrorCategory.UNKNOWN,
      userMessage: 'An error occurred',
      timestamp: new Date(),
      context: { userId: '42', action: 'delete' },
    };
    expect(appError.context?.['userId']).toBe('42');
  });
});
