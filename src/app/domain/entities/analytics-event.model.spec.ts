import {
  AnalyticsEventType,
  AnalyticsErrorCode,
  AnalyticsWarningCode,
  AnalyticsEventSeverity,
  AnalyticsEvent,
  AnalyticsSession,
  getErrorCodeDescription,
  isErrorCode,
  isWarningCode,
  getErrorCodeFromCategory,
} from './analytics-event.model';

describe('AnalyticsEventType', () => {
  it('should have user events', () => {
    expect(AnalyticsEventType.USER_LOGIN).toBe('user.login');
    expect(AnalyticsEventType.USER_LOGOUT).toBe('user.logout');
    expect(AnalyticsEventType.USER_CREATE).toBe('user.create');
    expect(AnalyticsEventType.USER_UPDATE).toBe('user.update');
    expect(AnalyticsEventType.USER_DELETE).toBe('user.delete');
  });

  it('should have navigation events', () => {
    expect(AnalyticsEventType.PAGE_VIEW).toBe('page.view');
    expect(AnalyticsEventType.NAVIGATION).toBe('navigation');
  });

  it('should have error events', () => {
    expect(AnalyticsEventType.ERROR_OCCURRED).toBe('error.occurred');
    expect(AnalyticsEventType.WARNING_OCCURRED).toBe('warning.occurred');
  });

  it('should have network events', () => {
    expect(AnalyticsEventType.NETWORK_ONLINE).toBe('network.online');
    expect(AnalyticsEventType.NETWORK_OFFLINE).toBe('network.offline');
    expect(AnalyticsEventType.API_REQUEST).toBe('api.request');
    expect(AnalyticsEventType.API_SUCCESS).toBe('api.success');
    expect(AnalyticsEventType.API_ERROR).toBe('api.error');
  });

  it('should have cache events', () => {
    expect(AnalyticsEventType.CACHE_HIT).toBe('cache.hit');
    expect(AnalyticsEventType.CACHE_MISS).toBe('cache.miss');
  });

  it('should have sync events', () => {
    expect(AnalyticsEventType.SYNC_START).toBe('sync.start');
    expect(AnalyticsEventType.SYNC_SUCCESS).toBe('sync.success');
    expect(AnalyticsEventType.SYNC_ERROR).toBe('sync.error');
  });
});

describe('AnalyticsEventSeverity', () => {
  it('should have four severity levels', () => {
    expect(AnalyticsEventSeverity.INFO).toBe('info');
    expect(AnalyticsEventSeverity.WARNING).toBe('warning');
    expect(AnalyticsEventSeverity.ERROR).toBe('error');
    expect(AnalyticsEventSeverity.CRITICAL).toBe('critical');
  });
});

describe('AnalyticsErrorCode', () => {
  it('should have network error codes', () => {
    expect(AnalyticsErrorCode.E10001).toBe('Network connection lost');
    expect(AnalyticsErrorCode.E10002).toBe('API request timeout');
  });

  it('should have auth error codes', () => {
    expect(AnalyticsErrorCode.E20001).toBe('Authentication required');
    expect(AnalyticsErrorCode.E20003).toBe('Session expired');
  });

  it('should have resource error codes', () => {
    expect(AnalyticsErrorCode.E40001).toBe('Resource not found');
    expect(AnalyticsErrorCode.E40002).toBe('Resource already exists');
  });
});

describe('AnalyticsWarningCode', () => {
  it('should have performance warning codes', () => {
    expect(AnalyticsWarningCode.W10001).toBe('Slow network detected');
    expect(AnalyticsWarningCode.W10002).toBe('High memory usage');
  });

  it('should have security warning codes', () => {
    expect(AnalyticsWarningCode.W40001).toBe('Insecure connection');
    expect(AnalyticsWarningCode.W40003).toBe('Session expiring soon');
  });
});

describe('getErrorCodeDescription', () => {
  it('should return string description for error codes', () => {
    expect(getErrorCodeDescription(AnalyticsErrorCode.E10001)).toBe('Network connection lost');
  });

  it('should return string description for warning codes', () => {
    expect(getErrorCodeDescription(AnalyticsWarningCode.W10001)).toBe('Slow network detected');
  });
});

describe('isErrorCode', () => {
  it('should return true for codes starting with E', () => {
    expect(isErrorCode('E10001')).toBeTrue();
    expect(isErrorCode('E90005')).toBeTrue();
  });

  it('should return false for codes starting with W', () => {
    expect(isErrorCode('W10001')).toBeFalse();
  });

  it('should return false for empty string', () => {
    expect(isErrorCode('')).toBeFalse();
  });
});

describe('isWarningCode', () => {
  it('should return true for codes starting with W', () => {
    expect(isWarningCode('W10001')).toBeTrue();
  });

  it('should return false for codes starting with E', () => {
    expect(isWarningCode('E10001')).toBeFalse();
  });
});

describe('getErrorCodeFromCategory', () => {
  it('should return network error code for network category', () => {
    expect(getErrorCodeFromCategory('network')).toBe(AnalyticsErrorCode.E10001);
  });

  it('should return authentication error code for authentication category', () => {
    expect(getErrorCodeFromCategory('authentication')).toBe(AnalyticsErrorCode.E20001);
  });

  it('should return not_found error code for not_found category', () => {
    expect(getErrorCodeFromCategory('not_found')).toBe(AnalyticsErrorCode.E40001);
  });

  it('should return unknown error code for unrecognized category', () => {
    expect(getErrorCodeFromCategory('gibberish')).toBe(AnalyticsErrorCode.E90001);
  });

  it('should handle uppercase category input by lowercasing', () => {
    // lowercase lookup, uppercase won't match unless lowercased
    // function does .toLowerCase() already
    expect(getErrorCodeFromCategory('UNKNOWN')).toBe(AnalyticsErrorCode.E90001);
  });
});

describe('AnalyticsEvent interface', () => {
  it('should create a valid analytics event object', () => {
    const event: AnalyticsEvent = {
      id: 'evt-1',
      type: AnalyticsEventType.USER_LOGIN,
      timestamp: new Date(),
      sessionId: 'sess-1',
      severity: AnalyticsEventSeverity.INFO,
      category: 'user',
      action: 'login',
      metadata: {},
    };
    expect(event.id).toBe('evt-1');
    expect(event.type).toBe('user.login');
    expect(event.severity).toBe('info');
  });

  it('should allow optional fields', () => {
    const event: AnalyticsEvent = {
      id: 'evt-2',
      type: AnalyticsEventType.ERROR_OCCURRED,
      timestamp: new Date(),
      sessionId: 'sess-2',
      severity: AnalyticsEventSeverity.ERROR,
      category: 'error',
      action: 'throw',
      metadata: { component: 'UserList' },
      errorCode: AnalyticsErrorCode.E70001,
      errorMessage: 'Component init failed',
      userId: 'user-42',
      label: 'critical-error',
      value: 500,
    };
    expect(event.errorCode).toBe(AnalyticsErrorCode.E70001);
    expect(event.userId).toBe('user-42');
    expect(event.metadata['component']).toBe('UserList');
  });
});

describe('AnalyticsSession interface', () => {
  it('should create a valid analytics session', () => {
    const session: AnalyticsSession = {
      id: 'sess-1',
      startTime: new Date(),
      lastActivityTime: new Date(),
      deviceId: 'device-1',
      userAgent: 'Chrome/120',
      browser: 'Chrome',
      browserVersion: '120',
      os: 'Windows',
      osVersion: '11',
      device: 'Desktop',
      timezone: 'UTC',
      language: 'en',
      pageViews: 5,
      eventCount: 12,
      errorCount: 0,
      warningCount: 1,
      isOnline: true,
      appVersion: '1.0.0',
    };
    expect(session.id).toBe('sess-1');
    expect(session.isOnline).toBeTrue();
    expect(session.pageViews).toBe(5);
    expect(session.errorCount).toBe(0);
  });
});
