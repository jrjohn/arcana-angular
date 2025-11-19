import { Injectable, signal, computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { UserService } from '../../../../domain/services/user.service';
import { NavGraphService } from '../../../../domain/services/nav-graph.service';
import { User } from '../../../../domain/entities/user.model';
import { AppError } from '../../../../domain/entities/app-error.model';

/**
 * User List ViewModel
 * Manages state and logic for user list view
 * Uses NavGraph for centralized navigation
 */
@Injectable()
export class UserListViewModel {
  private userService = inject(UserService);
  private navGraph = inject(NavGraphService);

  // State signals
  private readonly usersSignal = signal<User[]>([]);
  private readonly isLoadingSignal = signal(false);
  private readonly isRefreshingSignal = signal(false);
  private readonly isLoadingMoreSignal = signal(false);
  private readonly errorMessageSignal = signal<string | null>(null);
  private readonly currentPageSignal = signal(1);
  private readonly totalPagesSignal = signal(0);
  private readonly totalItemsSignal = signal(0);
  private readonly pageSizeSignal = signal(10);
  private readonly searchQuerySignal = signal('');

  // Input - User actions
  readonly input = {
    loadInitial: () => this.loadUsers(1),
    refresh: () => this.refreshUsers(),
    search: (query: string) => this.search(query),
    selectUser: (user: User) => this.navGraph.users.toUserDetail(user),
    editUser: (user: User) => this.navGraph.users.toUserEdit(user),
    loadMore: () => this.loadMore(),
    deleteUser: (user: User) => this.confirmDelete(user),
    goToPage: (page: number) => this.loadUsers(page),
    createUser: () => this.navGraph.users.toCreate(),
  };

  // Output - Observable state
  readonly output = {
    users: this.usersSignal.asReadonly(),
    isLoading: this.isLoadingSignal.asReadonly(),
    isRefreshing: this.isRefreshingSignal.asReadonly(),
    isLoadingMore: this.isLoadingMoreSignal.asReadonly(),
    errorMessage: this.errorMessageSignal.asReadonly(),
    currentPage: this.currentPageSignal.asReadonly(),
    totalPages: this.totalPagesSignal.asReadonly(),
    totalItems: this.totalItemsSignal.asReadonly(),
    pageSize: this.pageSizeSignal.asReadonly(),
    searchQuery: this.searchQuerySignal.asReadonly(),
    hasMorePages: computed(() => this.currentPageSignal() < this.totalPagesSignal()),
    isEmpty: computed(() => this.usersSignal().length === 0 && !this.isLoadingSignal()),
    hasError: computed(() => this.errorMessageSignal() !== null),
  };

  // Effect - Side effects as Subjects (only for non-navigation effects)
  readonly effect$ = {
    showError$: new Subject<AppError>(),
    showSuccess$: new Subject<string>(),
    confirmDelete$: new Subject<User>(),
  };

  /**
   * Loads users for given page
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
   * Refreshes current page
   */
  private refreshUsers(): void {
    this.isRefreshingSignal.set(true);
    this.errorMessageSignal.set(null);

    const currentPage = this.currentPageSignal();
    const query = this.searchQuerySignal();

    const request$ = query
      ? this.userService.searchUsers(query, {
          page: currentPage,
          pageSize: this.pageSizeSignal(),
        })
      : this.userService.getUsers({ page: currentPage, pageSize: this.pageSizeSignal() });

    request$.subscribe({
      next: response => {
        this.usersSignal.set(response.data);
        this.totalPagesSignal.set(response.totalPages);
        this.totalItemsSignal.set(response.total);
        this.isRefreshingSignal.set(false);
        this.effect$.showSuccess$.next('Users refreshed successfully');
      },
      error: (error: AppError) => {
        this.errorMessageSignal.set(error.userMessage);
        this.isRefreshingSignal.set(false);
        this.effect$.showError$.next(error);
      },
    });
  }

  /**
   * Searches users
   */
  private search(query: string): void {
    this.searchQuerySignal.set(query);
    this.loadUsers(1); // Reset to page 1 on search
  }

  /**
   * Loads more users (next page)
   */
  private loadMore(): void {
    if (!this.output.hasMorePages()) {
      return;
    }

    this.isLoadingMoreSignal.set(true);
    const nextPage = this.currentPageSignal() + 1;

    this.userService
      .getUsers({ page: nextPage, pageSize: this.pageSizeSignal() })
      .subscribe({
        next: response => {
          this.usersSignal.update(users => [...users, ...response.data]);
          this.currentPageSignal.set(response.page);
          this.isLoadingMoreSignal.set(false);
        },
        error: (error: AppError) => {
          this.isLoadingMoreSignal.set(false);
          this.effect$.showError$.next(error);
        },
      });
  }

  /**
   * Confirms user deletion
   */
  private confirmDelete(user: User): void {
    this.effect$.confirmDelete$.next(user);
  }

  /**
   * Deletes user after confirmation
   */
  deleteUserConfirmed(user: User): void {
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.usersSignal.update(users => users.filter(u => u.id !== user.id));
        this.totalItemsSignal.update(total => total - 1);
        this.effect$.showSuccess$.next('User deleted successfully');
      },
      error: (error: AppError) => {
        this.effect$.showError$.next(error);
      },
    });
  }
}
