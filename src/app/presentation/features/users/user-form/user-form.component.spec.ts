import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { UserFormComponent } from './user-form.component';
import { UserFormViewModel } from './user-form.view-model';
import { UserService } from '../../../../domain/services/user.service';
import { NavGraphService } from '../../../../domain/services/nav-graph.service';
import { SanitizationService } from '../../../../domain/services/sanitization.service';
import { User } from '../../../../domain/entities/user.model';
import { AppError, ErrorCategory } from '../../../../domain/entities/app-error.model';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNavGraph: any;
  let mockSanitizationService: jasmine.SpyObj<SanitizationService>;
  let mockActivatedRoute: any;

  const mockUser: User = {
    id: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    avatar: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'getUser', 'createUser', 'updateUser', 'getUsers', 'searchUsers', 'deleteUser'
    ]);
    mockNavGraph = {
      toHome: jasmine.createSpy('toHome'),
      users: {
        toList: jasmine.createSpy('toList'),
        toUserDetail: jasmine.createSpy('toUserDetail'),
        toUserEdit: jasmine.createSpy('toUserEdit'),
        toCreate: jasmine.createSpy('toCreate'),
      }
    };
    mockSanitizationService = jasmine.createSpyObj('SanitizationService', [
      'sanitizeInput', 'sanitizeEmail', 'sanitizeUrl', 'sanitizeUserInput'
    ]);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    mockUserService.getUser.and.returnValue(of(mockUser));
    mockUserService.createUser.and.returnValue(of(mockUser));
    mockUserService.updateUser.and.returnValue(of(mockUser));
    mockSanitizationService.sanitizeInput.and.callFake((v: string) => v);
    mockSanitizationService.sanitizeEmail.and.callFake((v: string) => v);
    mockSanitizationService.sanitizeUrl.and.callFake((v: string) => v);
    mockSanitizationService.sanitizeUserInput.and.callFake((v: any) => v);

    await TestBed.configureTestingModule({
      imports: [UserFormComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
        { provide: NavGraphService, useValue: mockNavGraph },
        { provide: SanitizationService, useValue: mockSanitizationService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have null errorMessage initially', () => {
    expect(component.errorMessage).toBeNull();
  });

  it('should have showSuccessAlert as false initially', () => {
    expect(component.showSuccessAlert).toBe(false);
  });

  it('should initialize without userId for new user', () => {
    expect(component.vm.output.isEditMode()).toBe(false);
  });

  it('should initialize with userId when route has id param', async () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('42');
    mockUserService.getUser.and.returnValue(of(mockUser));

    // Re-create component with route id
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [UserFormComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
        { provide: NavGraphService, useValue: mockNavGraph },
        { provide: SanitizationService, useValue: mockSanitizationService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ]
    }).compileComponents();

    const f = TestBed.createComponent(UserFormComponent);
    f.detectChanges();

    expect(f.componentInstance.vm.output.isEditMode()).toBe(true);
  });

  it('should call vm.input.cancel when onCancel is called', () => {
    spyOn(component.vm.input, 'cancel');
    component.onCancel();
    expect(component.vm.input.cancel).toHaveBeenCalled();
  });

  it('should navigate to list when navigateBack$ emits', fakeAsync(() => {
    component.vm.effect$.navigateBack$.next();
    tick();

    expect(mockNavGraph.users.toList).toHaveBeenCalled();
  }));

  it('should set errorMessage when showError$ emits', fakeAsync(() => {
    const err = { userMessage: 'Failed to save' } as AppError;
    component.vm.effect$.showError$.next(err);
    tick();

    expect(component.errorMessage).toBe('Failed to save');
  }));

  it('should set showSuccessAlert and successMessage when showSuccess$ emits', fakeAsync(() => {
    component.vm.effect$.showSuccess$.next('user.created.success');
    tick();

    expect(component.showSuccessAlert).toBe(true);
    expect(component.successMessage).toBe('user.created.success');
  }));

  it('should have a vm with input.submit method', () => {
    expect(typeof component.vm.input.submit).toBe('function');
  });

  it('should have a vm with input.updateFirstName method', () => {
    expect(typeof component.vm.input.updateFirstName).toBe('function');
  });

  it('should update firstName via vm', () => {
    component.vm.input.updateFirstName('Bob');
    expect(component.vm.output.firstName()).toBe('Bob');
  });

  it('should update lastName via vm', () => {
    component.vm.input.updateLastName('Brown');
    expect(component.vm.output.lastName()).toBe('Brown');
  });

  it('should update email via vm', () => {
    component.vm.input.updateEmail('bob@example.com');
    expect(component.vm.output.email()).toBe('bob@example.com');
  });
});
