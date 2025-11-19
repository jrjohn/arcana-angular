import { Injectable, inject } from '@angular/core';
import { SessionManagementService } from './session-management.service';
import { EventTrackingService } from './event-tracking.service';
import { NetworkStatusService } from './network-status.service';
import {
  AnalyticsEventType,
  AnalyticsErrorCode,
  AnalyticsWarningCode,
} from '../entities/analytics-event.model';
import { AppError } from '../entities/app-error.model';

/**
 * User action types (for backward compatibility)
 */
export enum UserActionType {
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_VIEWED = 'user_viewed',
  USER_SEARCHED = 'user_searched',
  PAGE_VIEWED = 'page_viewed',
  BUTTON_CLICKED = 'button_clicked',
  FORM_SUBMITTED = 'form_submitted',
  ERROR_OCCURRED = 'error_occurred',
}

/**
 * Analytics Service
 * Central service for all analytics operations
 * Integrates session management and event tracking with error codes
 */
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private sessionService = inject(SessionManagementService);
  private eventTracking = inject(EventTrackingService);
  private networkStatus = inject(NetworkStatusService);

  constructor() {
    this.initializeAnalytics();
  }

  /**
   * Initialize analytics tracking
   */
  private initializeAnalytics(): void {
    console.log('[Analytics] Initializing analytics with error codes...');

    // Track network status changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.eventTracking.trackNetworkStatus(true);
      });

      window.addEventListener('offline', () => {
        this.eventTracking.trackNetworkStatus(false);
      });
    }

    console.log('[Analytics] Analytics initialized with session:', this.getSessionId());
  }

  /**
   * Set user ID for current session
   */
  setUserId(userId: string): void {
    this.sessionService.setUserId(userId);
    console.log('[Analytics] User ID set:', userId);
  }

  /**
   * Clear user ID (logout)
   */
  clearUserId(): void {
    this.sessionService.setUserId('');
    console.log('[Analytics] User ID cleared');
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
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.eventTracking.trackEvent(type, category, action, options);
  }

  /**
   * Track error with error code (E00001-E99999)
   */
  trackError(
    error: Error | AppError,
    errorCode?: AnalyticsErrorCode,
    metadata?: Record<string, unknown>
  ): void {
    this.eventTracking.trackError(error, errorCode, metadata);
    console.error('[Analytics] Error tracked with code:', errorCode, error.message);
  }

  /**
   * Track warning with warning code (W00001-W99999)
   */
  trackWarning(
    message: string,
    warningCode: AnalyticsWarningCode,
    metadata?: Record<string, unknown>
  ): void {
    this.eventTracking.trackWarning(message, warningCode, metadata);
    console.warn('[Analytics] Warning tracked with code:', warningCode, message);
  }

  /**
   * Track screen/page view
   */
  trackScreen(screenName: string, params?: Record<string, unknown>): void {
    this.trackEvent(AnalyticsEventType.PAGE_VIEW, 'navigation', 'page_view', {
      label: screenName,
      metadata: params,
    });
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName: string, params?: Record<string, unknown>): void {
    this.eventTracking.trackButtonClick(buttonName, params);
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formName: string, success: boolean, params?: Record<string, unknown>): void {
    this.eventTracking.trackFormSubmit(formName, success, params);
  }

  /**
   * Track user action (backward compatibility)
   */
  trackUserAction(
    action: UserActionType | string,
    params?: Record<string, unknown>
  ): void {
    this.eventTracking.trackUserAction(action, params);
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
    this.eventTracking.trackApiCall(endpoint, method, statusCode, duration, success);
  }

  /**
   * Track cache event
   */
  trackCacheEvent(cacheType: string, hit: boolean, key: string): void {
    this.eventTracking.trackCacheEvent(cacheType, hit, key);
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    return this.sessionService.currentSession();
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionService.sessionId;
  }

  /**
   * Get user ID
   */
  getUserId(): string | undefined {
    return this.sessionService.currentSession()?.userId;
  }

  /**
   * Get queued events (for debugging)
   */
  getEvents() {
    return this.eventTracking.getQueuedEvents();
  }

  /**
   * Clear event queue
   */
  clearEvents(): void {
    this.eventTracking.clearQueue();
  }

  /**
   * End current session
   */
  endSession(): void {
    this.sessionService.endSession();
  }

  /**
   * Start new session
   */
  startNewSession(userId?: string): void {
    this.sessionService.startNewSession(userId);
  }
}

// Export error and warning codes for easy access
export { AnalyticsErrorCode, AnalyticsWarningCode } from '../entities/analytics-event.model';
