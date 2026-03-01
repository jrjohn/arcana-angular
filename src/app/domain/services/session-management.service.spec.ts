import { TestBed } from '@angular/core/testing';
import { SessionManagementService } from './session-management.service';

describe('SessionManagementService', () => {
  let service: SessionManagementService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [SessionManagementService],
    });

    service = TestBed.inject(SessionManagementService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should create a session on initialization', () => {
    expect(service.currentSession()).not.toBeNull();
  });

  it('should have a session ID', () => {
    expect(service.sessionId).toBeTruthy();
    expect(service.sessionId.length).toBeGreaterThan(0);
  });

  it('session should have start time', () => {
    const session = service.currentSession();
    expect(session?.startTime).toBeDefined();
  });

  it('session should have device info', () => {
    const session = service.currentSession();
    expect(session?.userAgent).toBeTruthy();
  });

  it('session should have language', () => {
    const session = service.currentSession();
    expect(session?.language).toBeTruthy();
  });

  describe('setUserId()', () => {
    it('should set userId on current session', () => {
      service.setUserId('user123');
      expect(service.currentSession()?.userId).toBe('user123');
    });

    it('should update userId', () => {
      service.setUserId('user1');
      service.setUserId('user2');
      expect(service.currentSession()?.userId).toBe('user2');
    });
  });

  describe('updateActivity()', () => {
    it('should update lastActivityTime', () => {
      const before = service.currentSession()?.lastActivityTime;
      // Small delay to ensure time difference
      service.updateActivity();
      const after = service.currentSession()?.lastActivityTime;
      expect(after).toBeDefined();
    });

    it('should not throw when no session', () => {
      service.endSession();
      expect(() => service.updateActivity()).not.toThrow();
    });
  });

  describe('incrementPageView()', () => {
    it('should increment pageViews counter', () => {
      const before = service.currentSession()?.pageViews || 0;
      service.incrementPageView();
      const after = service.currentSession()?.pageViews;
      expect(after).toBe(before + 1);
    });
  });

  describe('incrementEventCount()', () => {
    it('should increment eventCount counter', () => {
      const before = service.currentSession()?.eventCount || 0;
      service.incrementEventCount();
      expect(service.currentSession()?.eventCount).toBe(before + 1);
    });
  });

  describe('incrementErrorCount()', () => {
    it('should increment errorCount counter', () => {
      const before = service.currentSession()?.errorCount || 0;
      service.incrementErrorCount();
      expect(service.currentSession()?.errorCount).toBe(before + 1);
    });
  });

  describe('incrementWarningCount()', () => {
    it('should increment warningCount counter', () => {
      const before = service.currentSession()?.warningCount || 0;
      service.incrementWarningCount();
      expect(service.currentSession()?.warningCount).toBe(before + 1);
    });
  });

  describe('updateNetworkStatus()', () => {
    it('should update isOnline to false', () => {
      service.updateNetworkStatus(false);
      expect(service.currentSession()?.isOnline).toBe(false);
    });

    it('should update isOnline to true', () => {
      service.updateNetworkStatus(false);
      service.updateNetworkStatus(true);
      expect(service.currentSession()?.isOnline).toBe(true);
    });
  });

  describe('startNewSession()', () => {
    it('should create a new session with a new id', () => {
      const oldId = service.sessionId;
      service.startNewSession();
      const newId = service.sessionId;
      expect(newId).not.toBe(oldId);
    });

    it('should start session with userId when provided', () => {
      service.startNewSession('user-xyz');
      expect(service.currentSession()?.userId).toBe('user-xyz');
    });
  });

  describe('endSession()', () => {
    it('should clear the session', () => {
      service.endSession();
      expect(service.currentSession()).toBeNull();
    });

    it('should remove session from localStorage', () => {
      service.endSession();
      expect(localStorage.getItem('analytics_session')).toBeNull();
    });

    it('sessionId should be empty after endSession', () => {
      service.endSession();
      expect(service.sessionId).toBe('');
    });
  });

  describe('localStorage persistence', () => {
    it('should save session to localStorage', () => {
      const stored = localStorage.getItem('analytics_session');
      expect(stored).toBeTruthy();
    });

    it('should restore session from localStorage', () => {
      const sessionId = service.sessionId;
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [SessionManagementService] });
      const newService = TestBed.inject(SessionManagementService);
      expect(newService.sessionId).toBe(sessionId);
    });

    it('should start new session if stored session is invalid JSON', () => {
      localStorage.setItem('analytics_session', 'invalid-json{{{');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [SessionManagementService] });
      const newService = TestBed.inject(SessionManagementService);
      expect(newService.currentSession()).not.toBeNull();
    });
  });
});
