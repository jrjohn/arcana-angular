import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppError, ErrorType } from '../models/app-error';

/**
 * Error Handler Service
 * Converts various error types to AppError instances
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  /**
   * Handle any error and convert to AppError
   */
  handleError(error: unknown): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // HTTP Error
    if (error instanceof HttpErrorResponse) {
      return this.handleHttpError(error);
    }

    // Network Error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return new AppError(
        ErrorType.NETWORK_ERROR,
        'Network request failed',
        'Unable to connect to the server. Please check your internet connection.',
        error
      );
    }

    // Timeout Error
    if (error instanceof Error && error.name === 'TimeoutError') {
      return new AppError(
        ErrorType.TIMEOUT,
        'Request timeout',
        'The request took too long. Please try again.',
        error
      );
    }

    // Unknown Error
    return new AppError(
      ErrorType.UNKNOWN,
      error instanceof Error ? error.message : 'Unknown error occurred',
      'An unexpected error occurred. Please try again.',
      error
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleHttpError(error: HttpErrorResponse): AppError {
    const statusCode = error.status;
    let errorType: ErrorType;
    let message: string;
    let userMessage: string;

    switch (statusCode) {
      case 400:
        errorType = ErrorType.BAD_REQUEST;
        message = 'Bad request';
        userMessage = this.extractUserMessage(error) || 'Invalid request. Please check your input.';
        break;

      case 401:
        errorType = ErrorType.UNAUTHORIZED;
        message = 'Unauthorized';
        userMessage = 'You are not authorized. Please log in again.';
        break;

      case 403:
        errorType = ErrorType.FORBIDDEN;
        message = 'Forbidden';
        userMessage = 'You do not have permission to access this resource.';
        break;

      case 404:
        errorType = ErrorType.NOT_FOUND;
        message = 'Not found';
        userMessage = 'The requested resource was not found.';
        break;

      case 422:
        errorType = ErrorType.VALIDATION_ERROR;
        message = 'Validation error';
        userMessage = this.extractUserMessage(error) || 'Validation failed. Please check your input.';
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        errorType = ErrorType.SERVER_ERROR;
        message = 'Server error';
        userMessage = 'Server error occurred. Please try again later.';
        break;

      default:
        errorType = ErrorType.UNKNOWN;
        message = `HTTP error ${statusCode}`;
        userMessage = 'An error occurred. Please try again.';
    }

    return new AppError(errorType, message, userMessage, error, statusCode);
  }

  /**
   * Extract user message from HTTP error response
   */
  private extractUserMessage(error: HttpErrorResponse): string | undefined {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.error) {
      return error.error.error;
    }
    if (typeof error.error === 'string') {
      return error.error;
    }
    return undefined;
  }

  /**
   * Log error to console (in development) or external service (in production)
   */
  logError(error: AppError): void {
    // In development, log to console
    if (!this.isProduction()) {
      console.error('[AppError]', {
        type: error.type,
        message: error.message,
        userMessage: error.getUserMessage(),
        originalError: error.originalError,
        statusCode: error.statusCode,
      });
    }

    // In production, send to external logging service
    // TODO: Implement external logging (e.g., Sentry, LogRocket)
  }

  /**
   * Check if running in production
   */
  private isProduction(): boolean {
    return !window.location.hostname.includes('localhost');
  }
}
