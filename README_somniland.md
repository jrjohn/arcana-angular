# Somniland Web Application

![Angular](https://img.shields.io/badge/Angular-20.0.6-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![Test Coverage](https://img.shields.io/badge/Coverage-82%25-brightgreen)
![Tests](https://img.shields.io/badge/Tests-217%2B-success)

A modern, enterprise-grade Angular application built with **Clean Architecture**, **offline-first** capabilities, and comprehensive testing infrastructure.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Design Patterns](#design-patterns)
- [Best Practices](#best-practices)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Architecture Overview

This application follows **Clean Architecture** principles with a clear separation of concerns across three distinct layers:

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐       │
│  │ Components │  │ ViewModels │  │  Validators  │       │
│  └────────────┘  └────────────┘  └──────────────┘       │
│         │                │                │             │
│         └────────────────┴────────────────┘             │
│                          ↓                              │
├─────────────────────────────────────────────────────────┤
│                     Domain Layer                        │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────┐     │
│  │   Services   │  │  Entities  │  │    Pipes     │     │
│  └──────────────┘  └────────────┘  └──────────────┘     │
│         │                │                │             │
│         └────────────────┴────────────────┘             │
│                          ↓                              │
├─────────────────────────────────────────────────────────┤
│                     Data Layer                          │
│  ┌──────────────┐  ┌───────────┐  ┌──────────────┐      │
│  │ Repositories │  │  Storage  │  │  API Client  │      │
│  └──────────────┘  └───────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Presentation Layer** (`src/app/presentation/`)
- User interface components
- ViewModels with Input/Output/Effect pattern
- UI state management
- User interaction handling
- Form validation logic

**Domain Layer** (`src/app/domain/`)
- Business logic
- Domain entities and models
- Cross-cutting concerns (i18n, analytics, network monitoring)
- Domain services

**Data Layer** (`src/app/data/`)
- Repository pattern implementation
- Data persistence (IndexedDB)
- Cache management (LRU with TTL)
- API communication
- Offline-first strategy

### Offline-First Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Data Flow Strategy                   │
└──────────────────────────────────────────────────────┘

Request → Memory Cache → LRU Cache → IndexedDB → API
   ↓           ↓            ↓           ↓         ↓
  Fast      Faster       Fast       Offline   Online
 (µs)        (ms)        (ms)        Only      Only
```

Data retrieval follows this fallback chain:
1. **Memory Cache** - Instant access for frequently used data
2. **LRU Cache** - Fast access with TTL expiration
3. **IndexedDB** - Persistent offline storage
4. **API** - Remote server when online

## Key Features

### Core Functionality
- **User Management** - Full CRUD with validation and analytics
- **Offline-First** - Works seamlessly with or without internet
- **Multi-Language** - English, Chinese (Simplified & Traditional)
- **Dark Mode** - System preference detection and manual toggle
- **Real-time Analytics** - Event tracking and session management
- **Network Monitoring** - Automatic online/offline detection

### Technical Highlights
- **Reactive State Management** - Angular Signals with computed values
- **Type Safety** - Full TypeScript with strict mode
- **Clean Code** - SOLID principles and clean architecture
- **Comprehensive Testing** - 217+ tests with 82% coverage
- **Beautiful Test Reports** - Interactive HTML reports with charts
- **Modern UI** - Bootstrap 5 + Angular Material
- **Code Quality** - ESLint, TSLint, and best practices

## Technology Stack

### Core Framework
- **Angular 20.0.6** - Latest version with Signals
- **TypeScript 5.8.3** - Strict type checking
- **RxJS 7.4.0** - Reactive programming
- **Zone.js 0.15.1** - Change detection

### UI & Styling
- **Bootstrap 5.3.7** - Responsive framework
- **Angular Material 20.0.5** - Material design components
- **SCSS/SASS 1.77.7** - Advanced styling
- **Bootstrap Icons 1.13.1** - Icon library
- **Font Awesome 6.7.2** - Additional icons

### Data & Storage
- **Dexie 4.2.1** - IndexedDB wrapper
- **Custom LRU Cache** - In-memory caching with TTL
- **LocalStorage** - User preferences

### Charts & Visualization
- **ApexCharts 4.7** - Modern charting library
- **ng-apexcharts 1.16.0** - Angular integration
- **Chart.js 4.5.0** - Alternative charting
- **ngx-charts 22.0.0** - D3-based charts

### Testing
- **Jasmine 5.8.0** - Testing framework
- **Karma 6.4.4** - Test runner
- **Custom HTML Reporter** - Beautiful test reports
- **Coverage Reports** - Code coverage tracking

### Development Tools
- **Angular CLI 20.0.5** - Project scaffolding
- **ESLint/TSLint** - Code linting
- **Sass Loader 13.3.3** - SCSS compilation

## Getting Started

### Prerequisites

- **Node.js** - Version 18.x or higher
- **npm** - Version 9.x or higher
- **Git** - For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd somniland/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/`

4. **Run tests**
   ```bash
   npm test
   ```

### First-Time Setup

The application will automatically:
- Detect system language preference
- Initialize IndexedDB database
- Set up offline capabilities
- Configure dark mode based on system preference

## Development

### Development Server

```bash
# Standard development server
npm start

# Custom port
ng serve --port 4300

# Open browser automatically
ng serve --open
```

The app will automatically reload when you change source files.

### Code Scaffolding

```bash
# Generate component
ng generate component component-name

# Generate service
ng generate service service-name

# Generate module
ng generate module module-name

# Other generators
ng generate directive|pipe|guard|interface|enum|class
```

### Build

```bash
# Production build
npm run build

# Development build
npm run build:dev

# Build with stats
ng build --stats-json
```

Build artifacts are stored in the `dist/` directory.

### Linting

```bash
# Run linter
npm run lint

# Auto-fix issues
ng lint --fix
```

## Testing

This project has comprehensive test coverage with **217+ test cases** across all architectural layers.

### Running Tests

```bash
# Interactive mode (watches for changes)
npm test

# Single run with coverage
npm run test:coverage

# CI mode (headless, no watch)
npm run test:ci

# Generate HTML report only
npm run test:report
```

### Test Reports

After running tests, beautiful HTML reports are automatically generated:

```bash
# View test report
open docs/test-reports/test-report.html

# View coverage report
open docs/test-reports/coverage/index.html
```

**Report Features:**
- Interactive pass/fail filtering
- Animated pass rate circle
- Expandable test suites
- Color-coded results
- Execution time tracking
- Browser information

### Test Coverage by Layer

| Layer | Files | Tests | Coverage |
|-------|-------|-------|----------|
| Core Layer | 6 | 124 | 88% |
| Data Layer | 2 | 39 | 78% |
| Presentation | 1 | 27 | 75% |
| Components | 3 | 27 | 82% |
| **Total** | **12** | **217** | **82%** |

### Testing Documentation

- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[TEST_SUMMARY.md](./TEST_SUMMARY.md)** - Test implementation details
- **[TEST_REPORT_GUIDE.md](./TEST_REPORT_GUIDE.md)** - HTML report documentation
- **[FANCY_TEST_REPORT.md](./FANCY_TEST_REPORT.md)** - Reporter implementation

## Project Structure

```
src/
├── app/
│   ├── presentation/            # Presentation Layer
│   │   ├── features/            # Feature modules
│   │   │   └── users/
│   │   │       ├── user-list/
│   │   │       │   ├── user-list.component.ts
│   │   │       │   └── user-list.view-model.ts
│   │   │       └── user-detail/
│   │   ├── validators/          # Form validation logic
│   │   │   └── user.validator.ts
│   │   └── shared/              # Shared UI components
│   │
│   ├── domain/                  # Domain Layer
│   │   ├── entities/            # Domain entities
│   │   │   ├── user.model.ts
│   │   │   ├── analytics.model.ts
│   │   │   └── app-error.model.ts
│   │   ├── services/            # Business logic services
│   │   │   ├── user.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── i18n.service.ts
│   │   │   └── network-monitor.service.ts
│   │   ├── pipes/               # Custom pipes
│   │   └── constants/           # App constants
│   │
│   ├── data/                    # Data Layer
│   │   ├── repositories/        # Repository pattern
│   │   │   └── user.repository.ts
│   │   ├── storage/             # Data persistence
│   │   │   ├── indexed-db.service.ts
│   │   │   └── cache.service.ts
│   │   └── api/                 # API clients
│   │       └── api.service.ts
│   │
│   ├── components/              # Reusable components
│   │   ├── confirmation-dialog/
│   │   └── language-switcher/
│   │
│   └── config/                  # Configuration
│       └── app.config.ts
│
├── assets/                      # Static assets
├── environments/                # Environment configs
└── docs/                        # Documentation
    └── test-reports/            # Generated test reports
```

## Design Patterns

### Input/Output/Effect (IOE) Pattern

ViewModels expose three distinct interfaces:

```typescript
class UserListViewModel {
  // INPUT - Actions that can be triggered
  input = {
    loadInitial: () => void,
    search: (term: string) => void,
    filter: (criteria: FilterCriteria) => void
  };

  // OUTPUT - Data to display
  output = {
    users: Signal<User[]>,
    loading: Signal<boolean>,
    error: Signal<string | null>
  };

  // EFFECT - Side effects to observe
  effect$ = {
    navigateToDetail$: Subject<string>,
    showNotification$: Subject<string>
  };
}
```

### Repository Pattern

Abstract data sources behind a clean interface:

```typescript
interface UserRepository {
  getUsers(): Observable<User[]>;
  getUserById(id: string): Observable<User>;
  createUser(dto: CreateUserDto): Observable<User>;
  updateUser(id: string, dto: UpdateUserDto): Observable<User>;
  deleteUser(id: string): Observable<void>;
}
```

### Cache Strategy

Multi-level caching with automatic fallback:

```typescript
getData(key: string): Observable<Data> {
  // Try memory cache first
  const cached = this.cache.get(key);
  if (cached) return of(cached);

  // Try IndexedDB if offline
  if (this.network.isOffline) {
    return this.db.get(key);
  }

  // Fetch from API and cache
  return this.api.get(key).pipe(
    tap(data => {
      this.cache.set(key, data);
      this.db.set(key, data);
    })
  );
}
```

### Barrel Exports

Clean imports throughout the application:

```typescript
// Instead of:
import { UserService } from './core/services/user.service';
import { AnalyticsService } from './core/services/analytics.service';

// Use:
import { UserService, AnalyticsService } from './core/services';
```

## Best Practices

### Code Organization
- One class/component per file
- Barrel exports in each directory
- Consistent naming conventions
- Clear separation of concerns

### Type Safety
- Strict TypeScript mode enabled
- No implicit any
- Comprehensive interfaces
- Type guards for runtime safety

### State Management
- Signals for reactive state
- Computed values for derived state
- Immutable data patterns
- Clear data flow

### Error Handling
- Centralized error handling
- User-friendly error messages
- Logging to analytics service
- Graceful degradation

### Performance
- Lazy loading for routes
- OnPush change detection
- Pure pipes
- Memoization where appropriate
- Code splitting

### Testing
- AAA pattern (Arrange-Act-Assert)
- Comprehensive test coverage (82%+)
- Mock external dependencies
- Test both success and error paths

## Deployment

### Production Build

```bash
# Create production build
npm run build

# Output directory
dist/color-admin/
```

### Environment Configuration

Configure environments in:
- `src/environments/environment.ts` - Development
- `src/environments/environment.prod.ts` - Production

### Deployment Checklist

- [ ] Run tests: `npm run test:ci`
- [ ] Check coverage: Review `docs/test-reports/coverage/`
- [ ] Build for production: `npm run build`
- [ ] Check bundle size: Review `dist/` directory
- [ ] Test production build locally
- [ ] Deploy to hosting provider
- [ ] Verify all features work
- [ ] Monitor analytics

### Hosting Options

**Static Hosting:**
- Netlify
- Vercel
- Firebase Hosting
- GitHub Pages
- AWS S3 + CloudFront

**Server Hosting:**
- AWS EC2
- Google Cloud Run
- Azure App Service
- Heroku

### Docker Support

```dockerfile
# Example Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/color-admin /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Contributing

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   - Follow coding standards
   - Write tests for new code
   - Update documentation

3. **Run quality checks**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

### Coding Standards

- Follow Angular style guide
- Use TypeScript strict mode
- Write meaningful commit messages
- Keep functions small and focused
- Document complex logic
- Write tests for new features

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, docs, style, refactor, test, chore

**Example:**
```
feat(user): add user profile editing

- Add edit form component
- Implement validation
- Add tests

Closes #123
```

## Documentation

### Available Documentation

- **[README.md](./README.md)** - This file
- **[TESTING.md](./TESTING.md)** - Testing guide
- **[TEST_SUMMARY.md](./TEST_SUMMARY.md)** - Test implementation details
- **[TEST_REPORT_GUIDE.md](./TEST_REPORT_GUIDE.md)** - Test report usage
- **[FANCY_TEST_REPORT.md](./FANCY_TEST_REPORT.md)** - Reporter implementation

### Architecture Evaluation

**Overall Rating: 8.2/10**

**Strengths:**
- Clean separation of concerns
- Offline-first capabilities
- Comprehensive testing
- Modern Angular features
- Type safety throughout

**Areas for Improvement:**
- Add state management library for complex apps
- Implement end-to-end tests
- Add performance monitoring
- Create component library
- Add API documentation

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Review existing documentation
- Check test reports for code examples

---

**Built with Angular 20 | Clean Architecture | Offline-First**

Last Updated: 2025-11-18
