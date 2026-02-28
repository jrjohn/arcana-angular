import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError, map, catchError, from, switchMap } from 'rxjs';

import { UserRepository } from '../user.repository';
import { USER_DAO_TOKEN } from '../../dao/index';
import { IUserDao } from '../../dao/user.dao';

import { User, CreateUserDto, UpdateUserDto } from '../../domain/entities/user.model';
import { PaginatedResponse, PaginationParams } from '../../domain/entities/pagination.model';
import { ErrorCategory, createAppError } from '../../domain/entities/app-error.model';

import { CacheService } from '../../data/storage/cache.service';
import { MemoryCacheService } from '../../data/storage/memory-cache.service';
import { IndexedDbService } from '../../data/storage/indexed-db.service';
import { NetworkStatusService } from '../../domain/services/network-status.service';
import { UserMapper } from '../../data/mappers/user.mapper';

/**
 * UserRepositoryImpl — Concrete implementation of {@link UserRepository}.
 *
 * Architecture position:
 *   UserService → UserRepositoryImpl → IUserDao → ApiService → HTTP
 *
 * Responsibilities of this layer:
 *  - Offline-first 4-layer caching strategy (Memory → LRU → IndexedDB → API)
 *  - Domain entity mapping (DTO ↔ domain models via UserMapper)
 *  - Pending operation queue for offline mutations
 *
 * All raw HTTP calls are delegated to {@link IUserDao} (injected via
 * USER_DAO_TOKEN), keeping transport concerns out of the repository.
 */
@Injectable()
export class UserRepositoryImpl implements UserRepository {

  private readonly userDao: IUserDao      = inject(USER_DAO_TOKEN);
  private readonly memoryCache            = inject(MemoryCacheService);
  private readonly lruCache               = inject(CacheService);
  private readonly indexedDb              = inject(IndexedDbService);
  private readonly networkStatus          = inject(NetworkStatusService);

  private readonly cacheKeyPrefix = 'user';

  // ── BaseRepository ────────────────────────────────────────────────────────

  /**
   * Persist (create) a domain entity.
   * Callers with an existing ID should use update() instead.
   */
  save(entity: User): Observable<User> {
    const dto: CreateUserDto = {
      email:     entity.email,
      firstName: entity.firstName,
      lastName:  entity.lastName,
      avatar:    entity.avatar,
    };
    return this.create(dto);
  }

  findById(id: string): Observable<User> {
    return this.getUser(id);
  }

  /**
   * Return all users — fetches page 1 up to 100 items.
   * For paginated access use findPaginated().
   */
  findAll(): Observable<User[]> {
    return this.findPaginated({ page: 1, pageSize: 100 }).pipe(
      map(response => response.data)
    );
  }

  count(): Observable<number> {
    return this.findPaginated({ page: 1, pageSize: 1 }).pipe(
      map(response => response.total)
    );
  }

  deleteById(id: string): Observable<void> {
    return this.deleteUser(id);
  }

  // ── UserRepository extensions ─────────────────────────────────────────────

  findPaginated(params: PaginationParams): Observable<PaginatedResponse<User>> {
    return this.getUsers(params);
  }

  findByQuery(query: string, params: PaginationParams): Observable<PaginatedResponse<User>> {
    return this.getUsers(params).pipe(
      map(response => {
        if (!query || query.trim().length === 0) {
          return response;
        }
        const lowerQuery = query.toLowerCase();
        const filteredData = response.data.filter(
          user =>
            user.firstName.toLowerCase().includes(lowerQuery) ||
            user.lastName.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery)
        );
        return {
          ...response,
          data:       filteredData,
          total:      filteredData.length,
          totalPages: Math.ceil(filteredData.length / response.pageSize),
        };
      })
    );
  }

  findByEmail(email: string): Observable<User | null> {
    return this.findPaginated({ page: 1, pageSize: 100 }).pipe(
      map(response =>
        response.data.find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null
      )
    );
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.createUser(dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<User> {
    return this.updateUser(id, dto);
  }

  // ── Offline-first private methods ─────────────────────────────────────────

  /**
   * Gets a paginated list of users using a 4-layer offline-first strategy:
   *   1. Memory Cache — instant access for hot data
   *   2. LRU Cache    — fast access with TTL expiration
   *   3. IndexedDB    — persistent offline storage
   *   4. DAO          — remote API (online only)
   */
  private getUsers(params: PaginationParams): Observable<PaginatedResponse<User>> {
    const cacheKey = this.buildCacheKey('list', params.page, params.pageSize);

    // Layer 1: Memory Cache (instant)
    const memCached = this.memoryCache.get<PaginatedResponse<User>>(cacheKey);
    if (memCached) {
      console.log('[Repository] ✓ Memory Cache HIT:', cacheKey);
      return of(memCached);
    }

    // Layer 2: LRU Cache (fast, with TTL)
    const lruCached = this.lruCache.get<PaginatedResponse<User>>(cacheKey);
    if (lruCached) {
      console.log('[Repository] ✓ LRU Cache HIT:', cacheKey);
      this.memoryCache.set(cacheKey, lruCached);
      return of(lruCached);
    }

    // Layer 3: IndexedDB (persistent, offline ONLY)
    if (this.networkStatus.isOffline) {
      return from(this.indexedDb.getAllUsers()).pipe(
        switchMap(dbUsers => {
          if (dbUsers.length > 0) {
            console.log('[Repository] ✓ IndexedDB HIT (OFFLINE):', dbUsers.length, 'users');

            const startIndex = (params.page - 1) * params.pageSize;
            const paginatedData = dbUsers.slice(startIndex, startIndex + params.pageSize);

            const result: PaginatedResponse<User> = {
              data:       paginatedData,
              page:       params.page,
              pageSize:   params.pageSize,
              total:      dbUsers.length,
              totalPages: Math.ceil(dbUsers.length / params.pageSize),
            };

            return of(result);
          }

          console.log('[Repository] ✗ OFFLINE — No cached data available');
          return throwError(() =>
            createAppError(
              new Error('No offline data available'),
              ErrorCategory.NETWORK,
              'error.network'
            )
          );
        })
      );
    }

    // Layer 4: Remote API via DAO
    console.log('[Repository] → Fetching from API');
    return this.fetchAndUpdateUsers(params, cacheKey);
  }

  /**
   * Fetches users from the DAO (HTTP) and populates all cache layers.
   */
  private fetchAndUpdateUsers(
    params: PaginationParams,
    cacheKey: string
  ): Observable<PaginatedResponse<User>> {
    return this.userDao.getUsers(params.page, params.pageSize).pipe(
      map(dto => {
        const result = UserMapper.toPaginatedDomain(dto);

        // Fix duplicate IDs from mock APIs that cycle IDs across pages
        const baseIndex = (result.page - 1) * result.pageSize;
        result.data = result.data.map((user: User, index: number) => {
          if (/^\d+$/.test(user.id)) {
            return { ...user, id: String(baseIndex + index + 1) };
          }
          return user;
        });

        this.saveToAllLayers(cacheKey, result);

        result.data.forEach((user: User) => {
          this.indexedDb.saveUser(user).catch((err: unknown) =>
            console.error('[Repository] Failed to save user to IndexedDB:', err)
          );
        });

        console.log('[Repository] ✓ API Response cached');
        return result;
      }),
      catchError(error => {
        console.error('[Repository] ✗ API Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Gets a single user using the 4-layer offline-first strategy.
   */
  private getUser(id: string): Observable<User> {
    const cacheKey = this.buildCacheKey('single', id);

    // Layer 1: Memory Cache
    const memCached = this.memoryCache.get<User>(cacheKey);
    if (memCached) {
      console.log('[Repository] ✓ Memory Cache HIT (user):', id);
      return of(memCached);
    }

    // Layer 2: LRU Cache
    const lruCached = this.lruCache.get<User>(cacheKey);
    if (lruCached) {
      console.log('[Repository] ✓ LRU Cache HIT (user):', id);
      this.memoryCache.set(cacheKey, lruCached);
      return of(lruCached);
    }

    // Layer 3: IndexedDB
    return from(this.indexedDb.getUserById(id)).pipe(
      switchMap(dbUser => {
        if (dbUser) {
          console.log('[Repository] ✓ IndexedDB HIT (user):', id);
          this.lruCache.set(cacheKey, dbUser);
          this.memoryCache.set(cacheKey, dbUser);

          if (this.networkStatus.isOnlineNow) {
            this.fetchAndCacheUser(id, cacheKey).subscribe();
          }

          return of(dbUser);
        }

        // Layer 4: Remote API via DAO
        if (this.networkStatus.isOffline) {
          return throwError(() =>
            createAppError(
              new Error('User not found offline'),
              ErrorCategory.NOT_FOUND,
              'error.not.found'
            )
          );
        }

        console.log('[Repository] → Fetching user from API:', id);
        return this.fetchAndCacheUser(id, cacheKey);
      })
    );
  }

  /**
   * Fetches a single user from the DAO and caches it.
   */
  private fetchAndCacheUser(id: string, cacheKey: string): Observable<User> {
    return this.userDao.getUserById(id).pipe(
      map(dto => {
        const user = UserMapper.toSingleDomain(dto);
        this.saveToAllLayers(cacheKey, user);
        this.indexedDb.saveUser(user).catch(err =>
          console.error('[Repository] Failed to save user to IndexedDB:', err)
        );
        return user;
      })
    );
  }

  /**
   * Creates a new user — supports offline queuing.
   */
  private createUser(userData: CreateUserDto): Observable<User> {
    const apiData = UserMapper.toCreateDto(userData);

    if (this.networkStatus.isOffline) {
      const tempUser: User = {
        id:        `temp_${Date.now()}`,
        firstName: userData.firstName,
        lastName:  userData.lastName,
        email:     userData.email,
        avatar:    userData.avatar,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return from(
        this.indexedDb.addPendingOperation({
          type:       'create',
          entityType: 'user',
          data:       userData,
          timestamp:  new Date(),
          retryCount: 0,
        })
      ).pipe(
        switchMap(() => {
          this.indexedDb.saveUser(tempUser);
          this.invalidateAllCaches();
          return of(tempUser);
        })
      );
    }

    return this.userDao.createUser(apiData).pipe(
      map(dto => {
        const user = UserMapper.toDomain(dto);
        this.indexedDb.saveUser(user);
        this.invalidateAllCaches();
        return user;
      })
    );
  }

  /**
   * Updates an existing user — supports offline queuing.
   */
  private updateUser(id: string, userData: UpdateUserDto): Observable<User> {
    const apiData = UserMapper.toUpdateDto(userData);

    if (this.networkStatus.isOffline) {
      return from(
        this.indexedDb.addPendingOperation({
          type:       'update',
          entityType: 'user',
          entityId:   id,
          data:       userData,
          timestamp:  new Date(),
          retryCount: 0,
        })
      ).pipe(
        switchMap(() => this.indexedDb.getUserById(id)),
        map(existingUser => {
          if (!existingUser) {
            throw createAppError(
              new Error('User not found offline'),
              ErrorCategory.NOT_FOUND,
              'error.not.found'
            );
          }

          const updatedUser: User = {
            ...existingUser,
            firstName: userData.firstName ?? existingUser.firstName,
            lastName:  userData.lastName  ?? existingUser.lastName,
            email:     userData.email     ?? existingUser.email,
            avatar:    userData.avatar    ?? existingUser.avatar,
            updatedAt: new Date(),
          };

          this.indexedDb.saveUser(updatedUser);
          this.invalidateAllCaches();
          return updatedUser;
        })
      );
    }

    return this.userDao.updateUser(id, apiData).pipe(
      map(dto => {
        // reqres.in PUT doesn't echo the ID back — preserve it from the request
        const user = UserMapper.toDomain({ ...dto, id });
        this.indexedDb.saveUser(user);
        this.invalidateAllCaches();
        return user;
      })
    );
  }

  /**
   * Deletes a user — supports offline queuing.
   */
  private deleteUser(id: string): Observable<void> {
    if (this.networkStatus.isOffline) {
      return from(
        this.indexedDb.addPendingOperation({
          type:       'delete',
          entityType: 'user',
          entityId:   id,
          timestamp:  new Date(),
          retryCount: 0,
        })
      ).pipe(
        switchMap(() => {
          this.indexedDb.deleteUser(id);
          this.invalidateAllCaches();
          return of(undefined as void);
        })
      );
    }

    return this.userDao.deleteUser(id).pipe(
      map(() => {
        this.indexedDb.deleteUser(id);
        this.invalidateAllCaches();
      })
    );
  }

  // ── Cache helpers ──────────────────────────────────────────────────────────

  private saveToAllLayers<T>(key: string, data: T): void {
    this.memoryCache.set(key, data);
    this.lruCache.set(key, data);
    console.log('[Repository] ✓ Saved to all cache layers:', key);
  }

  private invalidateAllCaches(): void {
    this.memoryCache.clear();
    this.lruCache.clear();
    console.log('[Repository] ✓ All caches invalidated');
  }

  private buildCacheKey(...parts: (string | number)[]): string {
    return [this.cacheKeyPrefix, ...parts].join('_');
  }
}
