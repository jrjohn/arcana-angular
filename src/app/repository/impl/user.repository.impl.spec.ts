import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserRepositoryImpl } from './user.repository.impl';
import { USER_DAO_TOKEN, IUserDao } from '../../dao/index';
import { MemoryCacheService } from '../../data/storage/memory-cache.service';
import { CacheService } from '../../data/storage/cache.service';
import { IndexedDbService } from '../../data/storage/indexed-db.service';
import { NetworkStatusService } from '../../domain/services/network-status.service';
import { User } from '../../domain/entities/user.model';
import { PaginatedUserResponseDto, SingleUserResponseDto, UserDto } from '../../data/dto/user.dto';

describe('UserRepositoryImpl', () => {
  let repository: UserRepositoryImpl;
  let mockUserDao: jasmine.SpyObj<IUserDao>;
  let mockMemoryCache: jasmine.SpyObj<MemoryCacheService>;
  let mockLruCache: jasmine.SpyObj<CacheService>;
  let mockIndexedDb: jasmine.SpyObj<IndexedDbService>;
  let mockNetworkStatus: { isOffline: boolean; isOnlineNow: boolean };

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

  const mockSingleDto: SingleUserResponseDto = {
    data: mockUserDto,
  };

  const mockPaginatedDomain = {
    data: [mockUser],
    page: 1,
    pageSize: 10,
    total: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    mockUserDao = jasmine.createSpyObj('IUserDao', [
      'getUsers', 'getUserById', 'createUser', 'updateUser', 'deleteUser'
    ]);
    mockMemoryCache = jasmine.createSpyObj('MemoryCacheService', ['get', 'set', 'clear']);
    mockLruCache = jasmine.createSpyObj('CacheService', ['get', 'set', 'clear']);
    mockIndexedDb = jasmine.createSpyObj('IndexedDbService', [
      'getAllUsers', 'getUserById', 'saveUser', 'deleteUser', 'addPendingOperation'
    ]);
    mockNetworkStatus = { isOffline: false, isOnlineNow: true };

    // Defaults
    mockMemoryCache.get.and.returnValue(null);
    mockLruCache.get.and.returnValue(null);
    mockIndexedDb.getAllUsers.and.returnValue(Promise.resolve([]));
    mockIndexedDb.getUserById.and.returnValue(Promise.resolve(undefined));
    mockIndexedDb.saveUser.and.returnValue(Promise.resolve('cached-id'));
    mockIndexedDb.deleteUser.and.returnValue(Promise.resolve());
    mockIndexedDb.addPendingOperation.and.returnValue(Promise.resolve(1));

    mockUserDao.getUsers.and.returnValue(of(mockPaginatedDto));
    mockUserDao.getUserById.and.returnValue(of(mockSingleDto));
    mockUserDao.createUser.and.returnValue(of(mockUserDto));
    mockUserDao.updateUser.and.returnValue(of(mockUserDto));
    mockUserDao.deleteUser.and.returnValue(of(undefined as any));

    TestBed.configureTestingModule({
      providers: [
        UserRepositoryImpl,
        { provide: USER_DAO_TOKEN, useValue: mockUserDao },
        { provide: MemoryCacheService, useValue: mockMemoryCache },
        { provide: CacheService, useValue: mockLruCache },
        { provide: IndexedDbService, useValue: mockIndexedDb },
        { provide: NetworkStatusService, useValue: mockNetworkStatus },
      ]
    });

    repository = TestBed.inject(UserRepositoryImpl);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  // ── findPaginated ──────────────────────────────────────────────────────────

  describe('findPaginated', () => {
    it('should return paginated users from DAO when caches are empty', (done) => {
      repository.findPaginated({ page: 1, pageSize: 10 }).subscribe(result => {
        expect(mockUserDao.getUsers).toHaveBeenCalledWith(1, 10);
        expect(result.data).toBeDefined();
        done();
      });
    });

    it('should return from memory cache when available', (done) => {
      mockMemoryCache.get.and.returnValue(mockPaginatedDomain);

      repository.findPaginated({ page: 1, pageSize: 10 }).subscribe(result => {
        expect(result).toEqual(mockPaginatedDomain);
        expect(mockUserDao.getUsers).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return from LRU cache when memory cache misses', (done) => {
      mockMemoryCache.get.and.returnValue(null);
      mockLruCache.get.and.returnValue(mockPaginatedDomain);

      repository.findPaginated({ page: 1, pageSize: 10 }).subscribe(result => {
        expect(result).toEqual(mockPaginatedDomain);
        expect(mockUserDao.getUsers).not.toHaveBeenCalled();
        done();
      });
    });

    it('should use IndexedDB when offline', (done) => {
      mockNetworkStatus.isOffline = true;
      mockIndexedDb.getAllUsers.and.returnValue(Promise.resolve([mockUser]));

      repository.findPaginated({ page: 1, pageSize: 10 }).subscribe(result => {
        expect(mockIndexedDb.getAllUsers).toHaveBeenCalled();
        expect(result.data).toEqual([mockUser]);
        done();
      });
    });

    it('should throw when offline with no cached data', (done) => {
      mockNetworkStatus.isOffline = true;
      mockIndexedDb.getAllUsers.and.returnValue(Promise.resolve([]));

      repository.findPaginated({ page: 1, pageSize: 10 }).subscribe({
        error: err => {
          expect(err).toBeDefined();
          done();
        }
      });
    });

    it('should save to all cache layers after API fetch', (done) => {
      repository.findPaginated({ page: 1, pageSize: 10 }).subscribe(() => {
        expect(mockMemoryCache.set).toHaveBeenCalled();
        expect(mockLruCache.set).toHaveBeenCalled();
        done();
      });
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return user from DAO when caches miss', (done) => {
      repository.findById('1').subscribe(user => {
        expect(user).toBeDefined();
        done();
      });
    });

    it('should return user from memory cache', (done) => {
      mockMemoryCache.get.and.returnValue(mockUser);

      repository.findById('1').subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(mockUserDao.getUserById).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return user from LRU cache when memory misses', (done) => {
      mockMemoryCache.get.and.returnValue(null);
      mockLruCache.get.and.returnValue(mockUser);

      repository.findById('1').subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all users', (done) => {
      repository.findAll().subscribe(users => {
        expect(Array.isArray(users)).toBe(true);
        done();
      });
    });
  });

  // ── count ─────────────────────────────────────────────────────────────────

  describe('count', () => {
    it('should return total user count', (done) => {
      repository.count().subscribe(count => {
        expect(typeof count).toBe('number');
        done();
      });
    });
  });

  // ── save ──────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('should create user via DAO', (done) => {
      repository.save(mockUser).subscribe(user => {
        expect(mockUserDao.createUser).toHaveBeenCalled();
        expect(user).toBeDefined();
        done();
      });
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create user via DAO when online', (done) => {
      repository.create({
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bob@example.com',
      }).subscribe(user => {
        expect(mockUserDao.createUser).toHaveBeenCalled();
        expect(user).toBeDefined();
        done();
      });
    });

    it('should queue create when offline and return temp user', (done) => {
      mockNetworkStatus.isOffline = true;

      repository.create({
        firstName: 'Offline',
        lastName: 'User',
        email: 'offline@example.com',
      }).subscribe(user => {
        expect(mockIndexedDb.addPendingOperation).toHaveBeenCalled();
        expect(user.id).toContain('temp_');
        done();
      });
    });

    it('should invalidate caches after create', (done) => {
      repository.create({
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bob@example.com',
      }).subscribe(() => {
        expect(mockMemoryCache.clear).toHaveBeenCalled();
        expect(mockLruCache.clear).toHaveBeenCalled();
        done();
      });
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update user via DAO when online', (done) => {
      repository.update('1', { firstName: 'Updated' }).subscribe(user => {
        expect(mockUserDao.updateUser).toHaveBeenCalled();
        expect(user).toBeDefined();
        done();
      });
    });

    it('should invalidate caches after update', (done) => {
      repository.update('1', { firstName: 'Updated' }).subscribe(() => {
        expect(mockMemoryCache.clear).toHaveBeenCalled();
        done();
      });
    });
  });

  // ── deleteById ────────────────────────────────────────────────────────────

  describe('deleteById', () => {
    it('should delete via DAO when online', (done) => {
      repository.deleteById('1').subscribe(() => {
        expect(mockUserDao.deleteUser).toHaveBeenCalled();
        done();
      });
    });

    it('should queue delete when offline', (done) => {
      mockNetworkStatus.isOffline = true;

      repository.deleteById('1').subscribe(() => {
        expect(mockIndexedDb.addPendingOperation).toHaveBeenCalledWith(
          jasmine.objectContaining({ type: 'delete', entityId: '1' })
        );
        done();
      });
    });

    it('should invalidate caches after delete', (done) => {
      repository.deleteById('1').subscribe(() => {
        expect(mockMemoryCache.clear).toHaveBeenCalled();
        expect(mockLruCache.clear).toHaveBeenCalled();
        done();
      });
    });
  });

  // ── findByQuery ───────────────────────────────────────────────────────────

  describe('findByQuery', () => {
    it('should filter users by query matching firstName', (done) => {
      // Use memory cache to return a set of users
      mockMemoryCache.get.and.returnValue({
        ...mockPaginatedDomain,
        data: [
          mockUser,
          { ...mockUser, id: '2', firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' }
        ],
        total: 2,
      });

      repository.findByQuery('alice', { page: 1, pageSize: 10 }).subscribe(result => {
        expect(result.data.some(u => u.firstName === 'Alice')).toBe(true);
        expect(result.data.every(u =>
          u.firstName.toLowerCase().includes('alice') ||
          u.lastName.toLowerCase().includes('alice') ||
          u.email.toLowerCase().includes('alice')
        )).toBe(true);
        done();
      });
    });

    it('should return all users when query is empty', (done) => {
      mockMemoryCache.get.and.returnValue(mockPaginatedDomain);

      repository.findByQuery('', { page: 1, pageSize: 10 }).subscribe(result => {
        expect(result.data.length).toBe(1);
        done();
      });
    });
  });

  // ── findByEmail ───────────────────────────────────────────────────────────

  describe('findByEmail', () => {
    it('should find user by email (case insensitive)', (done) => {
      mockMemoryCache.get.and.returnValue(mockPaginatedDomain);

      repository.findByEmail('ALICE@EXAMPLE.COM').subscribe(user => {
        expect(user).toBeDefined();
        expect(user?.email).toBe('alice@example.com');
        done();
      });
    });

    it('should return null when email not found', (done) => {
      mockMemoryCache.get.and.returnValue(mockPaginatedDomain);

      repository.findByEmail('notfound@example.com').subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });
  });
});
