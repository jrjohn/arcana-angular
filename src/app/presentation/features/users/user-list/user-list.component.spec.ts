import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { UserListViewModel } from './user-list.view-model';
import { UserService } from '../../../../domain/services/user.service';
import { NavGraphService } from '../../../../domain/services/nav-graph.service';
import { I18nService } from '../../../../domain/services/i18n.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../../../domain/entities/user.model';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNavGraph: any;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockI18nService: jasmine.SpyObj<I18nService>;

  const mockUsers: User[] = [
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      avatar: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const mockPaginatedResponse = {
    data: mockUsers,
    page: 1,
    pageSize: 10,
    total: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'getUsers', 'searchUsers', 'deleteUser', 'getUser', 'createUser', 'updateUser'
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
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    mockI18nService = jasmine.createSpyObj('I18nService', ['translate']);

    mockUserService.getUsers.and.returnValue(of(mockPaginatedResponse));
    mockUserService.searchUsers.and.returnValue(of(mockPaginatedResponse));
    mockI18nService.translate.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
        { provide: NavGraphService, useValue: mockNavGraph },
        { provide: NgbModal, useValue: mockModalService },
        { provide: I18nService, useValue: mockI18nService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty searchQuery', () => {
    expect(component.searchQuery).toBe('');
  });

  it('should initialize showSuccessAlert as false', () => {
    expect(component.showSuccessAlert).toBe(false);
  });

  it('should load initial data on ngOnInit', () => {
    expect(mockUserService.getUsers).toHaveBeenCalled();
  });

  it('should emit search query with debounce on onSearchChange', fakeAsync(() => {
    component.onSearchChange('alice');
    tick(300);

    expect(mockUserService.searchUsers).toHaveBeenCalled();
  }));

  it('should call vm.input.editUser when onEditUser is called', () => {
    spyOn(component.vm.input, 'editUser');
    const user = mockUsers[0];
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');

    component.onEditUser(user, event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.vm.input.editUser).toHaveBeenCalledWith(user);
  });

  it('should call vm.input.deleteUser when onDeleteUser is called', () => {
    spyOn(component.vm.input, 'deleteUser');
    const user = mockUsers[0];
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');

    component.onDeleteUser(user, event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.vm.input.deleteUser).toHaveBeenCalledWith(user);
  });

  it('should call vm.input.goToPage when onPageChange is called', () => {
    spyOn(component.vm.input, 'goToPage');

    component.onPageChange(2);

    expect(component.vm.input.goToPage).toHaveBeenCalledWith(2);
  });

  it('should show success alert on showSuccess$ effect', fakeAsync(() => {
    component.vm.effect$.showSuccess$.next('User deleted successfully');
    tick();

    expect(component.showSuccessAlert).toBe(true);
    expect(component.successMessage).toBe('User deleted successfully');
  }));

  it('should hide success alert after 3 seconds', fakeAsync(() => {
    component.vm.effect$.showSuccess$.next('User saved');
    tick(3000);

    expect(component.showSuccessAlert).toBe(false);
  }));

  it('should expose Math in template', () => {
    expect(component.Math).toBe(Math);
  });

  it('should open delete confirmation modal on confirmDelete$ effect', () => {
    const mockModalRef = {
      componentInstance: {},
      result: Promise.resolve(false)
    };
    mockModalService.open.and.returnValue(mockModalRef as any);

    component.vm.effect$.confirmDelete$.next(mockUsers[0]);

    expect(mockModalService.open).toHaveBeenCalled();
  });
});
