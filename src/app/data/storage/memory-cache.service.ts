import { Injectable } from '@angular/core';

/**
 * Memory Cache Service (Layer 1)
 * Ultra-fast in-memory cache using Map for instant access
 * No TTL, no eviction - pure speed for frequently accessed data
 */
@Injectable({
  providedIn: 'root'
})
export class MemoryCacheService {
  private readonly cache = new Map<string, unknown>();
  private readonly maxSize = 50; // Keep small for truly hot data

  /**
   * Sets a value in memory cache
   */
  set<T>(key: string, data: T): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, data);
  }

  /**
   * Gets a value from memory cache
   */
  get<T>(key: string): T | null {
    const value = this.cache.get(key);
    return value !== undefined ? (value as T) : null;
  }

  /**
   * Checks if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
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
}
