import { Injectable, signal, computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { UserService } from '../../../domain/services/user.service';
import { NavGraphService } from '../../../domain/services/nav-graph.service';
import { User } from '../../../domain/entities/user.model';
import { AppError } from '../../../domain/entities/app-error.model';

/**
 * User Panel ViewModel
 * Manages state and logic for user panel (right slide-out panel)
 * Follows Input/Output/Effect pattern for clean separation of concerns
 * Uses NavGraph for centralized navigation
 */
@Injectable()
export class UserPanelViewModel {
  private userService = inject(UserService);
  private navGraph = inject(NavGraphService);

  // State signals - Private internal state
  private readonly usersSignal = signal<User[]>([]);
  private readonly isLoadingSignal = signal(false);
  private readonly errorMessageSignal = signal<string | null>(null);
  private readonly currentPageSignal = signal(1);
  private readonly totalPagesSignal = signal(0);
  private readonly totalItemsSignal = signal(0);
  private readonly pageSizeSignal = signal(10);
  private readonly searchQuerySignal = signal('');

  // Input - User actions and commands
  readonly input = {
    /**
     * Load initial users when panel opens
     */
    loadInitial: () => this.loadUsers(1),

    /**
     * Search for users by query
     */
    search: (query: string) => this.search(query),

    /**
     * Navigate to specific page
     */
    goToPage: (page: number) => this.loadUsers(page),

    /**
     * View user details - navigates using NavGraph
     */
    viewUser: (user: User, onNavigate?: () => void) => {
      this.navGraph.users.toUserDetail(user);
      onNavigate?.();
    },

    /**
     * Edit user - navigates using NavGraph
     */
    editUser: (user: User, onNavigate?: () => void) => {
      this.navGraph.users.toUserEdit(user);
      onNavigate?.();
    },

    /**
     * Create new user - navigates using NavGraph
     */
    createUser: (onNavigate?: () => void) => {
      this.navGraph.users.toCreate();
      onNavigate?.();
    },

    /**
     * View all users in main list page - navigates using NavGraph
     */
    viewAllUsers: (onNavigate?: () => void) => {
      this.navGraph.users.toList();
      onNavigate?.();
    },

    /**
     * Close the panel
     */
    closePanel: () => this.effect$.closePanel$.next(),
  };

  // Output - Observable state for components to consume
  readonly output = {
    users: this.usersSignal.asReadonly(),
    isLoading: this.isLoadingSignal.asReadonly(),
    errorMessage: this.errorMessageSignal.asReadonly(),
    currentPage: this.currentPageSignal.asReadonly(),
    totalPages: this.totalPagesSignal.asReadonly(),
    totalItems: this.totalItemsSignal.asReadonly(),
    pageSize: this.pageSizeSignal.asReadonly(),
    searchQuery: this.searchQuerySignal.asReadonly(),
    isEmpty: computed(() => this.usersSignal().length === 0 && !this.isLoadingSignal()),
    hasError: computed(() => this.errorMessageSignal() !== null),
    hasMultiplePages: computed(() => this.totalPagesSignal() > 1),
    // Pagination display info
    startIndex: computed(() => (this.currentPageSignal() - 1) * this.pageSizeSignal() + 1),
    endIndex: computed(() =>
      Math.min(this.currentPageSignal() * this.pageSizeSignal(), this.totalItemsSignal())
    ),
  };

  // Effect - Side effects as Subjects (only for non-navigation effects)
  readonly effect$ = {
    closePanel$: new Subject<void>(),
    showError$: new Subject<AppError>(),
  };

  /**
   * Loads users for given page
   * @private
   */
  private loadUsers(page: number): void {
    this.isLoadingSignal.set(true);
    this.errorMessageSignal.set(null);

    const query = this.searchQuerySignal();

    const request$ = query
      ? this.userService.searchUsers(query, { page, pageSize: this.pageSizeSignal() })
      : this.userService.getUsers({ page, pageSize: this.pageSizeSignal() });

    request$.subscribe({
      next: response => {
        this.usersSignal.set(response.data);
        this.currentPageSignal.set(response.page);
        this.totalPagesSignal.set(response.totalPages);
        this.totalItemsSignal.set(response.total);
        this.isLoadingSignal.set(false);
      },
      error: (error: AppError) => {
        this.errorMessageSignal.set(error.userMessage);
        this.isLoadingSignal.set(false);
        this.effect$.showError$.next(error);
      },
    });
  }

  /**
   * Searches users by query
   * Resets to page 1 when searching
   * @private
   */
  private search(query: string): void {
    this.searchQuerySignal.set(query);
    this.loadUsers(1); // Reset to page 1 on search
  }
}
