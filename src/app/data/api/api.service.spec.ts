import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { ErrorCategory } from '../../domain/entities/app-error.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should perform GET request', (done) => {
      const mockData = { id: 1, name: 'Test' };

      service.get<typeof mockData>('/test').subscribe({
        next: (data) => {
          expect(data).toEqual(mockData);
          done();
        }
      });

      const req = httpMock.expectOne('/api/test');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle endpoint with leading slash', (done) => {
      service.get('/test').subscribe(() => done());

      const req = httpMock.expectOne('/api/test');
      req.flush({});
    });

    it('should handle endpoint without leading slash', (done) => {
      service.get('test').subscribe(() => done());

      const req = httpMock.expectOne('/api/test');
      req.flush({});
    });

    it('should pass custom headers', (done) => {
      const headers = { 'X-Custom': 'value' };

      service.get('/test', { headers }).subscribe(() => done());

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('X-Custom')).toBe('value');
      req.flush({});
    });

    it('should pass query params', (done) => {
      const params = { page: '1', size: '10' };

      service.get('/test', { params }).subscribe(() => done());

      const req = httpMock.expectOne((req) =>
        req.url === '/api/test' && req.params.get('page') === '1'
      );
      req.flush({});
    });
  });

  describe('post', () => {
    it('should perform POST request', (done) => {
      const postData = { name: 'New Item' };
      const mockResponse = { id: 1, ...postData };

      service.post('/test', postData).subscribe({
        next: (data) => {
          expect(data).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne('/api/test');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(postData);
      req.flush(mockResponse);
    });

    it('should pass custom headers in POST', (done) => {
      const headers = { 'X-Custom': 'value' };

      service.post('/test', {}, { headers }).subscribe(() => done());

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('X-Custom')).toBe('value');
      req.flush({});
    });
  });

  describe('put', () => {
    it('should perform PUT request', (done) => {
      const putData = { id: 1, name: 'Updated Item' };

      service.put('/test/1', putData).subscribe({
        next: (data) => {
          expect(data).toEqual(putData);
          done();
        }
      });

      const req = httpMock.expectOne('/api/test/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(putData);
      req.flush(putData);
    });

    it('should pass custom headers in PUT', (done) => {
      const headers = { 'X-Custom': 'value' };

      service.put('/test/1', {}, { headers }).subscribe(() => done());

      const req = httpMock.expectOne('/api/test/1');
      expect(req.request.headers.get('X-Custom')).toBe('value');
      req.flush({});
    });
  });

  describe('delete', () => {
    it('should perform DELETE request', (done) => {
      service.delete('/test/1').subscribe(() => done());

      const req = httpMock.expectOne('/api/test/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should pass custom headers in DELETE', (done) => {
      const headers = { 'X-Custom': 'value' };

      service.delete('/test/1', { headers }).subscribe(() => done());

      const req = httpMock.expectOne('/api/test/1');
      expect(req.request.headers.get('X-Custom')).toBe('value');
      req.flush({});
    });
  });

  describe('Error Handling', () => {
    it('should handle network error (status 0)', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.category).toBe(ErrorCategory.NETWORK);
          expect(error.code).toBe('HTTP_0');
          expect(error.userMessage).toBe('error.network');
          done();
        }
      });

      // Service will retry 3 times, so expect 4 requests total
      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Network error', { status: 0, statusText: 'Unknown Error' });
      }
    });

    it('should handle 400 Bad Request', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.category).toBe(ErrorCategory.VALIDATION);
          expect(error.code).toBe('HTTP_400');
          expect(error.userMessage).toBe('error.validation');
          done();
        }
      });

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
      }
    });

    it('should handle 401 Unauthorized', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
          expect(error.code).toBe('HTTP_401');
          expect(error.userMessage).toBe('error.authentication');
          done();
        }
      });

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      }
    });

    it('should handle 403 Forbidden', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
          expect(error.code).toBe('HTTP_403');
          expect(error.userMessage).toBe('error.authorization');
          done();
        }
      });

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
      }
    });

    it('should handle 404 Not Found', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.category).toBe(ErrorCategory.NOT_FOUND);
          expect(error.code).toBe('HTTP_404');
          expect(error.userMessage).toBe('error.not.found');
          done();
        }
      });

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Not found', { status: 404, statusText: 'Not Found' });
      }
    });

    it('should handle 500 Internal Server Error', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.category).toBe(ErrorCategory.NETWORK);
          expect(error.code).toBe('HTTP_500');
          expect(error.userMessage).toBe('error.server');
          done();
        }
      });

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
      }
    });

    it('should handle 502 Bad Gateway', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.category).toBe(ErrorCategory.NETWORK);
          expect(error.code).toBe('HTTP_502');
          expect(error.userMessage).toBe('error.server');
          done();
        }
      });

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Bad gateway', { status: 502, statusText: 'Bad Gateway' });
      }
    });

    it('should handle 503 Service Unavailable', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.category).toBe(ErrorCategory.NETWORK);
          expect(error.code).toBe('HTTP_503');
          expect(error.userMessage).toBe('error.server');
          done();
        }
      });

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Service unavailable', { status: 503, statusText: 'Service Unavailable' });
      }
    });

    it('should handle 504 Gateway Timeout', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.category).toBe(ErrorCategory.NETWORK);
          expect(error.code).toBe('HTTP_504');
          expect(error.userMessage).toBe('error.server');
          done();
        }
      });

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Gateway timeout', { status: 504, statusText: 'Gateway Timeout' });
      }
    });

    it('should handle unknown HTTP status', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.category).toBe(ErrorCategory.UNKNOWN);
          expect(error.code).toBe('HTTP_999');
          expect(error.userMessage).toBe('error.unknown');
          done();
        }
      });

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Unknown error', { status: 999, statusText: 'Unknown' });
      }
    });

    it('should include error context', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.context).toBeDefined();
          expect(error.context.status).toBe(404);
          expect(error.context.statusText).toBe('Not Found');
          expect(error.context.url).toContain('/api/test');
          done();
        }
      });

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Not found', { status: 404, statusText: 'Not Found' });
      }
    });

    it('should include timestamp', (done) => {
      const before = new Date();

      service.get('/test').subscribe({
        error: (error) => {
          const after = new Date();
          expect(error.timestamp).toBeInstanceOf(Date);
          expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
          expect(error.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
          done();
        }
      });

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne('/api/test');
        req.flush('Error', { status: 500, statusText: 'Error' });
      }
    });
  });

  describe('buildUrl', () => {
    it('should build correct URL with endpoint starting with slash', (done) => {
      service.get('/users').subscribe(() => done());

      const req = httpMock.expectOne((req) => req.url === '/api/users');
      req.flush({});
    });

    it('should build correct URL with endpoint without slash', (done) => {
      service.get('users').subscribe(() => done());

      const req = httpMock.expectOne((req) => req.url === '/api/users');
      req.flush({});
    });

    it('should handle nested endpoints', (done) => {
      service.get('/users/1/posts').subscribe(() => done());

      const req = httpMock.expectOne((req) => req.url === '/api/users/1/posts');
      req.flush({});
    });
  });

  describe('mergeOptions', () => {
    it('should return empty object when no options provided', (done) => {
      service.get('/test').subscribe(() => done());

      const req = httpMock.expectOne('/api/test');
      req.flush({});
    });

    it('should return provided options', (done) => {
      const options = { headers: { 'X-Test': 'value' } };

      service.get('/test', options).subscribe(() => done());

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('X-Test')).toBe('value');
      req.flush({});
    });
  });
});
