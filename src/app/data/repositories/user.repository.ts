import { Injectable } from '@angular/core';
import { Observable, of, throwError, map, catchError, from, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { CacheService } from '../storage/cache.service';
import { MemoryCacheService } from '../storage/memory-cache.service';
import { IndexedDbService } from '../storage/indexed-db.service';
import { NetworkStatusService } from '../../domain/services/network-status.service';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserApiResponse,
  mapUserFromApi,
  mapUserToApi,
} from '../../domain/entities/user.model';
import { PaginatedResponse, PaginationParams } from '../../domain/entities/pagination.model';
import { ErrorCategory, createAppError } from '../../domain/entities/app-error.model';

/**
 * User Repository with Offline-First Architecture
 * 4-Layer Data Access Strategy:
 * 1. Memory Cache - Instant access for hot data
 * 2. LRU Cache - Fast access with TTL expiration
 * 3. IndexedDB - Persistent offline storage
 * 4. API - Remote server when online
 */
@Injectable({
  providedIn: 'root'
})
export class UserRepository {
  private readonly cacheKeyPrefix = 'user';

  constructor(
    private apiService: ApiService,
    private memoryCache: MemoryCacheService,
    private lruCache: CacheService,
    private indexedDb: IndexedDbService,
    private networkStatus: NetworkStatusService
  ) {}

  /**
   * Gets paginated list of users with 4-layer offline-first strategy
   */
  getUsers(params: PaginationParams): Observable<PaginatedResponse<User>> {
    const cacheKey = this.buildCacheKey('list', params.page, params.pageSize);

    // Layer 1: Check Memory Cache (instant)
    const memCached = this.memoryCache.get<PaginatedResponse<User>>(cacheKey);
    if (memCached) {
      console.log('[Repository] ✓ Memory Cache HIT:', cacheKey);
      return of(memCached);
    }

    // Layer 2: Check LRU Cache (fast, with TTL)
    const lruCached = this.lruCache.get<PaginatedResponse<User>>(cacheKey);
    if (lruCached) {
      console.log('[Repository] ✓ LRU Cache HIT:', cacheKey);
      // Promote to memory cache
      this.memoryCache.set(cacheKey, lruCached);
      return of(lruCached);
    }

    // Layer 3: Check IndexedDB (persistent, offline)
    return from(this.indexedDb.getAllUsers()).pipe(
      switchMap(dbUsers => {
        if (dbUsers.length > 0) {
          console.log('[Repository] ✓ IndexedDB HIT:', dbUsers.length, 'users');

          // Create paginated response from IndexedDB
          const startIndex = (params.page - 1) * params.pageSize;
          const endIndex = startIndex + params.pageSize;
          const paginatedData = dbUsers.slice(startIndex, endIndex);

          const result: PaginatedResponse<User> = {
            data: paginatedData,
            page: params.page,
            pageSize: params.pageSize,
            total: dbUsers.length,
            totalPages: Math.ceil(dbUsers.length / params.pageSize),
          };

          // Promote to upper cache layers
          this.lruCache.set(cacheKey, result);
          this.memoryCache.set(cacheKey, result);

          // If online, fetch fresh data in background
          if (this.networkStatus.isOnlineNow) {
            this.fetchAndUpdateUsers(params, cacheKey);
          }

          return of(result);
        }

        // Layer 4: Fetch from API (online only)
        if (this.networkStatus.isOffline) {
          console.log('[Repository] ✗ OFFLINE - No cached data available');
          return throwError(() =>
            createAppError(
              new Error('No offline data available'),
              ErrorCategory.NETWORK,
              'error.network'
            )
          );
        }

        console.log('[Repository] → Fetching from API');
        return this.fetchAndUpdateUsers(params, cacheKey);
      })
    );
  }

  /**
   * Fetches users from API and updates all cache layers
   */
  private fetchAndUpdateUsers(
    params: PaginationParams,
    cacheKey: string
  ): Observable<PaginatedResponse<User>> {
    return this.apiService
      .get<{
        data: UserApiResponse[];
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
      }>(`/users?page=${params.page}&per_page=${params.pageSize}`)
      .pipe(
        map(response => {
          // Map users and ensure unique IDs based on page offset
          // This fixes duplicate IDs from mock APIs that cycle IDs across pages
          const baseIndex = (response.page - 1) * response.per_page;
          const users = response.data.map((apiUser, index) => {
            const user = mapUserFromApi(apiUser);
            // For mock APIs, ensure unique ID by calculating global offset
            // Only modify if ID appears to be a simple number that might repeat
            if (/^\d+$/.test(user.id)) {
              const uniqueId = String(baseIndex + index + 1);
              return { ...user, id: uniqueId };
            }
            return user;
          });

          const result: PaginatedResponse<User> = {
            data: users,
            page: response.page,
            pageSize: response.per_page,
            total: response.total,
            totalPages: response.total_pages,
          };

          // Save to all cache layers (waterfall)
          this.saveToAllLayers(cacheKey, result);

          // Save individual users to IndexedDB
          result.data.forEach(user => {
            this.indexedDb.saveUser(user).catch(err =>
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
   * Gets a single user by ID with 4-layer offline-first strategy
   */
  getUser(id: string): Observable<User> {
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

          // Refresh from API if online
          if (this.networkStatus.isOnlineNow) {
            this.fetchAndCacheUser(id, cacheKey).subscribe();
          }

          return of(dbUser);
        }

        // Layer 4: API
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
   * Fetches single user from API and caches it
   */
  private fetchAndCacheUser(id: string, cacheKey: string): Observable<User> {
    return this.apiService.get<{ data: UserApiResponse }>(`/users/${id}`).pipe(
      map(response => {
        const user = mapUserFromApi(response.data);

        // Save to all layers
        this.saveToAllLayers(cacheKey, user);
        this.indexedDb.saveUser(user).catch(err =>
          console.error('[Repository] Failed to save user to IndexedDB:', err)
        );

        return user;
      })
    );
  }

  /**
   * Creates a new user (online/offline with pending operations)
   */
  createUser(userData: CreateUserDto): Observable<User> {
    const apiData = mapUserToApi(userData);

    if (this.networkStatus.isOffline) {
      // Queue for later sync
      const tempUser: User = {
        id: `temp_${Date.now()}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        avatar: userData.avatar,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return from(
        this.indexedDb.addPendingOperation({
          type: 'create',
          entityType: 'user',
          data: userData,
          timestamp: new Date(),
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

    return this.apiService.post<UserApiResponse>('/users', apiData).pipe(
      map(response => {
        const user = mapUserFromApi(response);

        // Save to IndexedDB
        this.indexedDb.saveUser(user);

        // Invalidate caches
        this.invalidateAllCaches();

        return user;
      })
    );
  }

  /**
   * Updates an existing user (online/offline with pending operations)
   */
  updateUser(id: string, userData: UpdateUserDto): Observable<User> {
    const apiData = mapUserToApi(userData);

    if (this.networkStatus.isOffline) {
      // Queue for later sync
      return from(
        this.indexedDb.addPendingOperation({
          type: 'update',
          entityType: 'user',
          entityId: id,
          data: userData,
          timestamp: new Date(),
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

          // Update user in IndexedDB
          const updatedUser: User = {
            ...existingUser,
            firstName: userData.firstName ?? existingUser.firstName,
            lastName: userData.lastName ?? existingUser.lastName,
            email: userData.email ?? existingUser.email,
            avatar: userData.avatar ?? existingUser.avatar,
            updatedAt: new Date(),
          };

          this.indexedDb.saveUser(updatedUser);
          this.invalidateAllCaches();

          return updatedUser;
        })
      );
    }

    return this.apiService.put<UserApiResponse>(`/users/${id}`, apiData).pipe(
      map(response => {
        const user = mapUserFromApi(response);

        // Save to IndexedDB
        this.indexedDb.saveUser(user);

        // Invalidate caches
        this.invalidateAllCaches();

        return user;
      })
    );
  }

  /**
   * Deletes a user (online/offline with pending operations)
   */
  deleteUser(id: string): Observable<void> {
    if (this.networkStatus.isOffline) {
      // Queue for later sync
      return from(
        this.indexedDb.addPendingOperation({
          type: 'delete',
          entityType: 'user',
          entityId: id,
          timestamp: new Date(),
          retryCount: 0,
        })
      ).pipe(
        switchMap(() => {
          // Remove from IndexedDB
          this.indexedDb.deleteUser(id);
          this.invalidateAllCaches();
          return of(undefined);
        })
      );
    }

    return this.apiService.delete<void>(`/users/${id}`).pipe(
      map(() => {
        // Remove from IndexedDB
        this.indexedDb.deleteUser(id);

        // Invalidate caches
        this.invalidateAllCaches();
      })
    );
  }

  /**
   * Saves data to all cache layers (Memory → LRU)
   */
  private saveToAllLayers<T>(key: string, data: T): void {
    this.memoryCache.set(key, data);
    this.lruCache.set(key, data);
    console.log('[Repository] ✓ Saved to all cache layers:', key);
  }

  /**
   * Invalidates all cache layers
   */
  private invalidateAllCaches(): void {
    this.memoryCache.clear();
    this.lruCache.clear();
    console.log('[Repository] ✓ All caches invalidated');
  }

  /**
   * Builds cache key
   */
  private buildCacheKey(...parts: (string | number)[]): string {
    return [this.cacheKeyPrefix, ...parts].join('_');
  }
}
