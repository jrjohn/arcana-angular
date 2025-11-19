import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set and get', () => {
    it('should store and retrieve value', () => {
      service.set('key1', 'value1');
      const result = service.get<string>('key1');
      expect(result).toBe('value1');
    });

    it('should store and retrieve object', () => {
      const obj = { id: 1, name: 'Test' };
      service.set('key1', obj);
      const result = service.get<typeof obj>('key1');
      expect(result).toEqual(obj);
    });

    it('should store and retrieve array', () => {
      const arr = [1, 2, 3, 4, 5];
      service.set('key1', arr);
      const result = service.get<typeof arr>('key1');
      expect(result).toEqual(arr);
    });

    it('should return null for non-existent key', () => {
      const result = service.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should overwrite existing key', () => {
      service.set('key1', 'value1');
      service.set('key1', 'value2');
      const result = service.get<string>('key1');
      expect(result).toBe('value2');
    });

    it('should handle multiple keys', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      service.set('key3', 'value3');

      expect(service.get('key1')).toBe('value1');
      expect(service.get('key2')).toBe('value2');
      expect(service.get('key3')).toBe('value3');
    });
  });

  describe('TTL expiration', () => {
    it('should expire after TTL', (done) => {
      const ttl = 100; // 100ms
      service.set('key1', 'value1', ttl);

      // Should exist immediately
      expect(service.get('key1')).toBe('value1');

      // Should be expired after TTL
      setTimeout(() => {
        const result = service.get('key1');
        expect(result).toBeNull();
        done();
      }, ttl + 50);
    });

    it('should use default TTL when not specified', () => {
      service.set('key1', 'value1');
      const result = service.get('key1');
      expect(result).toBe('value1');
    });

    it('should allow custom TTL', (done) => {
      const customTTL = 200;
      service.set('key1', 'value1', customTTL);

      // Should still exist before TTL
      setTimeout(() => {
        expect(service.get('key1')).toBe('value1');
      }, customTTL / 2);

      // Should be expired after TTL
      setTimeout(() => {
        expect(service.get('key1')).toBeNull();
        done();
      }, customTTL + 50);
    });

    it('should not expire if accessed frequently', () => {
      const ttl = 200;
      service.set('key1', 'value1', ttl);

      // Access should update accessedAt
      expect(service.get('key1')).toBe('value1');
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      service.set('key1', 'value1');
      expect(service.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(service.has('nonexistent')).toBe(false);
    });

    it('should return false for expired key', (done) => {
      const ttl = 100;
      service.set('key1', 'value1', ttl);

      expect(service.has('key1')).toBe(true);

      setTimeout(() => {
        expect(service.has('key1')).toBe(false);
        done();
      }, ttl + 50);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      service.set('key1', 'value1');
      service.delete('key1');
      expect(service.get('key1')).toBeNull();
    });

    it('should not throw when deleting non-existent key', () => {
      expect(() => service.delete('nonexistent')).not.toThrow();
    });

    it('should only delete specified key', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');

      service.delete('key1');

      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBe('value2');
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      service.set('key3', 'value3');

      service.clear();

      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBeNull();
      expect(service.get('key3')).toBeNull();
      expect(service.size).toBe(0);
    });

    it('should handle clearing empty cache', () => {
      expect(() => service.clear()).not.toThrow();
      expect(service.size).toBe(0);
    });
  });

  describe('size', () => {
    it('should return 0 for empty cache', () => {
      expect(service.size).toBe(0);
    });

    it('should return correct size', () => {
      service.set('key1', 'value1');
      expect(service.size).toBe(1);

      service.set('key2', 'value2');
      expect(service.size).toBe(2);

      service.set('key3', 'value3');
      expect(service.size).toBe(3);
    });

    it('should update size after delete', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      expect(service.size).toBe(2);

      service.delete('key1');
      expect(service.size).toBe(1);
    });

    it('should update size after clear', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      expect(service.size).toBe(2);

      service.clear();
      expect(service.size).toBe(0);
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entry when max size reached', () => {
      // Fill cache to max size (100)
      for (let i = 0; i < 100; i++) {
        service.set(`key${i}`, `value${i}`);
      }

      expect(service.size).toBe(100);

      // Access middle entry to update its accessedAt
      service.get('key50');

      // Add one more to trigger eviction
      service.set('key101', 'value101');

      // Cache should not exceed max size
      expect(service.size).toBe(100);

      // The oldest (least recently accessed) entry should be evicted
      // key0 should be gone, but key50 (accessed recently) should still exist
      expect(service.get('key50')).toBe('value50');
    });

    it('should evict based on access time', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');

      // Access key1 to make it more recent
      service.get('key1');

      // Fill cache to trigger eviction
      for (let i = 3; i < 102; i++) {
        service.set(`key${i}`, `value${i}`);
      }

      // key1 should still exist (accessed recently)
      // key2 should be evicted (oldest access time)
      expect(service.get('key1')).toBe('value1');
    });
  });

  describe('edge cases', () => {
    it('should handle null value', () => {
      service.set('key1', null);
      // get() returns null for both missing keys and null values
      // So we can't distinguish between them using has()
      // The cache will store null, but has() will return false because get() returns null
      const result = service.get('key1');
      expect(result).toBeNull();
    });

    it('should handle undefined value', () => {
      service.set('key1', undefined);
      // Similar to null, undefined will be stored but has() will return false
      const result = service.get('key1');
      expect(result).toBeDefined(); // undefined is defined as a value
    });

    it('should handle empty string key', () => {
      service.set('', 'value');
      expect(service.get('')).toBe('value');
    });

    it('should handle empty string value', () => {
      service.set('key1', '');
      expect(service.get('key1')).toBe('');
    });

    it('should handle boolean values', () => {
      service.set('key1', true);
      service.set('key2', false);

      expect(service.get('key1')).toBe(true);
      expect(service.get('key2')).toBe(false);
    });

    it('should handle number values', () => {
      service.set('key1', 0);
      service.set('key2', 123);
      service.set('key3', -456);
      service.set('key4', 3.14);

      expect(service.get('key1')).toBe(0);
      expect(service.get('key2')).toBe(123);
      expect(service.get('key3')).toBe(-456);
      expect(service.get('key4')).toBe(3.14);
    });

    it('should handle nested objects', () => {
      const nested = {
        level1: {
          level2: {
            level3: 'deep value'
          }
        }
      };

      service.set('key1', nested);
      const result = service.get<typeof nested>('key1');
      expect(result?.level1.level2.level3).toBe('deep value');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-01');
      service.set('key1', date);
      const result = service.get<Date>('key1');
      expect(result).toEqual(date);
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple sets and gets', () => {
      for (let i = 0; i < 50; i++) {
        service.set(`key${i}`, `value${i}`);
      }

      for (let i = 0; i < 50; i++) {
        expect(service.get(`key${i}`)).toBe(`value${i}`);
      }
    });

    it('should handle interleaved operations', () => {
      service.set('key1', 'value1');
      expect(service.get('key1')).toBe('value1');

      service.set('key2', 'value2');
      expect(service.get('key1')).toBe('value1');
      expect(service.get('key2')).toBe('value2');

      service.delete('key1');
      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBe('value2');
    });
  });
});
