import { Injectable, signal } from '@angular/core';
import { fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Network Monitor Service
 * Monitors online/offline status and network connectivity
 */
@Injectable({
  providedIn: 'root',
})
export class NetworkMonitorService {
  /**
   * Is online signal
   */
  private readonly isOnlineSignal = signal<boolean>(navigator.onLine);

  /**
   * Read-only is online
   */
  readonly isOnline = this.isOnlineSignal.asReadonly();

  /**
   * Online/offline status observable
   */
  readonly onlineStatus$ = merge(
    of(navigator.onLine),
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  );

  constructor() {
    this.setupListeners();
    console.log('[NetworkMonitor] Service initialized, online:', navigator.onLine);
  }

  /**
   * Setup event listeners for online/offline events
   */
  private setupListeners(): void {
    window.addEventListener('online', () => {
      this.isOnlineSignal.set(true);
      console.log('[NetworkMonitor] Status changed: ONLINE');
    });

    window.addEventListener('offline', () => {
      this.isOnlineSignal.set(false);
      console.log('[NetworkMonitor] Status changed: OFFLINE');
    });
  }

  /**
   * Check if currently online
   */
  checkOnline(): boolean {
    return this.isOnlineSignal();
  }

  /**
   * Check if currently offline
   */
  checkOffline(): boolean {
    return !this.isOnlineSignal();
  }
}
