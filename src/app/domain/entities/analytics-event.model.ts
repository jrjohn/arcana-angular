/**
 * Analytics Event Types
 */
export enum AnalyticsEventType {
  // User Events
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_VIEW = 'user.view',
  USER_SEARCH = 'user.search',

  // Navigation Events
  PAGE_VIEW = 'page.view',
  NAVIGATION = 'navigation',

  // Error Events
  ERROR_OCCURRED = 'error.occurred',
  WARNING_OCCURRED = 'warning.occurred',

  // Network Events
  NETWORK_ONLINE = 'network.online',
  NETWORK_OFFLINE = 'network.offline',
  API_REQUEST = 'api.request',
  API_SUCCESS = 'api.success',
  API_ERROR = 'api.error',

  // Cache Events
  CACHE_HIT = 'cache.hit',
  CACHE_MISS = 'cache.miss',

  // Sync Events
  SYNC_START = 'sync.start',
  SYNC_SUCCESS = 'sync.success',
  SYNC_ERROR = 'sync.error',

  // Performance Events
  PERFORMANCE_METRIC = 'performance.metric',
  LOAD_TIME = 'performance.load_time',

  // UI Events
  BUTTON_CLICK = 'ui.button_click',
  FORM_SUBMIT = 'ui.form_submit',
  MODAL_OPEN = 'ui.modal_open',
  MODAL_CLOSE = 'ui.modal_close',
}

/**
 * Analytics Error Codes
 * Format: E + 5 digits (E00001 - E99999)
 */
export enum AnalyticsErrorCode {
  // Network Errors (E10xxx)
  E10001 = 'Network connection lost',
  E10002 = 'API request timeout',
  E10003 = 'API server error',
  E10004 = 'CORS error',
  E10005 = 'DNS resolution failed',

  // Authentication/Authorization Errors (E20xxx)
  E20001 = 'Authentication required',
  E20002 = 'Invalid credentials',
  E20003 = 'Session expired',
  E20004 = 'Insufficient permissions',
  E20005 = 'Access denied',

  // Validation Errors (E30xxx)
  E30001 = 'Invalid input data',
  E30002 = 'Required field missing',
  E30003 = 'Invalid email format',
  E30004 = 'Invalid data type',
  E30005 = 'Data validation failed',

  // Resource Errors (E40xxx)
  E40001 = 'Resource not found',
  E40002 = 'Resource already exists',
  E40003 = 'Resource deleted',
  E40004 = 'Resource locked',
  E40005 = 'Resource limit exceeded',

  // Storage Errors (E50xxx)
  E50001 = 'IndexedDB operation failed',
  E50002 = 'Storage quota exceeded',
  E50003 = 'Cache write failed',
  E50004 = 'Local storage unavailable',
  E50005 = 'Data corruption detected',

  // Sync Errors (E60xxx)
  E60001 = 'Sync failed',
  E60002 = 'Sync conflict detected',
  E60003 = 'Sync operation timeout',
  E60004 = 'Pending operations limit exceeded',
  E60005 = 'Sync queue corrupted',

  // Application Errors (E70xxx)
  E70001 = 'Unexpected application error',
  E70002 = 'Component initialization failed',
  E70003 = 'Service unavailable',
  E70004 = 'Feature not supported',
  E70005 = 'Configuration error',

  // Unknown/Generic Errors (E90xxx)
  E90001 = 'Unknown error occurred',
  E90002 = 'Operation cancelled',
  E90003 = 'Timeout error',
  E90004 = 'Internal error',
  E90005 = 'Unexpected state',
}

/**
 * Analytics Warning Codes
 * Format: W + 5 digits (W00001 - W99999)
 */
export enum AnalyticsWarningCode {
  // Performance Warnings (W10xxx)
  W10001 = 'Slow network detected',
  W10002 = 'High memory usage',
  W10003 = 'Large bundle size',
  W10004 = 'Slow API response',
  W10005 = 'Cache size approaching limit',

  // Data Warnings (W20xxx)
  W20001 = 'Data partially loaded',
  W20002 = 'Stale data displayed',
  W20003 = 'Data sync pending',
  W20004 = 'Deprecated field used',
  W20005 = 'Data format deprecated',

  // Feature Warnings (W30xxx)
  W30001 = 'Feature deprecated',
  W30002 = 'Beta feature in use',
  W30003 = 'Experimental feature enabled',
  W30004 = 'Fallback behavior activated',
  W30005 = 'Limited functionality mode',

  // Security Warnings (W40xxx)
  W40001 = 'Insecure connection',
  W40002 = 'Weak password detected',
  W40003 = 'Session expiring soon',
  W40004 = 'Multiple failed login attempts',
  W40005 = 'Suspicious activity detected',

  // Compatibility Warnings (W50xxx)
  W50001 = 'Browser not fully supported',
  W50002 = 'Feature not supported in browser',
  W50003 = 'Legacy API in use',
  W50004 = 'Outdated dependencies',
  W50005 = 'Platform compatibility issue',
}

/**
 * Analytics Event Severity
 */
export enum AnalyticsEventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Analytics Event Interface
 */
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  severity: AnalyticsEventSeverity;

  // Event details
  category: string;
  action: string;
  label?: string;
  value?: number;

  // Error/Warning specific
  errorCode?: AnalyticsErrorCode | AnalyticsWarningCode;
  errorMessage?: string;
  stackTrace?: string;

  // Metadata
  metadata: Record<string, unknown>;

  // Context
  url?: string;
  userAgent?: string;
  viewport?: { width: number; height: number };

  // Performance
  duration?: number;
  memoryUsage?: number;
}

/**
 * Analytics Session Interface
 */
export interface AnalyticsSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  lastActivityTime: Date;

  // Session info
  userId?: string;
  deviceId: string;

  // Browser/Device info
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;

  // Location (from IP or browser)
  timezone: string;
  language: string;

  // Session metrics
  pageViews: number;
  eventCount: number;
  errorCount: number;
  warningCount: number;

  // Network
  initialNetworkType?: string;
  isOnline: boolean;

  // App version
  appVersion: string;
}

/**
 * Analytics Performance Metric
 */
export interface AnalyticsPerformanceMetric {
  id: string;
  sessionId: string;
  timestamp: Date;

  metricType: 'page_load' | 'api_call' | 'render' | 'interaction';
  metricName: string;

  // Timing
  duration: number;

  // Resource metrics
  memoryUsed?: number;
  transferSize?: number;

  // Additional data
  metadata: Record<string, unknown>;
}

/**
 * Helper function to get error code description
 */
export function getErrorCodeDescription(
  code: AnalyticsErrorCode | AnalyticsWarningCode
): string {
  return code.toString();
}

/**
 * Helper function to check if code is error
 */
export function isErrorCode(code: string): boolean {
  return code.startsWith('E');
}

/**
 * Helper function to check if code is warning
 */
export function isWarningCode(code: string): boolean {
  return code.startsWith('W');
}

/**
 * Helper function to map error category to error code
 */
export function getErrorCodeFromCategory(
  category: string,
  subCategory?: string
): AnalyticsErrorCode {
  const categoryMap: Record<string, AnalyticsErrorCode> = {
    network: AnalyticsErrorCode.E10001,
    authentication: AnalyticsErrorCode.E20001,
    authorization: AnalyticsErrorCode.E20004,
    validation: AnalyticsErrorCode.E30001,
    not_found: AnalyticsErrorCode.E40001,
    storage: AnalyticsErrorCode.E50001,
    sync: AnalyticsErrorCode.E60001,
    application: AnalyticsErrorCode.E70001,
    unknown: AnalyticsErrorCode.E90001,
  };

  return categoryMap[category.toLowerCase()] || AnalyticsErrorCode.E90001;
}
