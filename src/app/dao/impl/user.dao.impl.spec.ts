import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserDaoImpl } from './user.dao.impl';
import { ApiService } from '../../data/api/api.service';
import {
  UserDto,
  PaginatedUserResponseDto,
  SingleUserResponseDto,
} from '../../data/dto/user.dto';

describe('UserDaoImpl', () => {
  let dao: UserDaoImpl;
  let mockApiService: jasmine.SpyObj<ApiService>;

  const mockUser: UserDto = {
    id: 1,
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    avatar: 'https://example.com/avatar.jpg',
  };

  const mockPaginatedResponse: PaginatedUserResponseDto = {
    page: 1,
    per_page: 10,
    total: 50,
    total_pages: 5,
    data: [mockUser],
  };

  const mockSingleResponse: SingleUserResponseDto = {
    data: mockUser,
  };

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        UserDaoImpl,
        { provide: ApiService, useValue: mockApiService },
      ],
    });

    dao = TestBed.inject(UserDaoImpl);
  });

  it('should create', () => {
    expect(dao).toBeTruthy();
  });

  describe('getUsers()', () => {
    it('should call GET /users with page and pageSize params', () => {
      mockApiService.get.and.returnValue(of(mockPaginatedResponse));

      dao.getUsers(1, 10).subscribe(result => {
        expect(result).toEqual(mockPaginatedResponse);
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/users?page=1&per_page=10');
    });

    it('should call GET with correct pagination params', () => {
      mockApiService.get.and.returnValue(of(mockPaginatedResponse));

      dao.getUsers(2, 5).subscribe();

      expect(mockApiService.get).toHaveBeenCalledWith('/users?page=2&per_page=5');
    });

    it('should return observable with paginated response', (done) => {
      mockApiService.get.and.returnValue(of(mockPaginatedResponse));

      dao.getUsers(1, 10).subscribe(result => {
        expect(result.data).toEqual([mockUser]);
        expect(result.total).toBe(50);
        done();
      });
    });
  });

  describe('getUserById()', () => {
    it('should call GET /users/:id', () => {
      mockApiService.get.and.returnValue(of(mockSingleResponse));

      dao.getUserById('1').subscribe(result => {
        expect(result).toEqual(mockSingleResponse);
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/users/1');
    });

    it('should return observable with single user response', (done) => {
      mockApiService.get.and.returnValue(of(mockSingleResponse));

      dao.getUserById('42').subscribe(result => {
        expect(result.data).toEqual(mockUser);
        done();
      });
    });
  });

  describe('createUser()', () => {
    it('should call POST /users with data', () => {
      const createDto = { email: 'new@test.com', first_name: 'New', last_name: 'User' };
      mockApiService.post.and.returnValue(of(mockUser));

      dao.createUser(createDto).subscribe(result => {
        expect(result).toEqual(mockUser);
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/users', createDto);
    });

    it('should return observable with created user', (done) => {
      const createDto = { email: 'new@test.com', first_name: 'New', last_name: 'User' };
      mockApiService.post.and.returnValue(of(mockUser));

      dao.createUser(createDto).subscribe(result => {
        expect(result.email).toBe('john.doe@example.com');
        done();
      });
    });
  });

  describe('updateUser()', () => {
    it('should call PUT /users/:id with data', () => {
      const updateDto = { first_name: 'Updated' };
      mockApiService.put.and.returnValue(of(mockUser));

      dao.updateUser('1', updateDto).subscribe();

      expect(mockApiService.put).toHaveBeenCalledWith('/users/1', updateDto);
    });

    it('should return observable with updated user', (done) => {
      const updateDto = { first_name: 'Updated' };
      mockApiService.put.and.returnValue(of(mockUser));

      dao.updateUser('1', updateDto).subscribe(result => {
        expect(result).toEqual(mockUser);
        done();
      });
    });
  });

  describe('deleteUser()', () => {
    it('should call DELETE /users/:id', () => {
      mockApiService.delete.and.returnValue(of(undefined));

      dao.deleteUser('1').subscribe();

      expect(mockApiService.delete).toHaveBeenCalledWith('/users/1');
    });

    it('should return void observable', (done) => {
      mockApiService.delete.and.returnValue(of(undefined));

      dao.deleteUser('42').subscribe(result => {
        expect(result).toBeUndefined();
        done();
      });
    });
  });
});
