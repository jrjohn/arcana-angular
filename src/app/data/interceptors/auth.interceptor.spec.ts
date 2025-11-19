import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../../domain/services/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when token is available', () => {
    const mockToken = 'mock-jwt-token-123';
    authService.getToken.and.returnValue(mockToken);

    httpClient.get('/api/users').subscribe();

    const req = httpMock.expectOne('/api/users');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

    req.flush({ data: [] });
  });

  it('should not add Authorization header when token is null', () => {
    authService.getToken.and.returnValue(null);

    httpClient.get('/api/users').subscribe();

    const req = httpMock.expectOne('/api/users');
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({ data: [] });
  });

  it('should not add Authorization header for login endpoint', () => {
    const mockToken = 'mock-jwt-token-123';
    authService.getToken.and.returnValue(mockToken);

    httpClient.post('/auth/login', { email: 'test@example.com', password: 'password' }).subscribe();

    const req = httpMock.expectOne('/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({ token: 'new-token' });
  });

  it('should not add Authorization header for register endpoint', () => {
    const mockToken = 'mock-jwt-token-123';
    authService.getToken.and.returnValue(mockToken);

    httpClient.post('/auth/register', { email: 'test@example.com' }).subscribe();

    const req = httpMock.expectOne('/auth/register');
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({ success: true });
  });

  it('should not add Authorization header for refresh endpoint', () => {
    const mockToken = 'mock-jwt-token-123';
    authService.getToken.and.returnValue(mockToken);

    httpClient.post('/auth/refresh', {}).subscribe();

    const req = httpMock.expectOne('/auth/refresh');
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({ token: 'new-token' });
  });

  it('should handle multiple requests with different tokens', () => {
    const token1 = 'token-1';
    const token2 = 'token-2';

    authService.getToken.and.returnValue(token1);
    httpClient.get('/api/users').subscribe();
    const req1 = httpMock.expectOne('/api/users');
    expect(req1.request.headers.get('Authorization')).toBe(`Bearer ${token1}`);
    req1.flush({ data: [] });

    authService.getToken.and.returnValue(token2);
    httpClient.get('/api/projects').subscribe();
    const req2 = httpMock.expectOne('/api/projects');
    expect(req2.request.headers.get('Authorization')).toBe(`Bearer ${token2}`);
    req2.flush({ data: [] });
  });

  it('should not interfere with existing headers', () => {
    const mockToken = 'mock-jwt-token-123';
    authService.getToken.and.returnValue(mockToken);

    httpClient.get('/api/users', {
      headers: { 'X-Custom-Header': 'custom-value' }
    }).subscribe();

    const req = httpMock.expectOne('/api/users');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');

    req.flush({ data: [] });
  });
});
