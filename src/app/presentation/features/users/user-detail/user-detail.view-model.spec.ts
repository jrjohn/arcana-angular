import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserDetailViewModel } from './user-detail.view-model';
import { UserService } from '../../../../domain/services/user.service';
import { ErrorHandlerService } from '../../../../domain/services/error-handler.service';
import { NavGraphService } from '../../../../domain/services/nav-graph.service';
import { AppError, ErrorType } from '../../../../domain/models/app-error';
import { User } from '../../../../domain/entities/user.model';

describe('UserDetailViewModel', () => {
  let vm: UserDetailViewModel;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockErrorHandler: jasmine.SpyObj<ErrorHandlerService>;
  let mockNavGraph: jasmine.SpyObj<NavGraphService>;

  const mockUser: User = {
    id: '1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
  };

  beforeEach(() => {
    mockUserService = jasmine.createSpyObj('UserService', ['getUser']);
    mockErrorHandler = jasmine.createSpyObj('ErrorHandlerService', ['handleError', 'logError']);
    mockNavGraph = jasmine.createSpyObj('NavGraphService', ['toHome'], {
      users: {
        toList: jasmine.createSpy('toList'),
        toUserDetail: jasmine.createSpy('toUserDetail'),
        toUserEdit: jasmine.createSpy('toUserEdit'),
        toCreate: jasmine.createSpy('toCreate'),
      }
    });

    mockUserService.getUser.and.returnValue(of(mockUser));

    TestBed.configureTestingModule({
      providers: [
        UserDetailViewModel,
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
        { provide: NavGraphService, useValue: mockNavGraph },
      ]
    });

    vm = TestBed.inject(UserDetailViewModel);
  });

  it('should be created', () => {
    expect(vm).toBeTruthy();
  });

  it('should have null user initially', () => {
    expect(vm.output.user()).toBeNull();
  });

  it('should have isLoading as false initially', () => {
    expect(vm.output.isLoading()).toBe(false);
  });

  it('should have hasError as false initially', () => {
    expect(vm.output.hasError()).toBe(false);
  });

  it('should have empty displayName initially', () => {
    expect(vm.output.displayName()).toBe('');
  });

  it('should load user when loadUser is called', (done) => {
    vm.input.loadUser('1');

    // Wait for effect and async operations to complete
    setTimeout(() => {
      expect(mockUserService.getUser).toHaveBeenCalledWith('1');
      expect(vm.output.user()).toEqual(mockUser);
      done();
    }, 0);
  });

  it('should set isLoading to false after user is loaded', (done) => {
    vm.input.loadUser('1');

    setTimeout(() => {
      expect(vm.output.isLoading()).toBe(false);
      done();
    }, 0);
  });

  it('should compute displayName from user', (done) => {
    vm.input.loadUser('1');

    setTimeout(() => {
      expect(vm.output.displayName()).toBe('Jane Doe (jane.doe@example.com)');
      done();
    }, 0);
  });

  it('should emit userLoaded$ when user is successfully loaded', (done) => {
    vm.effect$.userLoaded$.subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });

    vm.input.loadUser('1');
  });

  it('should handle error when getUser fails', (done) => {
    const appError = new AppError(ErrorType.NOT_FOUND, 'User not found', 'User not found');
    mockUserService.getUser.and.returnValue(throwError(() => appError));
    mockErrorHandler.handleError.and.returnValue(appError);

    vm.input.loadUser('99');

    setTimeout(() => {
      expect(vm.output.hasError()).toBe(true);
      expect(vm.output.isLoading()).toBe(false);
      done();
    }, 0);
  });

  it('should clear error when clearError is called', (done) => {
    const appError = new AppError(ErrorType.NOT_FOUND, 'User not found', 'User not found');
    mockUserService.getUser.and.returnValue(throwError(() => appError));
    mockErrorHandler.handleError.and.returnValue(appError);

    vm.input.loadUser('99');

    setTimeout(() => {
      expect(vm.output.hasError()).toBe(true);
      vm.input.clearError();
      expect(vm.output.hasError()).toBe(false);
      done();
    }, 0);
  });

  it('should expose canRetry as true for retryable errors', (done) => {
    const retryableError = new AppError(ErrorType.NETWORK_ERROR, 'Network error', 'Network error');
    mockUserService.getUser.and.returnValue(throwError(() => retryableError));
    mockErrorHandler.handleError.and.returnValue(retryableError);

    vm.input.loadUser('1');

    setTimeout(() => {
      expect(vm.output.canRetry()).toBe(true);
      done();
    }, 0);
  });

  it('should expose canRetry as false for non-retryable errors', (done) => {
    const nonRetryableError = new AppError(ErrorType.NOT_FOUND, 'Not found', 'Not found');
    mockUserService.getUser.and.returnValue(throwError(() => nonRetryableError));
    mockErrorHandler.handleError.and.returnValue(nonRetryableError);

    vm.input.loadUser('99');

    setTimeout(() => {
      expect(vm.output.canRetry()).toBe(false);
      done();
    }, 0);
  });

  it('should not call getUser if retry is called with no userId', () => {
    const initialCallCount = mockUserService.getUser.calls.count();
    vm.input.retry(); // No userId set yet
    expect(mockUserService.getUser.calls.count()).toBe(initialCallCount);
  });
});
