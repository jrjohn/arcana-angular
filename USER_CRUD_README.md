# User CRUD Application with ng-bootstrap

A complete user management system built with Angular 20, ng-bootstrap, and Clean Architecture patterns inspired by the Somniland project.

## 🚀 Features

- **Full CRUD Operations**: Create, Read, Update, and Delete users
- **Clean Architecture**: 3-layer architecture (Presentation, Domain, Data)
- **ng-bootstrap Styling**: Modern UI with Bootstrap 5 and ng-bootstrap components
- **Reactive State Management**: Signals-based state with computed values
- **Input/Output/Effect Pattern**: Consistent ViewModel architecture
- **Caching Strategy**: In-memory LRU cache with automatic expiration
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Form Validation**: Real-time validation with custom validators
- **Responsive Design**: Mobile-first responsive layout
- **Lazy Loading**: Route-based code splitting for optimal performance

## 📁 Project Structure

```
src/app/
├── domain/                          # Business Logic Layer
│   ├── entities/
│   │   ├── user.model.ts           # User entity, DTOs, validators
│   │   ├── pagination.model.ts     # Pagination models
│   │   └── app-error.model.ts      # Error handling models
│   └── services/
│       └── user.service.ts         # Business logic for users
│
├── data/                           # Data Access Layer
│   ├── api/
│   │   └── api.service.ts          # HTTP client with retry logic
│   ├── storage/
│   │   └── cache.service.ts        # LRU in-memory cache
│   └── repositories/
│       └── user.repository.ts      # Data access with caching
│
└── presentation/                    # UI Layer
    ├── features/
    │   └── users/
    │       ├── user-list/          # List with pagination & search
    │       ├── user-form/          # Create & edit form
    │       └── user-detail/        # Detail view
    └── shared/
        └── components/
            ├── confirmation-dialog/
            └── loading-spinner/
```

## 🎨 ng-bootstrap Components Used

### User List
- **NgbAlert**: Success/error notifications
- **NgbPagination**: Paginated user list with boundary links
- **NgbTooltip**: Action button tooltips
- **Bootstrap Icons**: Icons throughout the UI
- **Bootstrap Cards**: Container styling
- **Bootstrap Tables**: Responsive user table
- **Bootstrap Forms**: Search input with icon

### User Form
- **NgbAlert**: Error notifications
- **Bootstrap Forms**: Form controls with validation
- **Bootstrap Buttons**: Primary and secondary actions
- **Bootstrap Cards**: Form container

### User Detail
- **NgbAlert**: Error notifications
- **Bootstrap Cards**: Detail display container
- **Bootstrap Icons**: Information icons
- **Bootstrap Badges**: Status indicators

### Shared Components
- **NgbModal**: Confirmation dialogs
- **NgbActiveModal**: Modal service integration
- **Bootstrap Spinners**: Loading indicators

## 🏗️ Architecture Patterns

### Clean Architecture (3 Layers)

1. **Presentation Layer** ([src/app/presentation](src/app/presentation))
   - View Models with Input/Output/Effect pattern
   - Standalone components with reactive state
   - No business logic or direct API calls

2. **Domain Layer** ([src/app/domain](src/app/domain))
   - Business logic and validation
   - Domain models and DTOs
   - Service contracts

3. **Data Layer** ([src/app/data](src/app/data))
   - API communication
   - Data caching
   - Repository pattern

### Input/Output/Effect (IOE) Pattern

Each ViewModel follows this pattern:

```typescript
// INPUT - User actions
input = {
  loadInitial(): void
  refresh(): void
  submit(): void
}

// OUTPUT - Observable state via Signals
output = {
  users: Signal<User[]>
  isLoading: Signal<boolean>
  errorMessage: Signal<string | null>
  hasError: computed(() => ...)
}

// EFFECT - Side effects as Subjects
effect$ = {
  navigateBack$: Subject<void>
  showError$: Subject<AppError>
  showSuccess$: Subject<string>
}
```

## 📝 Key Features Implemented

### User List Component
- ✅ Paginated table (10 items per page)
- ✅ Search by name or email with debounce
- ✅ Real-time filtering
- ✅ Pagination controls with page numbers
- ✅ Action buttons (View, Edit, Delete)
- ✅ Delete confirmation modal
- ✅ Empty state handling
- ✅ Loading states
- ✅ Error handling with alerts
- ✅ Success notifications
- ✅ Responsive design

### User Form Component (Create/Edit)
- ✅ Dual mode (create and edit)
- ✅ Real-time field validation
- ✅ Custom validators for:
  - First name (2-50 chars, letters only)
  - Last name (2-50 chars, letters only)
  - Email (valid format)
  - Avatar URL (valid URL)
- ✅ Visual validation feedback
- ✅ Avatar preview
- ✅ Cancel confirmation
- ✅ Loading states during save
- ✅ Form requirements help text

### User Detail Component
- ✅ Read-only user information display
- ✅ Avatar display with fallback initials
- ✅ All user fields shown
- ✅ Edit and back navigation
- ✅ Error handling

## 🔧 Technical Implementation

### Validation
```typescript
class UserValidator {
  static validateFirstName(value: string): string | null
  static validateLastName(value: string): string | null
  static validateEmail(value: string): string | null
  static validateAvatar(value?: string): string | null
  static hasErrors(errors: UserValidationErrors): boolean
}
```

### Caching Strategy
```typescript
// Memory Cache → API → Error
CacheService {
  - defaultTTL: 5 minutes
  - maxSize: 100 entries
  - LRU eviction policy
}
```

### Error Handling
```typescript
enum ErrorCategory {
  NETWORK, VALIDATION, STORAGE,
  AUTHENTICATION, AUTHORIZATION,
  NOT_FOUND, UNKNOWN
}

interface AppError {
  code: string
  category: ErrorCategory
  userMessage: string  // User-friendly message
  timestamp: Date
}
```

## 🚦 Running the Application

### Development Server
```bash
npm start
```
Navigate to `http://localhost:4200`

### Build Production
```bash
npm run build
```
Output: `dist/arcana-angular/`

### Run Tests
```bash
npm test
```

## 📡 API Integration

**Base URL**: `https://reqres.in/api`

### Endpoints Used
- `GET /users?page={page}&per_page={size}` - List users
- `GET /users/{id}` - Get single user
- `POST /users` - Create user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### API Features
- ✅ Automatic retry (3 attempts)
- ✅ 30-second timeout
- ✅ Comprehensive error mapping
- ✅ Response caching

## 🎯 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Redirect | Redirects to `/users` |
| `/users` | UserListComponent | List all users |
| `/users/new` | UserFormComponent | Create new user |
| `/users/:id` | UserDetailComponent | View user details |
| `/users/:id/edit` | UserFormComponent | Edit user |
| `**` | Redirect | 404 redirect to `/users` |

## 🎨 Styling

- **Framework**: Bootstrap 5.3.8
- **ng-bootstrap**: 19.0.1
- **Icons**: Bootstrap Icons 1.11.3
- **Build**: SCSS with modern `@use` syntax
- **Responsive**: Mobile-first design

## 📦 Dependencies

### Core
- Angular 20.3.0
- @ng-bootstrap/ng-bootstrap 19.0.1
- Bootstrap 5.3.8
- RxJS 7.8.0

### Development
- TypeScript 5.9.2
- Angular CLI 20.3.10

## 🏆 Comparison with Somniland Implementation

### Similarities
✅ Clean Architecture (3-layer pattern)
✅ Input/Output/Effect ViewModel pattern
✅ Repository pattern with caching
✅ Domain-driven design
✅ Signal-based state management
✅ Comprehensive validation
✅ Error handling strategy
✅ Standalone components

### Differences
🔄 **UI Framework**: ng-bootstrap vs custom Bootstrap classes
🔄 **Storage**: In-memory cache only vs IndexedDB + cache
🔄 **i18n**: Not implemented vs full multi-language support
🔄 **Analytics**: Simplified logging vs full analytics service
🔄 **Offline**: Online-only vs offline-first with sync queue
🔄 **Testing**: To be added vs 217+ tests with 82% coverage

## 🚀 Future Enhancements

- [ ] IndexedDB integration for offline support
- [ ] Internationalization (i18n) support
- [ ] Comprehensive test suite (unit + integration)
- [ ] Analytics service integration
- [ ] Offline sync queue
- [ ] Network status monitoring
- [ ] Advanced search filters
- [ ] Bulk operations
- [ ] Export functionality
- [ ] User profile images upload

## 📖 Resources

- [Angular Documentation](https://angular.dev)
- [ng-bootstrap Documentation](https://ng-bootstrap.github.io/)
- [Bootstrap 5 Documentation](https://getbootstrap.com/)
- [ReqRes API Documentation](https://reqres.in/)

## 📄 License

This project is for educational purposes, demonstrating Clean Architecture and ng-bootstrap integration.

---

**Built with** ❤️ **using Angular 20 and ng-bootstrap**
