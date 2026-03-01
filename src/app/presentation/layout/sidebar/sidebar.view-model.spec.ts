import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SidebarViewModel } from './sidebar.view-model';
import { UserService } from '../../../domain/services/user.service';
import { NavGraphService } from '../../../domain/services/nav-graph.service';

describe('SidebarViewModel', () => {
  let vm: SidebarViewModel;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNavGraph: jasmine.SpyObj<NavGraphService>;

  const mockPaginatedResponse = {
    data: [],
    page: 1,
    pageSize: 1,
    total: 42,
    totalPages: 42,
  };

  beforeEach(() => {
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers', 'searchUsers']);
    mockNavGraph = jasmine.createSpyObj('NavGraphService', ['toHome'], {
      users: {
        toList: jasmine.createSpy('toList'),
        toUserDetail: jasmine.createSpy('toUserDetail'),
        toUserEdit: jasmine.createSpy('toUserEdit'),
        toCreate: jasmine.createSpy('toCreate'),
      }
    });

    mockUserService.getUsers.and.returnValue(of(mockPaginatedResponse));

    TestBed.configureTestingModule({
      providers: [
        SidebarViewModel,
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
        { provide: NavGraphService, useValue: mockNavGraph },
      ]
    });

    TestBed.runInInjectionContext(() => {
      vm = TestBed.inject(SidebarViewModel);
    });
  });

  it('should be created', () => {
    expect(vm).toBeTruthy();
  });

  it('should load user count on initialization', () => {
    expect(mockUserService.getUsers).toHaveBeenCalled();
  });

  it('should expose userCount in output', () => {
    expect(vm.output.userCount()).toBe(42);
  });

  it('should expose isLoading as false after successful load', () => {
    expect(vm.output.isLoading()).toBe(false);
  });

  it('should expose userBadge as string when count > 0', () => {
    expect(vm.output.userBadge()).toBe('42');
  });

  it('should expose userBadge as undefined when count is 0', () => {
    // Re-initialize with 0 count
    mockUserService.getUsers.and.returnValue(of({ ...mockPaginatedResponse, total: 0 }));

    TestBed.runInInjectionContext(() => {
      const freshVm = new SidebarViewModel(mockUserService);
      expect(freshVm.output.userBadge()).toBeUndefined();
    });
  });

  it('should emit on loadError$ when service call fails', (done) => {
    const error = new Error('Network error');
    mockUserService.getUsers.and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      const freshVm = new SidebarViewModel(mockUserService);

      freshVm.effect$.loadError$.subscribe(err => {
        expect(err).toEqual(error);
        done();
      });

      // Trigger reload to invoke the error path
      freshVm.input.refresh();
    });
  });

  it('should set userCount to 0 on error', (done) => {
    const error = new Error('Network error');
    mockUserService.getUsers.and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      const freshVm = new SidebarViewModel(mockUserService);

      freshVm.effect$.loadError$.subscribe(() => {
        expect(freshVm.output.userCount()).toBe(0);
        done();
      });

      freshVm.input.refresh();
    });
  });

  it('should allow manual refresh via input.refresh()', () => {
    const callCountBefore = mockUserService.getUsers.calls.count();
    vm.input.refresh();
    expect(mockUserService.getUsers.calls.count()).toBeGreaterThan(callCountBefore);
  });

  it('should have effect$ with loadError$ subject', () => {
    expect(vm.effect$.loadError$).toBeTruthy();
  });
});
