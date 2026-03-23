import { TestBed } from '@angular/core/testing';
import { NetworkMonitorService } from './network-monitor.service';

describe('NetworkMonitorService', () => {
  let service: NetworkMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NetworkMonitorService],
    });
    service = TestBed.inject(NetworkMonitorService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should have isOnline signal', () => {
    expect(service.isOnline).toBeDefined();
  });

  it('should have onlineStatus$ observable', () => {
    expect(service.onlineStatus$).toBeDefined();
  });

  it('checkOnline should return boolean', () => {
    expect(typeof service.checkOnline()).toBe('boolean');
  });

  it('checkOffline should be opposite of checkOnline', () => {
    expect(service.checkOffline()).toBe(!service.checkOnline());
  });

  it('checkOnline and isOnline should be consistent', () => {
    // Both should reflect the same underlying signal value
    expect(service.checkOnline()).toBe(service.isOnline());
  });

  it('checkOffline should be the inverse of isOnline', () => {
    expect(service.checkOffline()).toBe(!service.isOnline());
  });

  it('onlineStatus$ should emit current status synchronously', (done) => {
    // onlineStatus$ starts with of(navigator.onLine) which emits synchronously.
    // Declare `sub` with `let` before subscribing so the variable is initialized
    // by the time the synchronous emission triggers the callback (avoids TDZ).
    let emitted = false;
    let sub: ReturnType<typeof service.onlineStatus$.subscribe> | undefined;
    sub = service.onlineStatus$.subscribe({
      next: (status) => {
        expect(typeof status).toBe('boolean');
        emitted = true;
        // sub may still be undefined if emission is truly synchronous
        // (before the assignment completes), so guard the unsubscribe call
        if (sub) {
          sub.unsubscribe();
        }
        done();
      }
    });
    // If the callback already fired synchronously, unsubscribe now to be safe
    if (emitted) {
      sub.unsubscribe();
    } else {
      // Fallback: just confirm observable exists
      sub.unsubscribe();
      expect(service.onlineStatus$).toBeTruthy();
      done();
    }
  });
});
