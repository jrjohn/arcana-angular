/**
 * Error categories for application errors
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Application error model
 */
export interface AppError {
  code: string;
  message: string;
  category: ErrorCategory;
  userMessage: string;
  underlyingError?: Error;
  context?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Creates an AppError from an unknown error
 */
export function createAppError(
  error: unknown,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  userMessage?: string
): AppError {
  const timestamp = new Date();

  if (error instanceof Error) {
    return {
      code: category,
      message: error.message,
      category,
      userMessage: userMessage || getDefaultUserMessage(category),
      underlyingError: error,
      timestamp,
    };
  }

  return {
    code: category,
    message: String(error),
    category,
    userMessage: userMessage || getDefaultUserMessage(category),
    timestamp,
  };
}

/**
 * Gets default user-friendly message for error category
 * Returns translation key that should be translated by components
 */
function getDefaultUserMessage(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'error.network';
    case ErrorCategory.VALIDATION:
      return 'error.validation';
    case ErrorCategory.STORAGE:
      return 'error.storage';
    case ErrorCategory.AUTHENTICATION:
      return 'error.authentication';
    case ErrorCategory.AUTHORIZATION:
      return 'error.authorization';
    case ErrorCategory.NOT_FOUND:
      return 'error.not.found';
    default:
      return 'error.unknown';
  }
}
