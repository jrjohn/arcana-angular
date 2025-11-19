import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let router: jasmine.SpyObj<Router>;

  const mockUser: AuthUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'Administrator',
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have no current user initially', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('should not be authenticated initially', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should have no token initially', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('Login', () => {
    it('should set authenticated state on successful login', async () => {
      const result = await service.login('test@example.com', 'password');

      expect(result).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()).toBeTruthy();
      expect(service.currentUser()?.email).toBe('test@example.com');
    });

    it('should generate and store token on login', async () => {
      await service.login('test@example.com', 'password');

      const token = service.getToken();
      expect(token).toBeTruthy();
      expect(token).toContain('mock-jwt-token-');
    });

    it('should persist user to localStorage on login', async () => {
      await service.login('test@example.com', 'password');

      const storedUser = localStorage.getItem('auth_user');
      expect(storedUser).toBeTruthy();

      const parsedUser = JSON.parse(storedUser!);
      expect(parsedUser.email).toBe('test@example.com');
    });

    it('should persist token to localStorage on login', async () => {
      await service.login('test@example.com', 'password');

      const storedToken = localStorage.getItem('auth_token');
      expect(storedToken).toBeTruthy();
      expect(storedToken).toContain('mock-jwt-token-');
    });

    it('should create user with correct properties', async () => {
      await service.login('admin@test.com', 'password');

      const user = service.currentUser();
      expect(user).toBeTruthy();
      expect(user?.id).toBe(1);
      expect(user?.name).toBe('John Doe');
      expect(user?.email).toBe('admin@test.com');
      expect(user?.avatar).toContain('pravatar.cc');
      expect(user?.role).toBe('Administrator');
    });
  });

  describe('Logout', () => {
    beforeEach(async () => {
      await service.login('test@example.com', 'password');
    });

    it('should clear authenticated state on logout', () => {
      service.logout();

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should clear current user on logout', () => {
      service.logout();

      expect(service.currentUser()).toBeNull();
    });

    it('should clear token on logout', () => {
      service.logout();

      expect(service.getToken()).toBeNull();
    });

    it('should remove user from localStorage on logout', () => {
      service.logout();

      const storedUser = localStorage.getItem('auth_user');
      expect(storedUser).toBeNull();
    });

    it('should remove token from localStorage on logout', () => {
      service.logout();

      const storedToken = localStorage.getItem('auth_token');
      expect(storedToken).toBeNull();
    });

    it('should navigate to login page on logout', () => {
      service.logout();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Persistence', () => {
    it('should restore user from localStorage on initialization', () => {
      // Store mock user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'mock-token-123');

      // Create new service instance
      const newService = new AuthService(router);

      expect(newService.currentUser()).toEqual(mockUser);
      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.getToken()).toBe('mock-token-123');
    });

    it('should handle corrupted user data in localStorage', () => {
      localStorage.setItem('auth_user', 'invalid-json');
      localStorage.setItem('auth_token', 'mock-token-123');

      const newService = new AuthService(router);

      expect(newService.currentUser()).toBeNull();
      expect(newService.isAuthenticated()).toBe(true); // Token is still valid
    });

    it('should handle missing user in localStorage', () => {
      localStorage.setItem('auth_token', 'mock-token-123');

      const newService = new AuthService(router);

      expect(newService.currentUser()).toBeNull();
      expect(newService.isAuthenticated()).toBe(true);
    });

    it('should handle missing token in localStorage', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      const newService = new AuthService(router);

      expect(newService.currentUser()).toEqual(mockUser);
      expect(newService.isAuthenticated()).toBe(false); // No token
    });
  });

  describe('Token Management', () => {
    it('should return null when no token is set', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return token after login', async () => {
      await service.login('test@example.com', 'password');

      const token = service.getToken();
      expect(token).toBeTruthy();
    });

    it('should generate unique tokens for different logins', async () => {
      await service.login('user1@example.com', 'password');
      const token1 = service.getToken();

      service.logout();

      await service.login('user2@example.com', 'password');
      const token2 = service.getToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('Computed Signals', () => {
    it('should react to authentication changes', async () => {
      expect(service.isAuthenticated()).toBe(false);

      await service.login('test@example.com', 'password');
      expect(service.isAuthenticated()).toBe(true);

      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should react to user changes', async () => {
      expect(service.currentUser()).toBeNull();

      await service.login('test@example.com', 'password');
      expect(service.currentUser()).toBeTruthy();

      service.logout();
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple login calls', async () => {
      await service.login('user1@example.com', 'password');
      const user1 = service.currentUser();

      await service.login('user2@example.com', 'password');
      const user2 = service.currentUser();

      expect(user1?.email).toBe('user1@example.com');
      expect(user2?.email).toBe('user2@example.com');
      expect(user1).not.toBe(user2);
    });

    it('should handle logout without login', () => {
      expect(() => service.logout()).not.toThrow();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should handle empty email in login', async () => {
      const result = await service.login('', 'password');

      expect(result).toBe(true); // Mock always succeeds
      expect(service.currentUser()?.email).toBe('');
    });
  });
});
