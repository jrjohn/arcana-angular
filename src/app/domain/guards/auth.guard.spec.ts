import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: any;
  let mockState: any;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: jasmine.createSpy('isAuthenticated')
    });
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockRoute = {
      url: '/protected',
      params: {},
      queryParams: {}
    };

    mockState = {
      url: '/protected/resource',
      root: mockRoute
    };
  });

  describe('Authentication Check', () => {
    it('should allow access when user is authenticated', () => {
      // Mock authenticated state
      Object.defineProperty(authService, 'isAuthenticated', {
        get: () => () => true
      });

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
      expect(router.createUrlTree).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not authenticated', () => {
      // Mock unauthenticated state
      Object.defineProperty(authService, 'isAuthenticated', {
        get: () => () => false
      });

      const mockUrlTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(mockUrlTree);

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(mockUrlTree);
      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/protected/resource' } }
      );
    });
  });

  describe('Return URL Handling', () => {
    beforeEach(() => {
      Object.defineProperty(authService, 'isAuthenticated', {
        get: () => () => false
      });
      router.createUrlTree.and.returnValue({} as UrlTree);
    });

    it('should preserve return URL for protected route', () => {
      mockState.url = '/users/123/edit';

      TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/users/123/edit' } }
      );
    });

    it('should handle root path', () => {
      mockState.url = '/';

      TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/' } }
      );
    });

    it('should handle nested routes', () => {
      mockState.url = '/admin/users/settings';

      TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/admin/users/settings' } }
      );
    });

    it('should handle routes with query parameters', () => {
      mockState.url = '/users?page=2&sort=name';

      TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/users?page=2&sort=name' } }
      );
    });

    it('should handle routes with fragments', () => {
      mockState.url = '/profile#settings';

      TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/profile#settings' } }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty route URL', () => {
      Object.defineProperty(authService, 'isAuthenticated', {
        get: () => () => false
      });
      router.createUrlTree.and.returnValue({} as UrlTree);

      mockState.url = '';

      TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(router.createUrlTree).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '' } }
      );
    });

    it('should work with different route activations', () => {
      Object.defineProperty(authService, 'isAuthenticated', {
        get: () => () => true
      });

      const result1 = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      Object.defineProperty(authService, 'isAuthenticated', {
        get: () => () => false
      });

      router.createUrlTree.and.returnValue({} as UrlTree);

      const result2 = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(result1).toBe(true);
      expect(result2).toBeInstanceOf(Object);
    });
  });

  describe('Integration with AuthService', () => {
    it('should call isAuthenticated signal', () => {
      const isAuthenticatedSpy = jasmine.createSpy('isAuthenticated').and.returnValue(true);
      Object.defineProperty(authService, 'isAuthenticated', {
        get: () => isAuthenticatedSpy
      });

      TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(isAuthenticatedSpy).toHaveBeenCalled();
    });

    it('should respect signal reactivity', () => {
      let authenticated = false;
      Object.defineProperty(authService, 'isAuthenticated', {
        get: () => () => authenticated
      });

      router.createUrlTree.and.returnValue({} as UrlTree);

      // First call - not authenticated
      const result1 = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(result1).toBeInstanceOf(Object);

      // Change state
      authenticated = true;

      // Second call - authenticated
      const result2 = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(result2).toBe(true);
    });
  });
});
