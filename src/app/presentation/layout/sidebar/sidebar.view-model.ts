import { Injectable, signal, computed, effect } from '@angular/core';
import { Subject } from 'rxjs';
import { UserService } from '../../../domain/services/user.service';

/**
 * Sidebar ViewModel
 * Follows Input/Output/Effect pattern for reactive state management
 */
@Injectable()
export class SidebarViewModel {
  // ========== PRIVATE STATE ==========
  private userCountSignal = signal<number>(0);
  private isLoadingSignal = signal<boolean>(false);

  // ========== INPUT (Actions) ==========
  readonly input = {
    /**
     * Reload user count from service
     */
    refresh: () => this.loadUserCount(),
  };

  // ========== OUTPUT (State) ==========
  readonly output = {
    /**
     * User count as computed value
     */
    userCount: computed(() => this.userCountSignal()),

    /**
     * Loading state
     */
    isLoading: computed(() => this.isLoadingSignal()),

    /**
     * Badge text for user menu item
     */
    userBadge: computed(() => {
      const count = this.userCountSignal();
      return count > 0 ? count.toString() : undefined;
    }),
  };

  // ========== EFFECTS (Side Effects) ==========
  readonly effect$ = {
    /**
     * Emits when user count fails to load
     */
    loadError$: new Subject<Error>(),
  };

  constructor(private userService: UserService) {
    // Auto-load user count on initialization
    effect(() => {
      this.loadUserCount();
    }, { allowSignalWrites: true });
  }

  // ========== PRIVATE METHODS ==========
  /**
   * Load user count from service
   */
  private loadUserCount(): void {
    this.isLoadingSignal.set(true);

    this.userService.getUsers({ page: 1, pageSize: 1 }).subscribe({
      next: response => {
        this.userCountSignal.set(response.total);
        this.isLoadingSignal.set(false);
      },
      error: (error: Error) => {
        // Silently fail - user count is not critical
        this.userCountSignal.set(0);
        this.isLoadingSignal.set(false);
        this.effect$.loadError$.next(error);
      },
    });
  }
}
