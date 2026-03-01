import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserPanelViewModel } from './user-panel.view-model';
import { UserService } from '../../../domain/services/user.service';
import { NavGraphService } from '../../../domain/services/nav-graph.service';
import { User } from '../../../domain/entities/user.model';
import { AppError, ErrorType } from '../../../domain/entities/app-error.model';

describe('UserPanelViewModel', () => {
  let vm: UserPanelViewModel;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNavGraph: any;

  const mockUsers: User[] = [
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      avatar: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      firstName: 'Bob',
      lastName: 'Jones',
      email: 'bob@example.com',
      avatar: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const mockPaginatedResponse = {
    data: mockUsers,
    page: 1,
    pageSize: 10,
    total: 2,
    totalPages: 1,
  };

  beforeEach(() => {
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers', 'searchUsers']);
    mockNavGraph = {
      toHome: jasmine.createSpy('toHome'),
      users: {
        toList: jasmine.createSpy('toList'),
        toUserDetail: jasmine.createSpy('toUserDetail'),
        toUserEdit: jasmine.createSpy('toUserEdit'),
        toCreate: jasmine.createSpy('toCreate'),
      }
    };

    mockUserService.getUsers.and.returnValue(of(mockPaginatedResponse));
    mockUserService.searchUsers.and.returnValue(of(mockPaginatedResponse));

    TestBed.configureTestingModule({
      providers: [
        UserPanelViewModel,
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
        { provide: NavGraphService, useValue: mockNavGraph },
      ]
    });

    vm = TestBed.inject(UserPanelViewModel);
  });

  it('should be created', () => {
    expect(vm).toBeTruthy();
  });

  it('should have empty users initially', () => {
    expect(vm.output.users()).toEqual([]);
  });

  it('should have isEmpty as true initially', () => {
    expect(vm.output.isEmpty()).toBe(true);
  });

  it('should load users when loadInitial is called', (done) => {
    vm.input.loadInitial();

    setTimeout(() => {
      expect(mockUserService.getUsers).toHaveBeenCalled();
      expect(vm.output.users()).toEqual(mockUsers);
      done();
    }, 0);
  });

  it('should set isLoading to false after load', (done) => {
    vm.input.loadInitial();

    setTimeout(() => {
      expect(vm.output.isLoading()).toBe(false);
      done();
    }, 0);
  });

  it('should update pagination info after load', (done) => {
    vm.input.loadInitial();

    setTimeout(() => {
      expect(vm.output.currentPage()).toBe(1);
      expect(vm.output.totalItems()).toBe(2);
      expect(vm.output.totalPages()).toBe(1);
      done();
    }, 0);
  });

  it('should have isEmpty as false after loading users', (done) => {
    vm.input.loadInitial();

    setTimeout(() => {
      expect(vm.output.isEmpty()).toBe(false);
      done();
    }, 0);
  });

  it('should search users when search is called', (done) => {
    vm.input.search('alice');

    setTimeout(() => {
      expect(mockUserService.searchUsers).toHaveBeenCalledWith('alice', jasmine.objectContaining({ page: 1 }));
      done();
    }, 0);
  });

  it('should navigate to page when goToPage is called', (done) => {
    vm.input.goToPage(2);

    setTimeout(() => {
      expect(mockUserService.getUsers).toHaveBeenCalledWith(jasmine.objectContaining({ page: 2 }));
      done();
    }, 0);
  });

  it('should call navGraph.users.toUserDetail when viewUser is called', () => {
    vm.input.viewUser(mockUsers[0]);
    expect(mockNavGraph.users.toUserDetail).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('should call navGraph.users.toUserEdit when editUser is called', () => {
    vm.input.editUser(mockUsers[0]);
    expect(mockNavGraph.users.toUserEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('should call navGraph.users.toCreate when createUser is called', () => {
    vm.input.createUser();
    expect(mockNavGraph.users.toCreate).toHaveBeenCalled();
  });

  it('should call navGraph.users.toList when viewAllUsers is called', () => {
    vm.input.viewAllUsers();
    expect(mockNavGraph.users.toList).toHaveBeenCalled();
  });

  it('should emit closePanel$ when closePanel is called', (done) => {
    vm.effect$.closePanel$.subscribe(() => {
      done();
    });
    vm.input.closePanel();
  });

  it('should set error message when loading fails', (done) => {
    const appError = { userMessage: 'Failed to load' } as AppError;
    mockUserService.getUsers.and.returnValue(throwError(() => appError));

    vm.input.loadInitial();

    setTimeout(() => {
      expect(vm.output.hasError()).toBe(true);
      expect(vm.output.errorMessage()).toBe('Failed to load');
      done();
    }, 0);
  });

  it('should invoke onNavigate callback when viewUser is called with callback', () => {
    const callbackSpy = jasmine.createSpy('callback');
    vm.input.viewUser(mockUsers[0], callbackSpy);
    expect(callbackSpy).toHaveBeenCalled();
  });

  it('should invoke onNavigate callback when editUser is called with callback', () => {
    const callbackSpy = jasmine.createSpy('callback');
    vm.input.editUser(mockUsers[0], callbackSpy);
    expect(callbackSpy).toHaveBeenCalled();
  });

  it('should compute startIndex correctly', (done) => {
    vm.input.loadInitial();

    setTimeout(() => {
      expect(vm.output.startIndex()).toBe(1);
      done();
    }, 0);
  });

  it('should compute endIndex correctly', (done) => {
    vm.input.loadInitial();

    setTimeout(() => {
      expect(vm.output.endIndex()).toBe(2); // min(1*10, 2) = 2
      done();
    }, 0);
  });
});
