import { Injectable } from '@angular/core';

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  accessedAt: number;
}

/**
 * In-memory LRU Cache Service
 * Provides fast access to frequently used data with automatic expiration
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxSize = 100;

  /**
   * Sets a value in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expirationTime = ttl || this.defaultTTL;
    const now = Date.now();

    const entry: CacheEntry<T> = {
      data,
      expiresAt: now + expirationTime,
      accessedAt: now,
    };

    this.cache.set(key, entry);

    // Evict oldest entry if cache is full
    if (this.cache.size > this.maxSize) {
      this.evictOldest();
    }
  }

  /**
   * Gets a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    const now = Date.now();

    // Check if expired
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Update access time for LRU
    entry.accessedAt = now;
    return entry.data;
  }

  /**
   * Checks if key exists in cache and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Deletes a key from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Gets current cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Evicts the oldest (least recently accessed) entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
