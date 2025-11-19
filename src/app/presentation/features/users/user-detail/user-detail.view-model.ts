import { Injectable, signal, computed, effect } from '@angular/core';
import { Subject } from 'rxjs';
import { UserService } from '../../../../domain/services/user.service';
import { User } from '../../../../domain/entities/user.model';
import { AppError } from '../../../../domain/models/app-error';
import { ErrorHandlerService } from '../../../../domain/services/error-handler.service';
import { BaseViewModel } from '../../../shared/base';

/**
 * User Detail ViewModel
 * Follows Input/Output/Effect pattern for reactive state management
 * Extends BaseViewModel for common functionality (NavGraph, etc.)
 */
@Injectable()
export class UserDetailViewModel extends BaseViewModel {
  // ========== PRIVATE STATE ==========
  private userIdSignal = signal<string | null>(null);
  private userSignal = signal<User | null>(null);
  private isLoadingSignal = signal(false);
  private errorSignal = signal<AppError | null>(null);

  // ========== INPUT (Actions) ==========
  readonly input = {
    /**
     * Load user by ID
     */
    loadUser: (userId: string) => this.userIdSignal.set(userId),

    /**
     * Retry loading current user
     */
    retry: () => {
      const userId = this.userIdSignal();
      if (userId) {
        this.loadUserData(userId);
      }
    },

    /**
     * Clear error state
     */
    clearError: () => this.errorSignal.set(null),
  };

  // ========== OUTPUT (State) ==========
  readonly output = {
    /**
     * Current user data
     */
    user: computed(() => this.userSignal()),

    /**
     * Loading state indicator
     */
    isLoading: computed(() => this.isLoadingSignal()),

    /**
     * Error presence indicator
     */
    hasError: computed(() => this.errorSignal() !== null),

    /**
     * User-friendly error message
     */
    errorMessage: computed(() => this.errorSignal()?.getUserMessage() || ''),

    /**
     * Whether retry is possible for current error
     */
    canRetry: computed(() => this.errorSignal()?.isRetryable() ?? false),

    /**
     * User display name (computed from user data)
     */
    displayName: computed(() => {
      const user = this.userSignal();
      return user ? `${user.firstName} ${user.lastName} (${user.email})` : '';
    }),
  };

  // ========== EFFECTS (Side Effects) ==========
  readonly effect$ = {
    /**
     * Emits when user data is loaded successfully
     */
    userLoaded$: new Subject<User>(),

    /**
     * Emits when loading fails
     */
    loadError$: new Subject<AppError>(),
  };

  constructor(
    private userService: UserService,
    private errorHandler: ErrorHandlerService
  ) {
    super();

    // Auto-load user when userId changes
    effect(() => {
      const userId = this.userIdSignal();
      if (userId) {
        this.loadUserData(userId);
      }
    }, { allowSignalWrites: true });

    // Log errors automatically
    effect(() => {
      const error = this.errorSignal();
      if (error) {
        this.errorHandler.logError(error);
        this.effect$.loadError$.next(error);
      }
    });
  }

  // ========== PRIVATE METHODS ==========
  /**
   * Internal method to load user data
   */
  private loadUserData(userId: string): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.userService.getUser(userId).subscribe({
      next: user => {
        this.userSignal.set(user);
        this.isLoadingSignal.set(false);
        this.effect$.userLoaded$.next(user);
      },
      error: (error: unknown) => {
        const appError = this.errorHandler.handleError(error);
        this.errorSignal.set(appError);
        this.isLoadingSignal.set(false);
      },
    });
  }
}
