# ViewModel Input/Output/Effect Pattern

This document explains the **Input/Output/Effect** pattern used in the ViewModels throughout the application.

## Pattern Overview

The Input/Output/Effect pattern is a reactive state management approach that provides:
- **Clear separation of concerns** between data flow directions
- **Predictable state updates** through signals and computed values
- **Side effect isolation** using Angular's effect API
- **Type-safe reactive programming** with full IDE support

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Component (View)                    │
│  - User interactions                             │
│  - Template bindings                             │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│           ViewModel (MVVM)                       │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  INPUTS (State Signals)                  │    │
│  │  - Private writable signals              │    │
│  │  - Source of truth for component state   │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  OUTPUTS (Computed Signals)              │    │
│  │  - Public readonly computed values       │    │
│  │  - Derived state from inputs             │    │
│  │  - Automatically updated                 │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  EFFECTS (Side Effects)                  │    │
│  │  - Reactive side effects                 │    │
│  │  - Auto-run when dependencies change     │    │
│  │  - API calls, logging, navigation        │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  ACTIONS (Methods)                       │    │
│  │  - User-triggered operations             │    │
│  │  - Update state signals                  │    │
│  │  - Trigger effects indirectly            │    │
│  └─────────────────────────────────────────┘    │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│          Domain Services                         │
│  - Business logic                                │
│  - API communication                             │
│  - Data transformation                           │
└─────────────────────────────────────────────────┘
```

---

## Implementation Examples

### 1. Sidebar ViewModel

**File**: [sidebar.view-model.ts](src/app/presentation/layout/sidebar/sidebar.view-model.ts)

```typescript
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
  private loadUserCount(): void {
    this.isLoadingSignal.set(true);
    this.userService.getUsers({ page: 1, pageSize: 1 }).subscribe({
      next: response => {
        this.userCountSignal.set(response.total);
        this.isLoadingSignal.set(false);
      },
      error: (error: Error) => {
        this.userCountSignal.set(0);
        this.isLoadingSignal.set(false);
        this.effect$.loadError$.next(error);
      },
    });
  }
}
```

**Usage in Component**:
```typescript
export class SidebarComponent {
  vm = inject(SidebarViewModel);

  // Access outputs via vm.output
  getUserBadge(item: MenuItem): string | undefined {
    return item.id === 'users'
      ? this.vm.output.userBadge()
      : item.badge;
  }

  // Trigger actions via vm.input
  onRefresh(): void {
    this.vm.input.refresh();
  }
}
```

---

### 2. User Detail ViewModel

**File**: [user-detail.view-model.ts](src/app/presentation/features/users/user-detail/user-detail.view-model.ts)

```typescript
@Injectable()
export class UserDetailViewModel {
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
```

**Usage in Component**:
```typescript
export class UserDetailComponent implements OnInit, OnDestroy {
  vm = inject(UserDetailViewModel);
  private destroy$ = new Subject<void>();

  // Expose outputs
  user = this.vm.output.user;
  isLoading = this.vm.output.isLoading;
  hasError = this.vm.output.hasError;
  errorMessage = this.vm.output.errorMessage;

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      // Trigger action via vm.input
      this.vm.input.loadUser(userId);
    }

    // Subscribe to effects
    this.vm.effect$.userLoaded$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        console.log('User loaded:', user);
      });
  }

  onRetry(): void {
    // Trigger action via vm.input
    this.vm.input.retry();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

### 3. User List ViewModel (Advanced Pattern)

**File**: [user-list.view-model.ts](src/app/presentation/features/users/user-list/user-list.view-model.ts)

This ViewModel uses a more structured approach with explicit `input`, `output`, and `effect$` objects:

```typescript
@Injectable()
export class UserListViewModel {
  // State signals
  private readonly usersSignal = signal<User[]>([]);
  private readonly isLoadingSignal = signal(false);
  // ... more state

  // ========== INPUT (Actions) ==========
  readonly input = {
    loadInitial: () => this.loadUsers(1),
    refresh: () => this.refreshUsers(),
    search: (query: string) => this.search(query),
    selectUser: (user: User) => this.navGraph.users.toUserDetail(user),
    editUser: (user: User) => this.navGraph.users.toUserEdit(user),
    deleteUser: (user: User) => this.confirmDelete(user),
    goToPage: (page: number) => this.loadUsers(page),
  };

  // ========== OUTPUT (State) ==========
  readonly output = {
    users: this.usersSignal.asReadonly(),
    isLoading: this.isLoadingSignal.asReadonly(),
    currentPage: this.currentPageSignal.asReadonly(),
    hasMorePages: computed(() => this.currentPageSignal() < this.totalPagesSignal()),
    isEmpty: computed(() => this.usersSignal().length === 0 && !this.isLoadingSignal()),
  };

  // ========== EFFECTS (Subjects for non-navigation effects) ==========
  readonly effect$ = {
    showError$: new Subject<AppError>(),
    showSuccess$: new Subject<string>(),
    confirmDelete$: new Subject<User>(),
  };
}
```

**Usage in Component**:
```typescript
export class UserListComponent {
  vm = inject(UserListViewModel);

  ngOnInit(): void {
    // Subscribe to effects
    this.vm.effect$.showError$.pipe(takeUntil(this.destroy$))
      .subscribe(error => this.showErrorAlert(error));

    // Trigger actions
    this.vm.input.loadInitial();
  }

  onUserClick(user: User): void {
    this.vm.input.selectUser(user);
  }
}
```

---

## Benefits

### 1. **Separation of Concerns**
- **Components** handle only UI rendering and user interactions
- **ViewModels** manage state and business logic
- **Services** handle data access and domain logic

### 2. **Reactivity**
- Changes to input signals automatically update computed outputs
- Effects run automatically when dependencies change
- No manual subscription management needed

### 3. **Type Safety**
- Full TypeScript support for all signals and computed values
- IDE autocomplete and type checking
- Compile-time error detection

### 4. **Testability**
- ViewModels can be tested independently from components
- Mock services easily with dependency injection
- No need for DOM or template testing

### 5. **Performance**
- OnPush change detection compatible
- Computed values are memoized (only recompute when inputs change)
- Minimal re-rendering

### 6. **Maintainability**
- Clear structure: INPUTS → OUTPUTS → EFFECTS → ACTIONS
- Easy to understand data flow
- Self-documenting code

---

## Best Practices

### ✅ DO

1. **Use private signals for state, public computed for outputs**
   ```typescript
   private userSignal = signal<User | null>(null);
   readonly user = computed(() => this.userSignal());
   ```

2. **Name signals with 'Signal' suffix for clarity**
   ```typescript
   private isLoadingSignal = signal(false);
   readonly isLoading = computed(() => this.isLoadingSignal());
   ```

3. **Use effects for automatic side effects**
   ```typescript
   effect(() => {
     const userId = this.userIdSignal();
     if (userId) {
       this.loadData(userId);
     }
   }, { allowSignalWrites: true });
   ```

4. **Keep effects pure and focused**
   - One effect per logical side effect
   - Clear dependency tracking

5. **Use readonly for outputs**
   ```typescript
   readonly displayName = computed(() => `${this.user()?.firstName} ${this.user()?.lastName}`);
   ```

### ❌ DON'T

1. **Don't expose writable signals directly**
   ```typescript
   // ❌ Bad
   userCount = signal<number>(0);

   // ✅ Good
   private userCountSignal = signal<number>(0);
   readonly userCount = computed(() => this.userCountSignal());
   ```

2. **Don't put business logic in components**
   ```typescript
   // ❌ Bad: In component
   loadUsers() {
     this.userService.getUsers().subscribe(/*...*/);
   }

   // ✅ Good: In ViewModel
   loadUsers() {
     this.userService.getUsers().subscribe(/*...*/);
   }
   ```

3. **Don't create circular dependencies in effects**
   ```typescript
   // ❌ Bad: Infinite loop
   effect(() => {
     this.countSignal.set(this.countSignal() + 1);
   });
   ```

4. **Don't mix imperative and reactive approaches**
   - Choose either effects or manual subscriptions, not both

---

## Testing ViewModels

```typescript
describe('UserDetailViewModel', () => {
  let viewModel: UserDetailViewModel;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);

    TestBed.configureTestingModule({
      providers: [
        UserDetailViewModel,
        { provide: UserService, useValue: userServiceSpy },
        ErrorHandlerService
      ]
    });

    viewModel = TestBed.inject(UserDetailViewModel);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should load user when userId is set', fakeAsync(() => {
    const mockUser = { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' };
    userService.getUser.and.returnValue(of(mockUser));

    viewModel.loadUser('1');
    tick();

    expect(viewModel.user()).toEqual(mockUser);
    expect(viewModel.isLoading()).toBe(false);
  }));

  it('should compute displayName correctly', () => {
    const mockUser = { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' };
    userService.getUser.and.returnValue(of(mockUser));

    viewModel.loadUser('1');

    expect(viewModel.displayName()).toBe('John Doe (john@test.com)');
  });
});
```

---

## Migration Guide

### From Direct Service Usage to ViewModel

**Before**:
```typescript
@Component({/*...*/})
export class SidebarComponent {
  private userService = inject(UserService);
  userCount = signal<number>(0);

  ngOnInit() {
    this.userService.getUsers({ page: 1, pageSize: 1 }).subscribe({
      next: response => this.userCount.set(response.total)
    });
  }
}
```

**After**:
```typescript
@Component({
  providers: [SidebarViewModel]  // Add ViewModel
})
export class SidebarComponent {
  viewModel = inject(SidebarViewModel);

  // Access computed values
  getUserBadge() {
    return this.viewModel.userBadge();
  }
}
```

---

## References

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Computed Signals](https://angular.dev/guide/signals#computed-signals)
- [Effects](https://angular.dev/guide/signals#effects)
- [MVVM Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
**Status**: ✅ Production Ready
