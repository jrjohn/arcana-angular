import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserRepository } from './user.repository';
import { ApiService } from '../api/api.service';
import { MemoryCacheService } from '../storage/memory-cache.service';
import { CacheService } from '../storage/cache.service';
import { IndexedDbService } from '../storage/indexed-db.service';
import { NetworkStatusService } from '../../domain/services/network-status.service';
import { UserMapper } from '../mappers/user.mapper';
import { User } from '../../domain/entities/user.model';
import { PaginatedUserResponseDto, UserDto } from '../dto/user.dto';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockMemoryCache: jasmine.SpyObj<MemoryCacheService>;
  let mockLruCache: jasmine.SpyObj<CacheService>;
  let mockIndexedDb: jasmine.SpyObj<IndexedDbService>;
  let mockNetworkStatus: jasmine.SpyObj<NetworkStatusService>;

  const mockUserDto: UserDto = {
    id: 1,
    email: 'alice@example.com',
    first_name: 'Alice',
    last_name: 'Smith',
    avatar: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  };

  const mockUser: User = {
    id: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    avatar: '',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-06-01T00:00:00Z'),
  };

  const mockPaginatedDto: PaginatedUserResponseDto = {
    page: 1,
    per_page: 10,
    total: 1,
    total_pages: 1,
    data: [mockUserDto],
  };

  const mockPaginatedResponse = {
    data: [mockUser],
    page: 1,
    pageSize: 10,
    total: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);
    mockMemoryCache = jasmine.createSpyObj('MemoryCacheService', ['get', 'set', 'clear']);
    mockLruCache = jasmine.createSpyObj('CacheService', ['get', 'set', 'clear']);
    mockIndexedDb = jasmine.createSpyObj('IndexedDbService', [
      'getAllUsers', 'getUserById', 'saveUser', 'deleteUser', 'addPendingOperation'
    ]);
    mockNetworkStatus = jasmine.createSpyObj('NetworkStatusService', [], {
      isOffline: false,
      isOnlineNow: true,
    });

    // Default: no caches hit
    mockMemoryCache.get.and.returnValue(null);
    mockLruCache.get.and.returnValue(null);
    mockIndexedDb.getAllUsers.and.returnValue(Promise.resolve([]));
    mockIndexedDb.getUserById.and.returnValue(Promise.resolve(undefined));
    mockIndexedDb.saveUser.and.returnValue(Promise.resolve('cached-id'));
    mockIndexedDb.deleteUser.and.returnValue(Promise.resolve());
    mockIndexedDb.addPendingOperation.and.returnValue(Promise.resolve(1));

    // API returns data
    mockApiService.get.and.returnValue(of(mockPaginatedDto));
    mockApiService.post.and.returnValue(of(mockUserDto));
    mockApiService.put.and.returnValue(of(mockUserDto));
    mockApiService.delete.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        UserRepository,
        { provide: ApiService, useValue: mockApiService },
        { provide: MemoryCacheService, useValue: mockMemoryCache },
        { provide: CacheService, useValue: mockLruCache },
        { provide: IndexedDbService, useValue: mockIndexedDb },
        { provide: NetworkStatusService, useValue: mockNetworkStatus },
      ]
    });

    repository = TestBed.inject(UserRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should return paginated users from API when caches are empty (online)', (done) => {
      repository.getUsers({ page: 1, pageSize: 10 }).subscribe(result => {
        expect(result).toBeDefined();
        expect(result.data.length).toBe(1);
        expect(result.page).toBe(1);
        done();
      });
    });

    it('should return data from memory cache if available', (done) => {
      mockMemoryCache.get.and.returnValue(mockPaginatedResponse);

      repository.getUsers({ page: 1, pageSize: 10 }).subscribe(result => {
        expect(result).toEqual(mockPaginatedResponse);
        expect(mockApiService.get).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return data from LRU cache if memory cache misses', (done) => {
      mockMemoryCache.get.and.returnValue(null);
      mockLruCache.get.and.returnValue(mockPaginatedResponse);

      repository.getUsers({ page: 1, pageSize: 10 }).subscribe(result => {
        expect(result).toEqual(mockPaginatedResponse);
        expect(mockApiService.get).not.toHaveBeenCalled();
        done();
      });
    });

    it('should promote LRU cache hit to memory cache', (done) => {
      mockMemoryCache.get.and.returnValue(null);
      mockLruCache.get.and.returnValue(mockPaginatedResponse);

      repository.getUsers({ page: 1, pageSize: 10 }).subscribe(() => {
        expect(mockMemoryCache.set).toHaveBeenCalled();
        done();
      });
    });

    it('should save API result to all cache layers', (done) => {
      repository.getUsers({ page: 1, pageSize: 10 }).subscribe(() => {
        expect(mockMemoryCache.set).toHaveBeenCalled();
        expect(mockLruCache.set).toHaveBeenCalled();
        done();
      });
    });

    it('should use IndexedDB when offline', (done) => {
      Object.defineProperty(mockNetworkStatus, 'isOffline', { get: () => true });
      mockIndexedDb.getAllUsers.and.returnValue(Promise.resolve([mockUser]));

      repository.getUsers({ page: 1, pageSize: 10 }).subscribe(result => {
        expect(mockIndexedDb.getAllUsers).toHaveBeenCalled();
        expect(result.data.length).toBe(1);
        done();
      });
    });

    it('should error when offline and no IndexedDB data', (done) => {
      Object.defineProperty(mockNetworkStatus, 'isOffline', { get: () => true });
      mockIndexedDb.getAllUsers.and.returnValue(Promise.resolve([]));

      repository.getUsers({ page: 1, pageSize: 10 }).subscribe({
        error: err => {
          expect(err).toBeDefined();
          done();
        }
      });
    });
  });

  describe('getUser', () => {
    it('should return user from API when caches miss', (done) => {
      const singleUserDto = { data: mockUserDto };
      mockApiService.get.and.returnValue(of(singleUserDto));

      repository.getUser('1').subscribe(user => {
        expect(user).toBeDefined();
        done();
      });
    });

    it('should return user from memory cache', (done) => {
      mockMemoryCache.get.and.returnValue(mockUser);

      repository.getUser('1').subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(mockApiService.get).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return user from LRU cache when memory misses', (done) => {
      mockMemoryCache.get.and.returnValue(null);
      mockLruCache.get.and.returnValue(mockUser);

      repository.getUser('1').subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });
  });

  describe('createUser', () => {
    it('should create user via API when online', (done) => {
      repository.createUser({
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bob@example.com',
      }).subscribe(user => {
        expect(mockApiService.post).toHaveBeenCalled();
        expect(user).toBeDefined();
        done();
      });
    });

    it('should invalidate caches after create', (done) => {
      repository.createUser({
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bob@example.com',
      }).subscribe(() => {
        expect(mockMemoryCache.clear).toHaveBeenCalled();
        expect(mockLruCache.clear).toHaveBeenCalled();
        done();
      });
    });

    it('should queue operation when offline', (done) => {
      Object.defineProperty(mockNetworkStatus, 'isOffline', { get: () => true });

      repository.createUser({
        firstName: 'Offline',
        lastName: 'User',
        email: 'offline@example.com',
      }).subscribe(user => {
        expect(mockIndexedDb.addPendingOperation).toHaveBeenCalled();
        expect(user.id).toContain('temp_');
        done();
      });
    });
  });

  describe('updateUser', () => {
    it('should update user via API when online', (done) => {
      repository.updateUser('1', { firstName: 'Updated' }).subscribe(user => {
        expect(mockApiService.put).toHaveBeenCalled();
        expect(user).toBeDefined();
        done();
      });
    });

    it('should invalidate caches after update', (done) => {
      repository.updateUser('1', { firstName: 'Updated' }).subscribe(() => {
        expect(mockMemoryCache.clear).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user via API when online', (done) => {
      repository.deleteUser('1').subscribe(() => {
        expect(mockApiService.delete).toHaveBeenCalled();
        done();
      });
    });

    it('should invalidate caches after delete', (done) => {
      repository.deleteUser('1').subscribe(() => {
        expect(mockMemoryCache.clear).toHaveBeenCalled();
        expect(mockLruCache.clear).toHaveBeenCalled();
        done();
      });
    });

    it('should queue delete operation when offline', (done) => {
      Object.defineProperty(mockNetworkStatus, 'isOffline', { get: () => true });

      repository.deleteUser('1').subscribe(() => {
        expect(mockIndexedDb.addPendingOperation).toHaveBeenCalledWith(
          jasmine.objectContaining({ type: 'delete', entityId: '1' })
        );
        done();
      });
    });
  });
});
