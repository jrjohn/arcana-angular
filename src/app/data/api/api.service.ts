import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timeout, retry, catchError } from 'rxjs';
import { AppError, ErrorCategory, createAppError } from '../../domain/entities/app-error.model';

/**
 * Request options for API calls
 */
export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: { [param: string]: string | string[] };
}

/**
 * API Service for HTTP communication
 * Handles all HTTP requests with error handling and retry logic
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = '/api';  // Use proxy to avoid CORS
  private readonly defaultTimeout = 30000; // 30 seconds
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(private http: HttpClient) {}

  /**
   * Merges custom options (no default headers to avoid CORS issues)
   */
  private mergeOptions(options?: RequestOptions): RequestOptions {
    // Don't add any default headers - they trigger CORS preflight
    // Angular will automatically add appropriate headers based on request type
    return options || {};
  }

  /**
   * Performs a GET request
   */
  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const mergedOptions = this.mergeOptions(options);
    return this.http.get<T>(url, { ...mergedOptions, responseType: 'json' as 'json' }).pipe(
      timeout(this.defaultTimeout),
      retry(this.maxRetries),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Performs a POST request
   */
  post<T>(endpoint: string, data: unknown, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const mergedOptions = this.mergeOptions(options);
    return this.http.post<T>(url, data, mergedOptions).pipe(
      timeout(this.defaultTimeout),
      retry(this.maxRetries),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Performs a PUT request
   */
  put<T>(endpoint: string, data: unknown, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const mergedOptions = this.mergeOptions(options);
    return this.http.put<T>(url, data, mergedOptions).pipe(
      timeout(this.defaultTimeout),
      retry(this.maxRetries),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Performs a DELETE request
   */
  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const mergedOptions = this.mergeOptions(options);
    return this.http.delete<T>(url, mergedOptions).pipe(
      timeout(this.defaultTimeout),
      retry(this.maxRetries),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Builds full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Handles HTTP errors and converts to AppError
   */
  private handleError(error: unknown): Observable<never> {
    let appError: AppError;

    if (error instanceof HttpErrorResponse) {
      // Log detailed error information for debugging
      console.error('[ApiService] HTTP Error Response:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        error: error.error,
        message: error.message
      });
      appError = this.mapHttpError(error);
    } else if (error instanceof Error) {
      console.error('[ApiService] Error:', error);
      appError = createAppError(error, ErrorCategory.NETWORK);
    } else {
      console.error('[ApiService] Unknown error:', error);
      appError = createAppError(error, ErrorCategory.UNKNOWN);
    }

    return throwError(() => appError);
  }

  /**
   * Maps HTTP error response to AppError
   * Returns translation keys for userMessage instead of hardcoded text
   */
  private mapHttpError(error: HttpErrorResponse): AppError {
    let category: ErrorCategory;
    let userMessage: string;

    switch (error.status) {
      case 0:
        category = ErrorCategory.NETWORK;
        userMessage = 'error.network';
        break;
      case 400:
        category = ErrorCategory.VALIDATION;
        userMessage = 'error.validation';
        break;
      case 401:
        category = ErrorCategory.AUTHENTICATION;
        userMessage = 'error.authentication';
        break;
      case 403:
        category = ErrorCategory.AUTHORIZATION;
        userMessage = 'error.authorization';
        break;
      case 404:
        category = ErrorCategory.NOT_FOUND;
        userMessage = 'error.not.found';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        category = ErrorCategory.NETWORK;
        userMessage = 'error.server';
        break;
      default:
        category = ErrorCategory.UNKNOWN;
        userMessage = 'error.unknown';
    }

    return {
      code: `HTTP_${error.status}`,
      message: error.message,
      category,
      userMessage,
      context: {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
      },
      timestamp: new Date(),
    };
  }
}
