import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../../domain/services/auth.service';
import { AnalyticsService } from '../../domain/services/analytics.service';
import { AppError, ErrorCategory } from '../../domain/entities/app-error.model';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let analytics: jasmine.SpyObj<AnalyticsService>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const analyticsSpy = jasmine.createSpyObj('AnalyticsService', ['trackError']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AnalyticsService, useValue: analyticsSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    analytics = TestBed.inject(AnalyticsService) as jasmine.SpyObj<AnalyticsService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should transform 400 Bad Request to VALIDATION AppError', (done) => {
    httpClient.get('/api/users').subscribe({
      error: (error: AppError) => {
        expect(error.category).toBe(ErrorCategory.VALIDATION);
        expect(error.userMessage).toBe('error.validation');
        expect(analytics.trackError).toHaveBeenCalledWith(jasmine.any(Object), undefined, jasmine.any(Object));
        done();
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.flush('Invalid data', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle 401 Unauthorized by logging out and redirecting', (done) => {
    httpClient.get('/api/users').subscribe({
      error: (error: AppError) => {
        expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
        expect(error.userMessage).toBe('error.authentication');
        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(analytics.trackError).toHaveBeenCalledWith(jasmine.any(Object), undefined, jasmine.any(Object));
        done();
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should transform 403 Forbidden to AUTHORIZATION AppError', (done) => {
    httpClient.get('/api/users').subscribe({
      error: (error: AppError) => {
        expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
        expect(error.userMessage).toBe('error.authorization');
        expect(analytics.trackError).toHaveBeenCalledWith(jasmine.any(Object), undefined, jasmine.any(Object));
        done();
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
  });

  it('should transform 404 Not Found to NOT_FOUND AppError', (done) => {
    httpClient.get('/api/users/999').subscribe({
      error: (error: AppError) => {
        expect(error.category).toBe(ErrorCategory.NOT_FOUND);
        expect(error.userMessage).toBe('error.not.found');
        expect(analytics.trackError).toHaveBeenCalledWith(jasmine.any(Object), undefined, jasmine.any(Object));
        done();
      }
    });

    const req = httpMock.expectOne('/api/users/999');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should transform 500 Internal Server Error to NETWORK AppError', (done) => {
    httpClient.get('/api/users').subscribe({
      error: (error: AppError) => {
        expect(error.category).toBe(ErrorCategory.NETWORK);
        expect(error.userMessage).toBe('error.server');
        expect(analytics.trackError).toHaveBeenCalledWith(jasmine.any(Object), undefined, jasmine.any(Object));
        done();
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should transform 502 Bad Gateway to NETWORK AppError', (done) => {
    httpClient.get('/api/users').subscribe({
      error: (error: AppError) => {
        expect(error.category).toBe(ErrorCategory.NETWORK);
        expect(error.userMessage).toBe('error.server');
        expect(analytics.trackError).toHaveBeenCalledWith(jasmine.any(Object), undefined, jasmine.any(Object));
        done();
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.flush('Bad Gateway', { status: 502, statusText: 'Bad Gateway' });
  });

  it('should transform 503 Service Unavailable to NETWORK AppError', (done) => {
    httpClient.get('/api/users').subscribe({
      error: (error: AppError) => {
        expect(error.category).toBe(ErrorCategory.NETWORK);
        expect(error.userMessage).toBe('error.server');
        expect(analytics.trackError).toHaveBeenCalledWith(jasmine.any(Object), undefined, jasmine.any(Object));
        done();
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.flush('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });
  });

  it('should transform status 0 (network error) to NETWORK AppError', (done) => {
    httpClient.get('/api/users').subscribe({
      error: (error: AppError) => {
        expect(error.category).toBe(ErrorCategory.NETWORK);
        expect(error.userMessage).toBe('error.network');
        expect(analytics.trackError).toHaveBeenCalledWith(jasmine.any(Object), undefined, jasmine.any(Object));
        done();
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.error(new ProgressEvent('error'), { status: 0 });
  });

  it('should attach HTTP context to AppError', (done) => {
    httpClient.get('/api/users').subscribe({
      error: (error: AppError) => {
        expect(error.context).toEqual(jasmine.objectContaining({
          status: 404,
          statusText: 'Not Found',
          url: '/api/users',
          method: 'GET'
        }));
        done();
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle unknown HTTP status codes', (done) => {
    httpClient.get('/api/users').subscribe({
      error: (error: AppError) => {
        expect(error.category).toBe(ErrorCategory.UNKNOWN);
        expect(error.userMessage).toBe('error.unknown');
        expect(analytics.trackError).toHaveBeenCalledWith(jasmine.any(Object), undefined, jasmine.any(Object));
        done();
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.flush('Unknown Error', { status: 418, statusText: "I'm a teapot" });
  });

  it('should track errors in analytics with correct codes', (done) => {
    httpClient.get('/api/users').subscribe({
      error: () => {
        expect(analytics.trackError).toHaveBeenCalledWith(jasmine.objectContaining({ category: jasmine.any(String) }), undefined, {
          url: '/api/users',
        });
        done();
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
