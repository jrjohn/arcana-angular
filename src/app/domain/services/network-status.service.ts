import { Injectable, signal, OnDestroy } from '@angular/core';
import { fromEvent, merge, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Network Status Service
 * Monitors online/offline status and provides reactive signals
 */
@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService implements OnDestroy {
  private readonly onlineSignal = signal<boolean>(navigator.onLine);
  private networkSubscription?: Subscription;

  constructor() {
    this.initializeNetworkMonitoring();
  }

  ngOnDestroy(): void {
    this.networkSubscription?.unsubscribe();
  }

  /**
   * Returns readonly signal for online status
   */
  get isOnline() {
    return this.onlineSignal.asReadonly();
  }

  /**
   * Gets current online status synchronously
   */
  get isOnlineNow(): boolean {
    return this.onlineSignal();
  }

  /**
   * Gets current offline status synchronously
   */
  get isOffline(): boolean {
    return !this.onlineSignal();
  }

  /**
   * Initialize network status monitoring
   */
  private initializeNetworkMonitoring(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Listen to online/offline events
    this.networkSubscription = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(isOnline => {
      this.onlineSignal.set(isOnline);
    });
  }
}
