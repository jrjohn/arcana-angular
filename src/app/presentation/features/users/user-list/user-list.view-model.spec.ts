import { TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { UserListViewModel } from './user-list.view-model';
import { UserService } from '../../../../domain/services/user.service';
import { NavGraphService } from '../../../../domain/services/nav-graph.service';
import { User } from '../../../../domain/entities/user.model';
import { PaginatedResponse } from '../../../../domain/entities/pagination.model';
import { AppError, ErrorCategory } from '../../../../domain/entities/app-error.model';

describe('UserListViewModel', () => {
  let viewModel: UserListViewModel;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNavGraph: any;

  const mockUser: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResponse: PaginatedResponse<User> = {
    data: [mockUser],
    page: 1,
    pageSize: 10,
    total: 50,
    totalPages: 5,
  };

  const mockAppError: AppError = {
    code: ErrorCategory.NETWORK,
    message: 'Network error',
    category: ErrorCategory.NETWORK,
    userMessage: 'Unable to load users',
    timestamp: new Date(),
  };

  beforeEach(() => {
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers', 'searchUsers', 'deleteUser']);
    mockUserService.getUsers.and.returnValue(of(mockPaginatedResponse));
    mockUserService.searchUsers.and.returnValue(of(mockPaginatedResponse));
    mockUserService.deleteUser.and.returnValue(of(undefined));

    mockNavGraph = {
      users: {
        toList: jasmine.createSpy('toList').and.returnValue(Promise.resolve(true)),
        toUserDetail: jasmine.createSpy('toUserDetail').and.returnValue(Promise.resolve(true)),
        toUserEdit: jasmine.createSpy('toUserEdit').and.returnValue(Promise.resolve(true)),
        toCreate: jasmine.createSpy('toCreate').and.returnValue(Promise.resolve(true)),
        toDetail: jasmine.createSpy('toDetail').and.returnValue(Promise.resolve(true)),
        toEdit: jasmine.createSpy('toEdit').and.returnValue(Promise.resolve(true)),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        UserListViewModel,
        { provide: UserService, useValue: mockUserService },
        { provide: NavGraphService, useValue: mockNavGraph },
      ],
    });

    viewModel = TestBed.inject(UserListViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with empty users', () => {
      expect(viewModel.output.users()).toEqual([]);
    });

    it('should start with isLoading false', () => {
      expect(viewModel.output.isLoading()).toBe(false);
    });

    it('should start with no error', () => {
      expect(viewModel.output.errorMessage()).toBeNull();
    });

    it('should start at page 1', () => {
      expect(viewModel.output.currentPage()).toBe(1);
    });

    it('should start with pageSize 10', () => {
      expect(viewModel.output.pageSize()).toBe(10);
    });

    it('isEmpty should be true initially', () => {
      expect(viewModel.output.isEmpty()).toBe(true);
    });

    it('hasError should be false initially', () => {
      expect(viewModel.output.hasError()).toBe(false);
    });
  });

  describe('loadInitial()', () => {
    it('should call getUsers on loadInitial', () => {
      viewModel.input.loadInitial();
      expect(mockUserService.getUsers).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
    });

    it('should populate users from response', () => {
      viewModel.input.loadInitial();
      expect(viewModel.output.users()).toEqual([mockUser]);
    });

    it('should set currentPage from response', () => {
      viewModel.input.loadInitial();
      expect(viewModel.output.currentPage()).toBe(1);
    });

    it('should set totalPages from response', () => {
      viewModel.input.loadInitial();
      expect(viewModel.output.totalPages()).toBe(5);
    });

    it('should set totalItems from response', () => {
      viewModel.input.loadInitial();
      expect(viewModel.output.totalItems()).toBe(50);
    });

    it('should set isLoading false after load', () => {
      viewModel.input.loadInitial();
      expect(viewModel.output.isLoading()).toBe(false);
    });

    it('should handle load error', () => {
      mockUserService.getUsers.and.returnValue(throwError(() => mockAppError));
      viewModel.input.loadInitial();
      expect(viewModel.output.errorMessage()).toBe('Unable to load users');
      expect(viewModel.output.hasError()).toBe(true);
    });

    it('should emit error via showError$', () => {
      mockUserService.getUsers.and.returnValue(throwError(() => mockAppError));
      let emittedError: AppError | undefined;
      viewModel.effect$.showError$.subscribe(err => (emittedError = err));
      viewModel.input.loadInitial();
      expect(emittedError).toEqual(mockAppError);
    });
  });

  describe('search()', () => {
    it('should call searchUsers when query is provided', () => {
      viewModel.input.search('John');
      expect(mockUserService.searchUsers).toHaveBeenCalledWith('John', { page: 1, pageSize: 10 });
    });

    it('should reset to page 1 on search', () => {
      viewModel.input.goToPage(3);
      viewModel.input.search('test');
      expect(mockUserService.searchUsers).toHaveBeenCalledWith('test', { page: 1, pageSize: 10 });
    });

    it('should use getUsers when query is empty', () => {
      viewModel.input.search('');
      expect(mockUserService.getUsers).toHaveBeenCalled();
    });
  });

  describe('goToPage()', () => {
    it('should call getUsers with the specified page', () => {
      viewModel.input.goToPage(3);
      expect(mockUserService.getUsers).toHaveBeenCalledWith({ page: 3, pageSize: 10 });
    });
  });

  describe('deleteUser()', () => {
    it('should emit confirmDelete$ when deleteUser is called', () => {
      let confirmedUser: User | undefined;
      viewModel.effect$.confirmDelete$.subscribe(u => (confirmedUser = u));
      viewModel.input.deleteUser(mockUser);
      expect(confirmedUser).toEqual(mockUser);
    });
  });

  describe('deleteUserConfirmed()', () => {
    it('should call userService.deleteUser with user id', () => {
      viewModel.input.loadInitial();
      viewModel.input.deleteUserConfirmed(mockUser);
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
    });

    it('should remove user from users list on success', () => {
      viewModel.input.loadInitial();
      expect(viewModel.output.users().length).toBe(1);
      viewModel.input.deleteUserConfirmed(mockUser);
      expect(viewModel.output.users().length).toBe(0);
    });

    it('should emit showSuccess$ after delete', () => {
      let message: string | undefined;
      viewModel.effect$.showSuccess$.subscribe(m => (message = m));
      viewModel.input.loadInitial();
      viewModel.input.deleteUserConfirmed(mockUser);
      expect(message).toBe('User deleted successfully');
    });

    it('should emit showError$ on delete failure', () => {
      mockUserService.deleteUser.and.returnValue(throwError(() => mockAppError));
      let emittedError: AppError | undefined;
      viewModel.effect$.showError$.subscribe(e => (emittedError = e));
      viewModel.input.deleteUserConfirmed(mockUser);
      expect(emittedError).toEqual(mockAppError);
    });
  });

  describe('navigation actions', () => {
    it('editUser should call navGraph.users.toUserEdit', () => {
      viewModel.input.editUser(mockUser);
      expect(mockNavGraph.users.toUserEdit).toHaveBeenCalledWith(mockUser);
    });

    it('selectUser should call navGraph.users.toUserDetail', () => {
      viewModel.input.selectUser(mockUser);
      expect(mockNavGraph.users.toUserDetail).toHaveBeenCalledWith(mockUser);
    });

    it('createUser should call navGraph.users.toCreate', () => {
      viewModel.input.createUser();
      expect(mockNavGraph.users.toCreate).toHaveBeenCalled();
    });
  });

  describe('computed outputs', () => {
    it('hasMorePages should be true when currentPage < totalPages', () => {
      viewModel.input.loadInitial();
      expect(viewModel.output.hasMorePages()).toBe(true);
    });

    it('hasMorePages should be false when on last page', () => {
      const lastPageResponse = { ...mockPaginatedResponse, page: 5, totalPages: 5 };
      mockUserService.getUsers.and.returnValue(of(lastPageResponse));
      viewModel.input.loadInitial();
      expect(viewModel.output.hasMorePages()).toBe(false);
    });

    it('isEmpty should be false when users are loaded', () => {
      viewModel.input.loadInitial();
      expect(viewModel.output.isEmpty()).toBe(false);
    });
  });

  describe('refresh()', () => {
    it('should re-load current page on refresh', () => {
      viewModel.input.loadInitial();
      viewModel.input.refresh();
      expect(mockUserService.getUsers).toHaveBeenCalledTimes(2);
    });

    it('should emit showSuccess$ on successful refresh', () => {
      let message: string | undefined;
      viewModel.effect$.showSuccess$.subscribe(m => (message = m));
      viewModel.input.refresh();
      expect(message).toBe('Users refreshed successfully');
    });
  });
});
