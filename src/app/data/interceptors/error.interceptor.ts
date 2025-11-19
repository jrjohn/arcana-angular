import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../domain/services/auth.service';
import { AnalyticsService } from '../../domain/services/analytics.service';
import { createAppError, ErrorCategory, AppError } from '../../domain/entities/app-error.model';

/**
 * Error Interceptor (Functional)
 * Centralized HTTP error handling for all API requests
 *
 * Features:
 * - Transforms HttpErrorResponse to AppError
 * - Handles 401 unauthorized (auto-logout)
 * - Tracks errors in analytics
 * - Provides consistent error structure across the app
 * - Returns translation-ready error messages
 *
 * @see https://angular.io/api/common/http/HttpInterceptorFn
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const analytics = inject(AnalyticsService);

  return next(req).pipe(
    catchError((error: unknown) => {
      let appError: AppError;

      if (error instanceof HttpErrorResponse) {
        // Log HTTP error details for debugging
        console.error('[ErrorInterceptor] HTTP Error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });

        // Handle specific HTTP status codes
        switch (error.status) {
          case 0:
            // Network error (offline, CORS, etc.)
            appError = createAppError(
              new Error('Network connection failed'),
              ErrorCategory.NETWORK,
              'error.network'
            );
            analytics.trackError(appError, undefined, { url: error.url });
            break;

          case 401:
            // Unauthorized - auto logout and redirect to login
            console.warn('[ErrorInterceptor] Unauthorized request - logging out');
            authService.logout();
            router.navigate(['/login']);
            appError = createAppError(
              new Error('Authentication required'),
              ErrorCategory.AUTHENTICATION,
              'error.authentication'
            );
            analytics.trackError(appError, undefined, { url: error.url });
            break;

          case 403:
            // Forbidden - user doesn't have permission
            appError = createAppError(
              new Error('Insufficient permissions'),
              ErrorCategory.AUTHORIZATION,
              'error.authorization'
            );
            analytics.trackError(appError, undefined, { url: error.url });
            break;

          case 404:
            // Not Found
            appError = createAppError(
              new Error('Resource not found'),
              ErrorCategory.NOT_FOUND,
              'error.not.found'
            );
            analytics.trackError(appError, undefined, { url: error.url });
            break;

          case 400:
            // Validation error
            appError = createAppError(
              new Error('Invalid request data'),
              ErrorCategory.VALIDATION,
              'error.validation'
            );
            analytics.trackError(appError, undefined, { url: error.url });
            break;

          case 500:
          case 502:
          case 503:
          case 504:
            // Server errors
            appError = createAppError(
              new Error('Server error occurred'),
              ErrorCategory.NETWORK,
              'error.server'
            );
            analytics.trackError(appError, undefined, {
              url: error.url,
              status: error.status
            });
            break;

          default:
            // Unknown HTTP error
            appError = createAppError(
              new Error(`HTTP ${error.status}: ${error.statusText}`),
              ErrorCategory.UNKNOWN,
              'error.unknown'
            );
            analytics.trackError(appError, undefined, {
              url: error.url,
              status: error.status
            });
        }

        // Attach HTTP context
        appError.context = {
          ...appError.context,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          method: req.method
        };

      } else if (error instanceof Error) {
        // JavaScript error
        console.error('[ErrorInterceptor] JavaScript Error:', error);
        appError = createAppError(error, ErrorCategory.UNKNOWN, 'error.unknown');
        analytics.trackError(appError, undefined, { message: error.message });

      } else {
        // Unknown error type
        console.error('[ErrorInterceptor] Unknown Error:', error);
        appError = createAppError(
          new Error('An unexpected error occurred'),
          ErrorCategory.UNKNOWN,
          'error.unknown'
        );
        analytics.trackError(appError, undefined, { error: String(error) });
      }

      // Return transformed error
      return throwError(() => appError);
    })
  );
};
