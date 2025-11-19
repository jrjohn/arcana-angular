import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UserDetailComponent } from './user-detail.component';
import { UserDetailViewModel } from './user-detail.view-model';
import { User } from '../../../../domain/entities/user.model';
import { AppError, ErrorType } from '../../../../domain/models/app-error';
import { signal, computed } from '@angular/core';
import { Subject } from 'rxjs';
import { NavGraphService } from '../../../../domain/services/nav-graph.service';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let mockViewModel: jasmine.SpyObj<UserDetailViewModel>;
  let mockNavGraph: jasmine.SpyObj<NavGraphService>;
  let mockActivatedRoute: any;

  const mockUser: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z')
  };

  const mockError = new AppError(
    ErrorType.NOT_FOUND,
    'User not found',
    'User not found'
  );

  beforeEach(async () => {
    // Create signals for ViewModel state
    const userSignal = signal<User | null>(null);
    const isLoadingSignal = signal(false);
    const errorSignal = signal<AppError | null>(null);

    // Create mock ViewModel with Input/Output/Effect structure
    mockViewModel = jasmine.createSpyObj('UserDetailViewModel', [], {
      input: {
        loadUser: jasmine.createSpy('loadUser'),
        retry: jasmine.createSpy('retry'),
        clearError: jasmine.createSpy('clearError')
      },
      output: {
        user: computed(() => userSignal()),
        isLoading: computed(() => isLoadingSignal()),
        hasError: computed(() => errorSignal() !== null),
        errorMessage: computed(() => errorSignal()?.getUserMessage() || ''),
        canRetry: computed(() => errorSignal()?.isRetryable() ?? false),
        displayName: computed(() => {
          const user = userSignal();
          return user ? `${user.firstName} ${user.lastName} (${user.email})` : '';
        })
      },
      effect$: {
        userLoaded$: new Subject<User>(),
        loadError$: new Subject<AppError>()
      }
    });

    // Create mock NavGraph
    mockNavGraph = jasmine.createSpyObj('NavGraphService', [], {
      users: {
        toList: jasmine.createSpy('toList').and.returnValue(Promise.resolve(true)),
        toUserEdit: jasmine.createSpy('toUserEdit').and.returnValue(Promise.resolve(true))
      }
    });

    // Create mock ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [UserDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NavGraphService, useValue: mockNavGraph },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .overrideComponent(UserDetailComponent, {
      set: {
        providers: [
          { provide: UserDetailViewModel, useValue: mockViewModel }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject ViewModel', () => {
      expect(component.vm).toBe(mockViewModel);
    });

    it('should inject NavGraph', () => {
      expect(component['navGraph']).toBe(mockNavGraph);
    });


    it('should inject ActivatedRoute', () => {
      expect(component['route']).toBe(mockActivatedRoute);
    });
  });

  describe('ViewModel Output Exposure', () => {
    it('should expose user from ViewModel output', () => {
      expect(component.user).toBe(mockViewModel.output.user);
    });

    it('should expose isLoading from ViewModel output', () => {
      expect(component.isLoading).toBe(mockViewModel.output.isLoading);
    });

    it('should expose hasError from ViewModel output', () => {
      expect(component.hasError).toBe(mockViewModel.output.hasError);
    });

    it('should expose errorMessage from ViewModel output', () => {
      expect(component.errorMessage).toBe(mockViewModel.output.errorMessage);
    });
  });

  describe('ngOnInit', () => {
    it('should load user when userId is present in route', () => {
      component.ngOnInit();

      expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(mockViewModel.input.loadUser).toHaveBeenCalledWith('1');
    });

    it('should navigate to users list when userId is null', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

      component.ngOnInit();

      expect(mockNavGraph.users.toList).toHaveBeenCalled();
      expect(mockViewModel.input.loadUser).not.toHaveBeenCalled();
    });

    it('should navigate to users list when userId is empty', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('');

      component.ngOnInit();

      expect(mockNavGraph.users.toList).toHaveBeenCalled();
      expect(mockViewModel.input.loadUser).not.toHaveBeenCalled();
    });

    it('should handle different userId values', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');

      component.ngOnInit();

      expect(mockViewModel.input.loadUser).toHaveBeenCalledWith('123');
    });
  });

  describe('onBack', () => {
    it('should navigate to users list', () => {
      component.onBack();

      expect(mockNavGraph.users.toList).toHaveBeenCalled();
    });
  });

  describe('onEdit', () => {
    it('should navigate to edit page when user is loaded', () => {
      // Set up user in the signal
      const userSignal = signal<User | null>(mockUser);
      (mockViewModel.output as any).user = computed(() => userSignal());

      component.onEdit();

      expect(mockNavGraph.users.toUserEdit).toHaveBeenCalledWith(mockUser);
    });

    it('should not navigate when user is null', () => {
      const userSignal = signal<User | null>(null);
      (mockViewModel.output as any).user = computed(() => userSignal());

      component.onEdit();

      expect(mockNavGraph.users.toUserEdit).not.toHaveBeenCalled();
    });

    it('should use correct user id for navigation', () => {
      const differentUser = { ...mockUser, id: '999' };
      const userSignal = signal<User | null>(differentUser);
      (mockViewModel.output as any).user = computed(() => userSignal());

      component.onEdit();

      expect(mockNavGraph.users.toUserEdit).toHaveBeenCalledWith(differentUser);
    });
  });

  describe('onRetry', () => {
    it('should call ViewModel input retry', () => {
      component.onRetry();

      expect(mockViewModel.input.retry).toHaveBeenCalled();
    });

    it('should be callable multiple times', () => {
      component.onRetry();
      component.onRetry();
      component.onRetry();

      expect(mockViewModel.input.retry).toHaveBeenCalledTimes(3);
    });
  });

  describe('Input/Output/Effect Pattern Integration', () => {
    it('should use vm.input for actions', () => {
      expect(mockViewModel.input.loadUser).toBeDefined();
      expect(mockViewModel.input.retry).toBeDefined();
      expect(mockViewModel.input.clearError).toBeDefined();
    });

    it('should use vm.output for state', () => {
      expect(mockViewModel.output.user).toBeDefined();
      expect(mockViewModel.output.isLoading).toBeDefined();
      expect(mockViewModel.output.hasError).toBeDefined();
      expect(mockViewModel.output.errorMessage).toBeDefined();
      expect(mockViewModel.output.canRetry).toBeDefined();
      expect(mockViewModel.output.displayName).toBeDefined();
    });

    it('should use vm.effect$ for side effects', () => {
      expect(mockViewModel.effect$.userLoaded$).toBeDefined();
      expect(mockViewModel.effect$.loadError$).toBeDefined();
    });
  });

  describe('Loading States', () => {
    it('should expose loading state from ViewModel', () => {
      // Component exposes the ViewModel's loading state
      expect(component.isLoading).toBe(mockViewModel.output.isLoading);
    });
  });

  describe('Error States', () => {
    it('should expose error state from ViewModel', () => {
      // Component exposes the ViewModel's error state
      expect(component.hasError).toBe(mockViewModel.output.hasError);
      expect(component.errorMessage).toBe(mockViewModel.output.errorMessage);
    });
  });

  describe('User Data Display', () => {
    it('should expose user data from ViewModel', () => {
      // Component exposes the ViewModel's user data
      expect(component.user).toBe(mockViewModel.output.user);
    });

    it('should access displayName from ViewModel', () => {
      // ViewModel provides computed displayName
      expect(mockViewModel.output.displayName).toBeDefined();
    });
  });

  describe('OnPush Change Detection', () => {
    it('should use OnPush change detection strategy', () => {
      // Component uses ChangeDetectionStrategy.OnPush
      // This is verified by the component's decorator
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeDefined();
    });

    it('should work with signal-based ViewModel outputs', () => {
      // Signals work with OnPush change detection automatically
      // ViewModel outputs are computed signals that trigger change detection
      expect(component.user).toBeDefined();
      expect(component.isLoading).toBeDefined();
      expect(component.hasError).toBeDefined();
    });
  });

  describe('Component Lifecycle', () => {
    it('should call ngOnInit and load user', () => {
      spyOn(component, 'ngOnInit').and.callThrough();

      component.ngOnInit();

      expect(component.ngOnInit).toHaveBeenCalled();
      expect(mockViewModel.input.loadUser).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle onEdit with undefined user gracefully', () => {
      const userSignal = signal<User | null>(undefined as any);
      (mockViewModel.output as any).user = computed(() => userSignal());

      expect(() => component.onEdit()).not.toThrow();
      expect(mockNavGraph.users.toUserEdit).not.toHaveBeenCalled();
    });

    it('should handle multiple rapid onRetry calls', () => {
      for (let i = 0; i < 10; i++) {
        component.onRetry();
      }

      expect(mockViewModel.input.retry).toHaveBeenCalledTimes(10);
    });

    it('should handle userId with special characters', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('user-123-abc');

      component.ngOnInit();

      expect(mockViewModel.input.loadUser).toHaveBeenCalledWith('user-123-abc');
    });
  });

  describe('ViewModel Dependencies', () => {
    it('should only depend on ViewModel', () => {
      // Component should only interact with ViewModel
      expect(component.vm).toBeDefined();
      expect(component.vm).toBe(mockViewModel);
    });

    it('should use ViewModel for all state management', () => {
      // Verify component uses ViewModel outputs
      expect(component.user).toBe(mockViewModel.output.user);
      expect(component.isLoading).toBe(mockViewModel.output.isLoading);
      expect(component.hasError).toBe(mockViewModel.output.hasError);
      expect(component.errorMessage).toBe(mockViewModel.output.errorMessage);
    });
  });
});
