import { TestBed } from '@angular/core/testing';
import { NetworkStatusService } from './network-status.service';

describe('NetworkStatusService', () => {
  let service: NetworkStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NetworkStatusService],
    });
    service = TestBed.inject(NetworkStatusService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should have isOnline as a readonly signal', () => {
    expect(service.isOnline).toBeDefined();
  });

  it('isOnlineNow should return boolean', () => {
    const result = service.isOnlineNow;
    expect(typeof result).toBe('boolean');
  });

  it('isOffline should be opposite of isOnlineNow', () => {
    expect(service.isOffline).toBe(!service.isOnlineNow);
  });

  it('should update status to online when online event fires', () => {
    globalThis.dispatchEvent(new Event('online'));
    expect(service.isOnlineNow).toBe(true);
    expect(service.isOffline).toBe(false);
  });

  it('should update status to offline when offline event fires', () => {
    globalThis.dispatchEvent(new Event('offline'));
    expect(service.isOnlineNow).toBe(false);
    expect(service.isOffline).toBe(true);
  });

  it('should restore online after going offline then online', () => {
    globalThis.dispatchEvent(new Event('offline'));
    expect(service.isOffline).toBe(true);

    globalThis.dispatchEvent(new Event('online'));
    expect(service.isOnlineNow).toBe(true);
  });

  it('isOnline signal should reflect current status', () => {
    globalThis.dispatchEvent(new Event('online'));
    expect(service.isOnline()).toBe(true);

    globalThis.dispatchEvent(new Event('offline'));
    expect(service.isOnline()).toBe(false);
  });

  it('ngOnDestroy should not throw', () => {
    expect(() => service.ngOnDestroy()).not.toThrow();
  });
});
