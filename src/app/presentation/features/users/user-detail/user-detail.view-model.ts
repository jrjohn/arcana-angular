import { Injectable, signal, computed } from '@angular/core';
import { UserService } from '../../../../domain/services/user.service';
import { User } from '../../../../domain/entities/user.model';
import { AppError } from '../../../../domain/models/app-error';
import { ErrorHandlerService } from '../../../../domain/services/error-handler.service';

/**
 * User Detail ViewModel
 * Handles business logic for user detail component
 */
@Injectable()
export class UserDetailViewModel {
  // State signals
  private userSignal = signal<User | null>(null);
  private isLoadingSignal = signal(false);
  private errorSignal = signal<AppError | null>(null);

  // Computed values
  user = computed(() => this.userSignal());
  isLoading = computed(() => this.isLoadingSignal());
  hasError = computed(() => this.errorSignal() !== null);
  errorMessage = computed(() => this.errorSignal()?.getUserMessage() || '');

  constructor(
    private userService: UserService,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Load user by ID
   */
  loadUser(userId: string): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.userService.getUser(userId).subscribe({
      next: user => {
        this.userSignal.set(user);
        this.isLoadingSignal.set(false);
      },
      error: (error: unknown) => {
        const appError = this.errorHandler.handleError(error);
        this.errorSignal.set(appError);
        this.isLoadingSignal.set(false);
      },
    });
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.userSignal();
  }
}
