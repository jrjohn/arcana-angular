import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { AppError, ErrorType } from '../models/app-error';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorHandlerService]
    });

    service = TestBed.inject(ErrorHandlerService);
    consoleErrorSpy = spyOn(console, 'error');
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('AppError Handling', () => {
    it('should return AppError unchanged if already an AppError', () => {
      const appError = new AppError(
        ErrorType.VALIDATION_ERROR,
        'Test error',
        'User message'
      );

      const result = service.handleError(appError);

      expect(result).toBe(appError);
      expect(result.type).toBe(ErrorType.VALIDATION_ERROR);
    });
  });

  describe('HTTP Error Handling', () => {
    it('should convert HTTP 400 to BAD_REQUEST error', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid input' }
      });

      const result = service.handleError(httpError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.type).toBe(ErrorType.BAD_REQUEST);
      expect(result.statusCode).toBe(400);
      expect(result.getUserMessage()).toContain('Invalid input');
    });

    it('should convert HTTP 401 to UNAUTHORIZED error', () => {
      const httpError = new HttpErrorResponse({ status: 401 });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.UNAUTHORIZED);
      expect(result.getUserMessage()).toContain('not authorized');
      expect(result.statusCode).toBe(401);
    });

    it('should convert HTTP 403 to FORBIDDEN error', () => {
      const httpError = new HttpErrorResponse({ status: 403 });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.FORBIDDEN);
      expect(result.getUserMessage()).toContain('permission');
      expect(result.statusCode).toBe(403);
    });

    it('should convert HTTP 404 to NOT_FOUND error', () => {
      const httpError = new HttpErrorResponse({ status: 404 });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.NOT_FOUND);
      expect(result.getUserMessage()).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should convert HTTP 422 to VALIDATION_ERROR', () => {
      const httpError = new HttpErrorResponse({
        status: 422,
        error: { message: 'Email already exists' }
      });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(result.getUserMessage()).toContain('Email already exists');
      expect(result.statusCode).toBe(422);
    });

    it('should convert HTTP 500 to SERVER_ERROR', () => {
      const httpError = new HttpErrorResponse({ status: 500 });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.SERVER_ERROR);
      expect(result.getUserMessage()).toContain('Server error');
      expect(result.statusCode).toBe(500);
    });

    it('should convert HTTP 502 to SERVER_ERROR', () => {
      const httpError = new HttpErrorResponse({ status: 502 });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.SERVER_ERROR);
      expect(result.statusCode).toBe(502);
    });

    it('should convert HTTP 503 to SERVER_ERROR', () => {
      const httpError = new HttpErrorResponse({ status: 503 });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.SERVER_ERROR);
      expect(result.statusCode).toBe(503);
    });

    it('should convert HTTP 504 to SERVER_ERROR', () => {
      const httpError = new HttpErrorResponse({ status: 504 });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.SERVER_ERROR);
      expect(result.statusCode).toBe(504);
    });

    it('should convert unknown HTTP status to UNKNOWN error', () => {
      const httpError = new HttpErrorResponse({ status: 418 });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.statusCode).toBe(418);
    });

    it('should extract message from error.message', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: { message: 'Custom error message' }
      });

      const result = service.handleError(httpError);

      expect(result.getUserMessage()).toBe('Custom error message');
    });

    it('should extract message from error.error', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: { error: 'Another error format' }
      });

      const result = service.handleError(httpError);

      expect(result.getUserMessage()).toBe('Another error format');
    });

    it('should extract message from string error', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: 'Plain string error'
      });

      const result = service.handleError(httpError);

      expect(result.getUserMessage()).toBe('Plain string error');
    });

    it('should use default message if no error message found', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: {}
      });

      const result = service.handleError(httpError);

      expect(result.getUserMessage()).toContain('Invalid request');
    });
  });

  describe('Network Error Handling', () => {
    it('should convert TypeError with "Failed to fetch" to NETWORK_ERROR', () => {
      const networkError = new TypeError('Failed to fetch');

      const result = service.handleError(networkError);

      expect(result.type).toBe(ErrorType.NETWORK_ERROR);
      expect(result.getUserMessage()).toContain('internet connection');
      expect(result.originalError).toBe(networkError);
    });

    it('should handle TypeError without "Failed to fetch" as UNKNOWN', () => {
      const typeError = new TypeError('Some other type error');

      const result = service.handleError(typeError);

      expect(result.type).toBe(ErrorType.UNKNOWN);
    });
  });

  describe('Timeout Error Handling', () => {
    it('should convert TimeoutError to TIMEOUT error', () => {
      const timeoutError = new Error('Request timed out');
      timeoutError.name = 'TimeoutError';

      const result = service.handleError(timeoutError);

      expect(result.type).toBe(ErrorType.TIMEOUT);
      expect(result.getUserMessage()).toContain('try again');
      expect(result.originalError).toBe(timeoutError);
    });
  });

  describe('Unknown Error Handling', () => {
    it('should convert generic Error to UNKNOWN error', () => {
      const genericError = new Error('Something went wrong');

      const result = service.handleError(genericError);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('Something went wrong');
      expect(result.getUserMessage()).toContain('unexpected error');
    });

    it('should handle non-Error objects', () => {
      const unknownError = { foo: 'bar' };

      const result = service.handleError(unknownError);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('Unknown error occurred');
      expect(result.originalError).toBe(unknownError);
    });

    it('should handle null error', () => {
      const result = service.handleError(null);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('Unknown error occurred');
    });

    it('should handle undefined error', () => {
      const result = service.handleError(undefined);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('Unknown error occurred');
    });

    it('should handle string error', () => {
      const result = service.handleError('String error');

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('Unknown error occurred');
    });

    it('should handle number error', () => {
      const result = service.handleError(404);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('Unknown error occurred');
    });
  });

  describe('Error Logging', () => {
    it('should log error to console in development', () => {
      // In test environment, logging should work (localhost)
      const appError = new AppError(
        ErrorType.VALIDATION_ERROR,
        'Test error',
        'User message'
      );

      service.logError(appError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AppError]',
        jasmine.objectContaining({
          type: ErrorType.VALIDATION_ERROR,
          message: 'Test error',
          userMessage: 'User message'
        })
      );
    });

    it('should log error with original error details', () => {
      const originalError = new Error('Original error');
      const appError = new AppError(
        ErrorType.SERVER_ERROR,
        'Server failed',
        'Please try again',
        originalError,
        500
      );

      service.logError(appError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AppError]',
        jasmine.objectContaining({
          originalError: originalError,
          statusCode: 500
        })
      );
    });
  });

  describe('Complex Error Scenarios', () => {
    it('should handle HTTP error with nested error structure', () => {
      const httpError = new HttpErrorResponse({
        status: 422,
        error: {
          errors: {
            email: ['Email is required', 'Email must be valid'],
            password: ['Password too short']
          },
          message: 'Validation failed'
        }
      });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(result.getUserMessage()).toBe('Validation failed');
    });

    it('should handle HTTP error with HTML error page', () => {
      const httpError = new HttpErrorResponse({
        status: 500,
        error: '<!DOCTYPE html><html>Error page</html>'
      });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.SERVER_ERROR);
      // HTML error pages should use default server error message
      expect(result.getUserMessage()).toContain('Server error');
    });

    it('should preserve original error for debugging', () => {
      const originalError = new HttpErrorResponse({ status: 401 });
      const result = service.handleError(originalError);

      expect(result.originalError).toBe(originalError);
    });

    it('should handle chain of errors', () => {
      const httpError = new HttpErrorResponse({ status: 401 });
      const appError1 = service.handleError(httpError);
      const appError2 = service.handleError(appError1);

      expect(appError2).toBe(appError1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle HTTP error with status 0 (network failure)', () => {
      const httpError = new HttpErrorResponse({ status: 0 });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.statusCode).toBe(0);
    });

    it('should handle HTTP error with negative status', () => {
      const httpError = new HttpErrorResponse({ status: -1 });

      const result = service.handleError(httpError);

      expect(result.type).toBe(ErrorType.UNKNOWN);
    });

    it('should handle error with circular reference', () => {
      const circularError: any = { message: 'Circular' };
      circularError.self = circularError;

      expect(() => service.handleError(circularError)).not.toThrow();
    });
  });
});
