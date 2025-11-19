import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../domain/services/auth.service';

/**
 * Auth Interceptor (Functional)
 * Automatically injects authentication token into all HTTP requests
 *
 * Features:
 * - Auto-injects Bearer token for authenticated requests
 * - Skips injection for login/public endpoints
 * - Works with Angular's functional interceptor pattern
 *
 * @see https://angular.io/api/common/http/HttpInterceptorFn
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip auth token for public endpoints
  const publicEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  if (isPublicEndpoint) {
    return next(req);
  }

  // Get auth token
  const token = authService.getToken();

  // If no token, proceed without authentication
  if (!token) {
    return next(req);
  }

  // Clone request and add Authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
