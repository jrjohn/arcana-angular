/**
 * Application Error Types
 */
export enum ErrorType {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // HTTP errors
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',

  // Business logic errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',

  // Unknown errors
  UNKNOWN = 'UNKNOWN',
}

/**
 * Application Error Class
 * Standardized error structure across the application
 */
export class AppError extends Error {
  constructor(
    public readonly type: ErrorType,
    public readonly message: string,
    public readonly userMessage?: string,
    public readonly originalError?: unknown,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return this.userMessage || this.getDefaultUserMessage();
  }

  /**
   * Get default user-friendly message based on error type
   */
  private getDefaultUserMessage(): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
      [ErrorType.TIMEOUT]: 'Request timed out. Please try again.',
      [ErrorType.BAD_REQUEST]: 'Invalid request. Please check your input.',
      [ErrorType.UNAUTHORIZED]: 'You are not authorized. Please log in.',
      [ErrorType.FORBIDDEN]: 'You do not have permission to perform this action.',
      [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorType.SERVER_ERROR]: 'Server error occurred. Please try again later.',
      [ErrorType.VALIDATION_ERROR]: 'Validation failed. Please check your input.',
      [ErrorType.BUSINESS_RULE_VIOLATION]: 'Business rule violation occurred.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };

    return messages[this.type] || messages[ErrorType.UNKNOWN];
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT,
      ErrorType.SERVER_ERROR,
    ].includes(this.type);
  }
}
