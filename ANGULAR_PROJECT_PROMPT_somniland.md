# Angular 20 Project - AI Prompt

> Use this prompt to guide AI in creating an Angular 20 web application with the same architecture quality as Arcana iOS (Rating: 9.5/10 ⭐⭐⭐⭐⭐)

---

## Project Overview

Create a modern Angular 20 web application named "Arcana Web" that demonstrates:
- **Clean Architecture** with clear separation of concerns
- **Offline-First** design with IndexedDB
- **Analytics Tracking** with comprehensive event tracking
- **Reactive State Management** using RxJS and Signals
- **Production-Ready** code quality (Target: 9.5/10 rating)

---

## Architecture Requirements

### 1. Clean Architecture (3 Layers)

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Components  │→ │   Facades    │→ │  UI States   │       │
│  │   (Angular)  │  │  (ViewModels)│  │              │       │
│  └──────┬───────┘  └──────────────┘  └──────────────┘       │
│         ↓                                                   │
│  ┌──────────────┐                                           │
│  │  Validators  │                                           │
│  │ & Form Logic │                                           │
│  └──────────────┘                                           │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Services   │→ │Business Logic│→ │Domain Models │       │
│  │              │  │              │  │ (Interfaces) │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Repositories │→ │  IndexedDB   │  │  API Client  │       │
│  │(Offline-1st) │  │   (Local)    │  │ (HttpClient) │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 2. Presentation Layer - Input/Output/Effect Pattern

**ViewModel/Facade Structure:**
```typescript
@Injectable()
export class UserListFacade {
  // MARK: - Input
  readonly input = {
    loadInitial: () => this.loadUsers(),
    refresh: () => this.refreshUsers(),
    search: (query: string) => this.searchUsers(query),
    selectUser: (user: User) => this.selectUser(user),
    loadMore: () => this.loadMoreUsers()
  };

  // MARK: - Output (Signals)
  readonly output = {
    users: signal<User[]>([]),
    isLoading: signal<boolean>(false),
    isRefreshing: signal<boolean>(false),
    errorMessage: signal<string | null>(null),
    currentPage: signal<number>(1),
    totalPages: signal<number>(1),
    hasMorePages: computed(() => this.output.currentPage() < this.output.totalPages())
  };

  // MARK: - Effect (Events)
  readonly effect$ = {
    navigateToDetail$: new Subject<User>(),
    showError$: new Subject<AppError>(),
    showSuccess$: new Subject<string>()
  };

  constructor(
    private userService: UserService,
    private analyticsService: AnalyticsService
  ) {}

  private async loadUsers(): Promise<void> {
    this.output.isLoading.set(true);
    try {
      const result = await this.userService.getUsers();
      this.output.users.set(result.items);
      this.output.totalPages.set(result.totalPages);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.output.isLoading.set(false);
    }
  }

  private handleError(error: unknown): void {
    const appError = this.toAppError(error);
    this.output.errorMessage.set(appError.message);
    this.effect$.showError$.next(appError);
    this.analyticsService.trackError(appError);
  }
}
```

**Component Integration:**
```typescript
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  providers: [UserListFacade]
})
export class UserListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    public facade: UserListFacade,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load initial data
    this.facade.input.loadInitial();

    // Subscribe to effects
    this.facade.effect$.navigateToDetail$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.router.navigate(['/users', user.id]));

    this.facade.effect$.showError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.showErrorToast(error));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRefresh(): void {
    this.facade.input.refresh();
  }

  onSearch(query: string): void {
    this.facade.input.search(query);
  }
}
```

**Template:**
```html
<div class="user-list">
  <!-- Loading State -->
  @if (facade.output.isLoading()) {
    <app-loading-spinner />
  }

  <!-- Error State -->
  @if (facade.output.errorMessage(); as error) {
    <app-error-banner [message]="error" (retry)="facade.input.loadInitial()" />
  }

  <!-- User List -->
  @if (!facade.output.isLoading() && facade.output.users(); as users) {
    <div class="users">
      @for (user of users; track user.id) {
        <app-user-card
          [user]="user"
          (click)="facade.input.selectUser(user)"
        />
      }
    </div>
  }

  <!-- Load More -->
  @if (facade.output.hasMorePages()) {
    <button (click)="facade.input.loadMore()">Load More</button>
  }
</div>
```

---

## Core Features Requirements

### 1. User Management (CRUD)
- ✅ Create new users with form validation
- ✅ Read/List users with pagination (10 items per page)
- ✅ Update user information
- ✅ Delete users with confirmation
- ✅ Search and filter users
- ✅ Real-time statistics display

### 2. Offline-First Architecture
- ✅ IndexedDB storage using Dexie.js
- ✅ Automatic sync when online
- ✅ Pending changes tracking
- ✅ Conflict resolution
- ✅ Network status monitoring
- ✅ LRU cache implementation

### 3. Form Validation
```typescript
interface ValidationErrors {
  firstNameError: string | null;
  lastNameError: string | null;
  emailError: string | null;
}

class UserValidator {
  validateFirstName(value: string): string | null {
    if (!value.trim()) return 'First name is required';
    if (value.length < 2) return 'First name must be at least 2 characters';
    if (value.length > 50) return 'First name must not exceed 50 characters';
    if (!/^[a-zA-Z\s-']+$/.test(value)) return 'First name contains invalid characters';
    return null;
  }

  validateEmail(value: string): string | null {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  }
}
```

### 4. Analytics Tracking
```typescript
interface AnalyticsEvent {
  name: string;
  timestamp: Date;
  params: Record<string, any>;
  userId?: string;
  sessionId: string;
}

@Injectable({ providedIn: 'root' })
class AnalyticsService {
  trackScreen(screenName: string, params?: Record<string, any>): void;
  trackEvent(event: AnalyticsEvent): void;
  trackError(error: AppError, context?: Record<string, any>): void;
  trackUserAction(action: string, params?: Record<string, any>): void;
}
```

### 5. API Integration
```typescript
@Injectable({ providedIn: 'root' })
class ApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, options)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }
}
```

---

## Technology Stack

### Core Framework
- **Angular 20** - Latest version with standalone components
- **TypeScript 5+** - Strict mode enabled
- **RxJS 7+** - Reactive programming
- **Signals** - Angular's new reactivity system

### State Management
- **Angular Signals** - Primary state management
- **RxJS Subjects/BehaviorSubjects** - For effects and side effects
- **Facade Pattern** - Service layer for components

### Data & Storage
- **Dexie.js** - IndexedDB wrapper for offline storage
- **HttpClient** - Angular's HTTP module
- **LocalStorage** - For simple key-value pairs

### UI & Styling
- **Standalone Components** - Modern Angular architecture
- **SCSS** - Styling with variables and mixins
- **Angular Material** or **PrimeNG** - Component library (choose one)
- **Responsive Design** - Mobile-first approach

### Testing
- **Jasmine + Karma** - Unit testing
- **Jest** (optional) - Alternative test runner
- **Cypress** - E2E testing
- **Target: 80%+ code coverage**

### Development Tools
- **ESLint + Prettier** - Code quality and formatting
- **Husky** - Git hooks
- **Conventional Commits** - Commit message format

---

## Project Structure

```
src/
├── app/
│   ├── core/                      # Core Layer
│   │   ├── models/                # Domain models (interfaces)
│   │   │   ├── user.model.ts
│   │   │   ├── app-error.model.ts
│   │   │   └── pagination.model.ts
│   │   ├── services/              # Domain services
│   │   │   ├── user.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── network-monitor.service.ts
│   │   ├── validators/            # Business logic validators
│   │   │   └── user.validator.ts
│   │   └── constants/             # App constants
│   │       └── app.constants.ts
│   │
│   ├── data/                      # Data Layer
│   │   ├── repositories/          # Data repositories
│   │   │   ├── user.repository.ts
│   │   │   └── base.repository.ts
│   │   ├── api/                   # API clients
│   │   │   ├── api.service.ts
│   │   │   └── api.interceptors.ts
│   │   └── storage/               # Local storage
│   │       ├── indexed-db.service.ts
│   │       └── cache.service.ts
│   │
│   ├── presentation/              # Presentation Layer
│   │   ├── features/              # Feature modules
│   │   │   ├── users/
│   │   │   │   ├── user-list/
│   │   │   │   │   ├── user-list.component.ts
│   │   │   │   │   ├── user-list.component.html
│   │   │   │   │   ├── user-list.component.scss
│   │   │   │   │   └── user-list.facade.ts
│   │   │   │   ├── user-form/
│   │   │   │   │   ├── user-form.component.ts
│   │   │   │   │   └── user-form.facade.ts
│   │   │   │   └── user-detail/
│   │   │   └── main/
│   │   │       ├── main.component.ts
│   │   │       └── main.facade.ts
│   │   │
│   │   ├── shared/                # Shared components
│   │   │   ├── components/
│   │   │   │   ├── form-field/
│   │   │   │   ├── loading-spinner/
│   │   │   │   ├── error-banner/
│   │   │   │   └── user-card/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   │
│   │   └── layout/                # Layout components
│   │       ├── header/
│   │       ├── footer/
│   │       └── sidebar/
│   │
│   ├── theme/                     # Theming
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── arcana-theme.scss      # Purple gradient theme
│   │
│   └── app.config.ts              # App configuration
│
├── assets/                        # Static assets
│   ├── images/
│   ├── icons/
│   └── i18n/                      # Internationalization
│       ├── en.json
│       └── zh.json
│
└── environments/                  # Environment configs
    ├── environment.ts
    ├── environment.dev.ts
    ├── environment.staging.ts
    └── environment.prod.ts
```

---

## Naming Conventions

### 1. Facade/ViewModel Pattern
- **Method:** `input` object with action methods
- **Properties:** `output` object with Signals
- **Events:** `effect$` object with Subjects ($ suffix for observables)

### 2. Components
- **Standalone:** All components should be standalone
- **Naming:** `feature-name.component.ts`
- **Selector:** `app-feature-name`

### 3. Services
- **Naming:** `feature.service.ts`
- **Injectable:** `@Injectable({ providedIn: 'root' })`

### 4. Models
- **Interfaces:** Use `interface` for data models
- **Naming:** `model-name.model.ts`
- **Export:** Use `export interface`

---

## Architecture Compliance Rules

### 1. Dependency Rules
- ✅ Presentation depends on Domain
- ✅ Domain depends on nothing (pure business logic)
- ✅ Data depends on Domain
- ❌ Domain NEVER depends on Presentation or Data
- ❌ NO cross-layer imports (only through interfaces)

### 2. Component Rules
- ✅ Components are DUMB - only UI logic
- ✅ Facades/Services are SMART - business logic
- ✅ Use Signals for reactive state
- ✅ Use RxJS for side effects (navigation, toasts, etc.)
- ❌ NO business logic in components
- ❌ NO direct HTTP calls in components

### 3. State Management
- ✅ All state in Facade `output` object
- ✅ Use Signals for synchronous state
- ✅ Use Subjects for asynchronous events
- ✅ State is readonly from component perspective
- ❌ NO component state (except UI-only state)

### 4. Testing Requirements
- ✅ Unit tests for all services
- ✅ Unit tests for all validators
- ✅ Unit tests for all facades
- ✅ Component tests for complex logic
- ✅ E2E tests for critical user flows
- ✅ Target: 80%+ code coverage

---

## Code Quality Standards

### 1. TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true
  }
}
```

### 2. ESLint Rules
- ✅ No `any` type (use `unknown` if needed)
- ✅ Explicit return types for functions
- ✅ No unused variables
- ✅ Consistent naming conventions
- ✅ Max file length: 300 lines
- ✅ Max function length: 50 lines

### 3. Error Handling
```typescript
interface AppError {
  code: string;
  message: string;
  category: ErrorCategory;
  underlyingError?: Error;
}

enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN'
}

class ErrorHandler {
  handle(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof HttpErrorResponse) return this.handleHttpError(error);
    return this.handleUnknownError(error);
  }
}
```

---

## UI/UX Requirements

### 1. Arcana Theme (Purple Gradient)
```scss
// _variables.scss
$primary-dark: #2E1F5E;
$primary-mid: #5B3A99;
$primary-light: #764BA2;
$accent-gold: #FFD700;
$accent-gold-light: #FFB800;

$background-gradient: linear-gradient(135deg, $primary-dark, $primary-mid, $primary-light);
```

### 2. Responsive Design
- ✅ Mobile-first approach
- ✅ Breakpoints: 576px, 768px, 992px, 1200px
- ✅ Touch-friendly (minimum 44px tap targets)
- ✅ Fluid typography

### 3. Loading States
- ✅ Skeleton loaders for content
- ✅ Spinner for actions
- ✅ Disable buttons during loading
- ✅ Progress indicators for multi-step processes

### 4. Error States
- ✅ User-friendly error messages
- ✅ Retry functionality
- ✅ Clear error indication
- ✅ Toast notifications for transient errors

---

## Internationalization (i18n)

### Setup
```typescript
// i18n configuration
const i18nConfig = {
  defaultLanguage: 'en',
  availableLanguages: ['en', 'zh'],
  fallbackLanguage: 'en'
};

// Usage in component
{{ 'user.form.firstName' | translate }}
```

### Translation Files
```json
// en.json
{
  "user": {
    "form": {
      "firstName": "First Name",
      "lastName": "Last Name",
      "email": "Email"
    },
    "validation": {
      "required": "This field is required",
      "minLength": "Minimum length is {{min}} characters"
    }
  }
}
```

---

## Environment Configuration

```typescript
// environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://reqres.in/api',
  enableAnalytics: true,
  logLevel: 'debug',
  cacheTTL: 300000, // 5 minutes
  pageSize: 10
};

// environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.arcana.com',
  enableAnalytics: true,
  logLevel: 'error',
  cacheTTL: 600000, // 10 minutes
  pageSize: 10
};
```

---

## Documentation Requirements

### 1. Code Documentation
- ✅ JSDoc comments for all public APIs
- ✅ README.md with setup instructions
- ✅ ARCHITECTURE.md with architecture details
- ✅ API.md with API documentation

### 2. Architecture Documentation
- ✅ Architecture diagrams (Mermaid format)
- ✅ Folder structure explanation
- ✅ Design pattern documentation
- ✅ Decision records (ADRs)

---

## Target Architecture Rating: 9.5/10 ⭐⭐⭐⭐⭐

### Evaluation Criteria
- **Consistency:** 100% - All facades follow identical pattern
- **Type Safety:** 100% - Strict TypeScript, no `any`
- **Testability:** 95% - 80%+ code coverage
- **Readability:** 95% - Clear naming, well-documented
- **Maintainability:** 95% - Clean Architecture, SOLID principles
- **Performance:** 90% - Optimized change detection, lazy loading
- **Accessibility:** 90% - WCAG 2.1 AA compliant

---

## Getting Started Checklist

### Phase 1: Project Setup
- [ ] Create Angular 20 project with standalone components
- [ ] Configure TypeScript strict mode
- [ ] Set up ESLint + Prettier
- [ ] Configure folder structure
- [ ] Set up environment files
- [ ] Install dependencies (RxJS, Dexie.js, etc.)

### Phase 2: Core Implementation
- [ ] Implement domain models and interfaces
- [ ] Create base repository and API service
- [ ] Set up IndexedDB with Dexie.js
- [ ] Implement user validator
- [ ] Create analytics service
- [ ] Set up error handling

### Phase 3: Feature Development
- [ ] Implement MainFacade and MainComponent
- [ ] Implement UserListFacade and UserListComponent
- [ ] Implement UserFormFacade and UserFormComponent
- [ ] Create shared components (form fields, error banners, etc.)
- [ ] Implement routing and navigation

### Phase 4: Advanced Features
- [ ] Add offline-first functionality
- [ ] Implement pagination
- [ ] Add search and filtering
- [ ] Set up analytics tracking
- [ ] Implement internationalization

### Phase 5: Testing & Documentation
- [ ] Write unit tests (target: 80%+ coverage)
- [ ] Write E2E tests for critical flows
- [ ] Create architecture documentation
- [ ] Generate API documentation
- [ ] Evaluate architecture (target: 9.5/10)

---

## AI Implementation Instructions

When implementing this project, follow these guidelines:

1. **Start with Core Layer:** Implement domain models and business logic first
2. **Then Data Layer:** Create repositories and API services
3. **Finally Presentation Layer:** Build facades and components
4. **Test as You Go:** Write tests alongside implementation
5. **Follow Patterns:** Use the Input/Output/Effect pattern consistently
6. **Document Decisions:** Create ADRs for important architectural decisions
7. **Evaluate Quality:** Continuously check against the 9.5/10 rating criteria

---

## Success Metrics

- ✅ **Architecture Rating:** 9.5/10 or higher
- ✅ **Code Coverage:** 80% or higher
- ✅ **Build Time:** Under 30 seconds
- ✅ **Bundle Size:** Under 500KB (gzipped)
- ✅ **Lighthouse Score:** 90+ on all metrics
- ✅ **Zero ESLint Errors:** All code passes linting
- ✅ **Type Safety:** 100% typed (no `any`)

---

**Generated from:** Arcana iOS (Architecture Rating: 9.5/10 ⭐⭐⭐⭐⭐)
**Target Platform:** Web (Angular 20)
**Date:** 2025-11-17
