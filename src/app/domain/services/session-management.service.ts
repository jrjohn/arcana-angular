import { Injectable, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsSession } from '../entities/analytics-event.model';

/**
 * Session Management Service
 * Manages user sessions and tracks session metadata
 */
@Injectable({
  providedIn: 'root',
})
export class SessionManagementService {
  private readonly SESSION_KEY = 'analytics_session';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  private currentSessionSignal = signal<AnalyticsSession | null>(null);

  constructor() {
    this.initializeSession();
    this.setupActivityTracking();
  }

  /**
   * Get current session (readonly)
   */
  get currentSession() {
    return this.currentSessionSignal.asReadonly();
  }

  /**
   * Get current session ID
   */
  get sessionId(): string {
    return this.currentSessionSignal()?.id || '';
  }

  /**
   * Initialize or restore session
   */
  private initializeSession(): void {
    const storedSession = this.getStoredSession();

    if (storedSession && this.isSessionValid(storedSession)) {
      // Restore existing session
      this.currentSessionSignal.set(storedSession);
      console.log('[SessionManagement] Session restored:', storedSession.id);
    } else {
      // Create new session
      this.startNewSession();
    }
  }

  /**
   * Start a new session
   */
  startNewSession(userId?: string): void {
    const session: AnalyticsSession = {
      id: uuidv4(),
      startTime: new Date(),
      lastActivityTime: new Date(),

      userId,
      deviceId: this.getDeviceId(),

      userAgent: navigator.userAgent,
      browser: this.getBrowserInfo().name,
      browserVersion: this.getBrowserInfo().version,
      os: this.getOSInfo().name,
      osVersion: this.getOSInfo().version,
      device: this.getDeviceType(),

      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,

      pageViews: 0,
      eventCount: 0,
      errorCount: 0,
      warningCount: 0,

      isOnline: navigator.onLine,

      appVersion: this.getAppVersion(),
    };

    this.currentSessionSignal.set(session);
    this.saveSession(session);

    console.log('[SessionManagement] New session started:', session.id);
  }

  /**
   * End current session
   */
  endSession(): void {
    const session = this.currentSessionSignal();
    if (session) {
      session.endTime = new Date();
      this.saveSession(session);
      console.log('[SessionManagement] Session ended:', session.id);
    }

    this.currentSessionSignal.set(null);
    localStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Update session activity
   */
  updateActivity(): void {
    const session = this.currentSessionSignal();
    if (session) {
      session.lastActivityTime = new Date();
      this.saveSession(session);
    }
  }

  /**
   * Increment page view count
   */
  incrementPageView(): void {
    const session = this.currentSessionSignal();
    if (session) {
      session.pageViews++;
      this.updateActivity();
      this.saveSession(session);
    }
  }

  /**
   * Increment event count
   */
  incrementEventCount(): void {
    const session = this.currentSessionSignal();
    if (session) {
      session.eventCount++;
      this.updateActivity();
      this.saveSession(session);
    }
  }

  /**
   * Increment error count
   */
  incrementErrorCount(): void {
    const session = this.currentSessionSignal();
    if (session) {
      session.errorCount++;
      this.updateActivity();
      this.saveSession(session);
    }
  }

  /**
   * Increment warning count
   */
  incrementWarningCount(): void {
    const session = this.currentSessionSignal();
    if (session) {
      session.warningCount++;
      this.updateActivity();
      this.saveSession(session);
    }
  }

  /**
   * Update session user ID
   */
  setUserId(userId: string): void {
    const session = this.currentSessionSignal();
    if (session) {
      session.userId = userId;
      this.saveSession(session);
    }
  }

  /**
   * Update network status
   */
  updateNetworkStatus(isOnline: boolean): void {
    const session = this.currentSessionSignal();
    if (session) {
      session.isOnline = isOnline;
      this.saveSession(session);
    }
  }

  /**
   * Check if session is valid (not timed out)
   */
  private isSessionValid(session: AnalyticsSession): boolean {
    const now = new Date().getTime();
    const lastActivity = new Date(session.lastActivityTime).getTime();
    const timeSinceActivity = now - lastActivity;

    return timeSinceActivity < this.SESSION_TIMEOUT;
  }

  /**
   * Get stored session from localStorage
   */
  private getStoredSession(): AnalyticsSession | null {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored);
      // Convert date strings back to Date objects
      session.startTime = new Date(session.startTime);
      session.lastActivityTime = new Date(session.lastActivityTime);
      if (session.endTime) {
        session.endTime = new Date(session.endTime);
      }

      return session;
    } catch (error) {
      console.error('[SessionManagement] Failed to restore session:', error);
      return null;
    }
  }

  /**
   * Save session to localStorage
   */
  private saveSession(session: AnalyticsSession): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('[SessionManagement] Failed to save session:', error);
    }
  }

  /**
   * Get or create device ID
   */
  private getDeviceId(): string {
    const DEVICE_ID_KEY = 'analytics_device_id';
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  }

  /**
   * Get browser information
   */
  private getBrowserInfo(): { name: string; version: string } {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = '0';

    if (ua.indexOf('Firefox') > -1) {
      name = 'Firefox';
      version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || '0';
    } else if (ua.indexOf('Edg') > -1) {
      name = 'Edge';
      version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || '0';
    } else if (ua.indexOf('Chrome') > -1) {
      name = 'Chrome';
      version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || '0';
    } else if (ua.indexOf('Safari') > -1) {
      name = 'Safari';
      version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || '0';
    }

    return { name, version };
  }

  /**
   * Get OS information
   */
  private getOSInfo(): { name: string; version: string } {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = '0';

    if (ua.indexOf('Windows') > -1) {
      name = 'Windows';
      version = ua.match(/Windows NT (\d+\.\d+)/)?.[1] || '0';
    } else if (ua.indexOf('Mac OS X') > -1) {
      name = 'macOS';
      version = ua.match(/Mac OS X (\d+[._]\d+[._]\d+)/)?.[1]?.replace(/_/g, '.') || '0';
    } else if (ua.indexOf('Linux') > -1) {
      name = 'Linux';
    } else if (ua.indexOf('Android') > -1) {
      name = 'Android';
      version = ua.match(/Android (\d+\.\d+)/)?.[1] || '0';
    } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
      name = 'iOS';
      version = ua.match(/OS (\d+_\d+)/)?.[1]?.replace(/_/g, '.') || '0';
    }

    return { name, version };
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    const ua = navigator.userAgent;

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'Tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'Mobile';
    }
    return 'Desktop';
  }

  /**
   * Get app version from package.json or environment
   */
  private getAppVersion(): string {
    // In a real app, this would come from environment or build config
    return '1.0.0';
  }

  /**
   * Setup activity tracking (mouse, keyboard, touch events)
   */
  private setupActivityTracking(): void {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    let activityTimeout: ReturnType<typeof setTimeout>;

    const handleActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        this.updateActivity();
      }, 1000); // Debounce activity updates
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check for session timeout periodically
    setInterval(() => {
      const session = this.currentSessionSignal();
      if (session && !this.isSessionValid(session)) {
        console.log('[SessionManagement] Session timed out');
        this.endSession();
        this.startNewSession(session.userId);
      }
    }, 60000); // Check every minute
  }
}
