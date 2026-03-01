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

  it('should update to online when online event fires', () => {
    globalThis.dispatchEvent(new Event('online'));
    expect(service.checkOnline()).toBe(true);
    expect(service.isOnline()).toBe(true);
  });

  it('should update to offline when offline event fires', () => {
    globalThis.dispatchEvent(new Event('offline'));
    expect(service.checkOffline()).toBe(true);
    expect(service.isOnline()).toBe(false);
  });

  it('onlineStatus$ should emit values', (done) => {
    let received = false;
    service.onlineStatus$.subscribe(status => {
      expect(typeof status).toBe('boolean');
      received = true;
      done();
    });
  });
});
