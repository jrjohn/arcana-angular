import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import {
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsEventSeverity,
  AnalyticsErrorCode,
  AnalyticsWarningCode,
  AnalyticsPerformanceMetric,
  getErrorCodeFromCategory,
} from '../entities/analytics-event.model';
import { SessionManagementService } from './session-management.service';
import { IndexedDbService } from '../../data/storage/indexed-db.service';
import { AppError } from '../entities/app-error.model';

/**
 * Event Tracking Service
 * Tracks and persists analytics events
 */
@Injectable({
  providedIn: 'root',
})
export class EventTrackingService {
  private router = inject(Router);
  private sessionService = inject(SessionManagementService);
  private indexedDb = inject(IndexedDbService);

  private eventQueue: AnalyticsEvent[] = [];
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  constructor() {
    this.initializeTracking();
    this.setupAutoFlush();
  }

  /**
   * Initialize tracking (page views, navigation, etc.)
   */
  private initializeTracking(): void {
    // Track page views
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: unknown) => {
        const navEvent = event as NavigationEnd;
        this.trackPageView(navEvent.urlAfterRedirects);
      });

    // Track errors
    this.setupErrorTracking();

    // Track performance
    this.setupPerformanceTracking();
  }

  /**
   * Track custom event
   */
  trackEvent(
    type: AnalyticsEventType,
    category: string,
    action: string,
    options?: {
      label?: string;
      value?: number;
      severity?: AnalyticsEventSeverity;
      metadata?: Record<string, unknown>;
    }
  ): void {
    const event: AnalyticsEvent = {
      id: uuidv4(),
      type,
      timestamp: new Date(),
      sessionId: this.sessionService.sessionId,
      userId: this.sessionService.currentSession()?.userId,
      severity: options?.severity || AnalyticsEventSeverity.INFO,

      category,
      action,
      label: options?.label,
      value: options?.value,

      metadata: options?.metadata || {},

      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    this.addEventToQueue(event);
    this.sessionService.incrementEventCount();

    console.log('[EventTracking] Event tracked:', event.type, event);
  }

  /**
   * Track error event with error code
   */
  trackError(
    error: Error | AppError,
    errorCode?: AnalyticsErrorCode,
    metadata?: Record<string, unknown>
  ): void {
    const appError = error as AppError;
    const nativeError = error as Error;
    const code = errorCode || getErrorCodeFromCategory(appError.category || 'unknown');

    const event: AnalyticsEvent = {
      id: uuidv4(),
      type: AnalyticsEventType.ERROR_OCCURRED,
      timestamp: new Date(),
      sessionId: this.sessionService.sessionId,
      userId: this.sessionService.currentSession()?.userId,
      severity: AnalyticsEventSeverity.ERROR,

      category: 'error',
      action: 'error_occurred',
      label: error.message,

      errorCode: code,
      errorMessage: error.message,
      stackTrace: nativeError.stack,

      metadata: {
        errorType: appError.category || 'unknown',
        ...metadata,
      },

      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    this.addEventToQueue(event);
    this.sessionService.incrementErrorCount();

    console.error('[EventTracking] Error tracked:', code, event);
  }

  /**
   * Track warning event with warning code
   */
  trackWarning(
    message: string,
    warningCode: AnalyticsWarningCode,
    metadata?: Record<string, unknown>
  ): void {
    const event: AnalyticsEvent = {
      id: uuidv4(),
      type: AnalyticsEventType.WARNING_OCCURRED,
      timestamp: new Date(),
      sessionId: this.sessionService.sessionId,
      userId: this.sessionService.currentSession()?.userId,
      severity: AnalyticsEventSeverity.WARNING,

      category: 'warning',
      action: 'warning_occurred',
      label: message,

      errorCode: warningCode,
      errorMessage: message,

      metadata: metadata || {},

      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    this.addEventToQueue(event);
    this.sessionService.incrementWarningCount();

    console.warn('[EventTracking] Warning tracked:', warningCode, event);
  }

  /**
   * Track page view
   */
  trackPageView(url: string): void {
    this.trackEvent(AnalyticsEventType.PAGE_VIEW, 'navigation', 'page_view', {
      label: url,
      metadata: { url },
    });

    this.sessionService.incrementPageView();
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, metadata?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.USER_CREATE, 'user', action, {
      metadata,
    });
  }

  /**
   * Track API call
   */
  trackApiCall(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    success: boolean
  ): void {
    const type = success
      ? AnalyticsEventType.API_SUCCESS
      : AnalyticsEventType.API_ERROR;

    this.trackEvent(type, 'api', method, {
      label: endpoint,
      value: statusCode,
      metadata: {
        endpoint,
        method,
        statusCode,
        duration,
        success,
      },
    });
  }

  /**
   * Track cache event
   */
  trackCacheEvent(cacheType: string, hit: boolean, key: string): void {
    const type = hit
      ? AnalyticsEventType.CACHE_HIT
      : AnalyticsEventType.CACHE_MISS;

    this.trackEvent(type, 'cache', hit ? 'hit' : 'miss', {
      label: key,
      metadata: {
        cacheType,
        key,
      },
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: Omit<AnalyticsPerformanceMetric, 'id' | 'sessionId' | 'timestamp'>): void {
    const perfMetric: AnalyticsPerformanceMetric = {
      id: uuidv4(),
      sessionId: this.sessionService.sessionId,
      timestamp: new Date(),
      ...metric,
    };

    // Store performance metric separately
    console.log('[EventTracking] Performance metric:', perfMetric);

    // Also track as event
    this.trackEvent(AnalyticsEventType.PERFORMANCE_METRIC, 'performance', metric.metricType, {
      label: metric.metricName,
      value: metric.duration,
      metadata: {
        ...metric.metadata,
        duration: metric.duration,
        memoryUsed: metric.memoryUsed,
        transferSize: metric.transferSize,
      },
    });
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName: string, metadata?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.BUTTON_CLICK, 'ui', 'button_click', {
      label: buttonName,
      metadata,
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formName: string, success: boolean, metadata?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.FORM_SUBMIT, 'ui', 'form_submit', {
      label: formName,
      metadata: {
        ...metadata,
        success,
      },
    });
  }

  /**
   * Track network status change
   */
  trackNetworkStatus(isOnline: boolean): void {
    const type = isOnline
      ? AnalyticsEventType.NETWORK_ONLINE
      : AnalyticsEventType.NETWORK_OFFLINE;

    this.trackEvent(type, 'network', isOnline ? 'online' : 'offline', {
      metadata: { isOnline },
    });

    this.sessionService.updateNetworkStatus(isOnline);
  }

  /**
   * Add event to queue
   */
  private addEventToQueue(event: AnalyticsEvent): void {
    this.eventQueue.push(event);

    // Flush if queue is full
    if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flushEvents();
    }
  }

  /**
   * Flush events to storage
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real app, you would send these to a backend analytics service
      // For now, we'll log them and could store in IndexedDB if needed
      console.log('[EventTracking] Flushing events:', eventsToFlush.length);

      // You could add IndexedDB storage here if needed:
      // await this.indexedDb.saveAnalyticsEvents(eventsToFlush);

      // Or send to analytics backend:
      // await this.sendToAnalyticsBackend(eventsToFlush);
    } catch (error) {
      console.error('[EventTracking] Failed to flush events:', error);
      // Re-add failed events to queue
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  /**
   * Setup auto-flush timer
   */
  private setupAutoFlush(): void {
    setInterval(() => {
      this.flushEvents();
    }, this.FLUSH_INTERVAL);

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushEvents();
      });
    }
  }

  /**
   * Setup global error tracking
   */
  private setupErrorTracking(): void {
    if (typeof window === 'undefined') return;

    // Track unhandled errors
    window.addEventListener('error', (event: ErrorEvent) => {
      this.trackError(
        new Error(event.message),
        AnalyticsErrorCode.E90001,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.trackError(
        new Error(event.reason?.toString() || 'Unhandled promise rejection'),
        AnalyticsErrorCode.E90001,
        {
          reason: event.reason,
        }
      );
    });
  }

  /**
   * Setup performance tracking
   */
  private setupPerformanceTracking(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    // Track page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navigation) {
          this.trackPerformance({
            metricType: 'page_load',
            metricName: 'page_load_complete',
            duration: navigation.loadEventEnd - navigation.fetchStart,
            transferSize: navigation.transferSize,
            metadata: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              domInteractive: navigation.domInteractive - navigation.fetchStart,
            },
          });
        }
      }, 0);
    });
  }

  /**
   * Get all events (for debugging or export)
   */
  getQueuedEvents(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  /**
   * Clear event queue
   */
  clearQueue(): void {
    this.eventQueue = [];
  }
}
