import { TestBed } from '@angular/core/testing';
import { MemoryCacheService } from './memory-cache.service';

describe('MemoryCacheService', () => {
  let service: MemoryCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemoryCacheService);
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

  describe('has', () => {
    it('should return true for existing key', () => {
      service.set('key1', 'value1');
      expect(service.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(service.has('nonexistent')).toBe(false);
    });

    it('should return true after setting value', () => {
      expect(service.has('key1')).toBe(false);
      service.set('key1', 'value1');
      expect(service.has('key1')).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      service.set('key1', 'value1');
      service.delete('key1');
      expect(service.get('key1')).toBeNull();
      expect(service.has('key1')).toBe(false);
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

    it('should update size after delete', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      expect(service.size).toBe(2);

      service.delete('key1');
      expect(service.size).toBe(1);
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

    it('should not increase size when overwriting key', () => {
      service.set('key1', 'value1');
      expect(service.size).toBe(1);

      service.set('key1', 'value2');
      expect(service.size).toBe(1);
    });
  });

  describe('eviction (FIFO when at capacity)', () => {
    it('should evict first entry when max size reached', () => {
      // Fill cache to max size (50)
      for (let i = 0; i < 50; i++) {
        service.set(`key${i}`, `value${i}`);
      }

      expect(service.size).toBe(50);

      // Add one more - should evict key0
      service.set('key50', 'value50');

      expect(service.size).toBe(50);
      expect(service.get('key0')).toBeNull();
      expect(service.get('key50')).toBe('value50');
      expect(service.get('key1')).toBe('value1'); // Next entry should still exist
    });

    it('should not evict when updating existing key', () => {
      // Fill cache to max size
      for (let i = 0; i < 50; i++) {
        service.set(`key${i}`, `value${i}`);
      }

      // Update existing key
      service.set('key25', 'updated value');

      // Should not evict
      expect(service.size).toBe(50);
      expect(service.get('key25')).toBe('updated value');
      expect(service.get('key0')).toBe('value0'); // First key should still exist
    });

    it('should evict in FIFO order', () => {
      // Fill to max size
      for (let i = 0; i < 50; i++) {
        service.set(`key${i}`, `value${i}`);
      }

      // Add 5 more
      for (let i = 50; i < 55; i++) {
        service.set(`key${i}`, `value${i}`);
      }

      // First 5 entries should be evicted
      expect(service.get('key0')).toBeNull();
      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBeNull();
      expect(service.get('key3')).toBeNull();
      expect(service.get('key4')).toBeNull();

      // Last entries should exist
      expect(service.get('key50')).toBe('value50');
      expect(service.get('key54')).toBe('value54');
    });
  });

  describe('edge cases', () => {
    it('should handle null value', () => {
      service.set('key1', null);
      expect(service.has('key1')).toBe(true);
      expect(service.get('key1')).toBe(null);
    });

    it('should handle undefined value', () => {
      service.set('key1', undefined);
      expect(service.has('key1')).toBe(true);
      // get returns null for undefined stored values
      expect(service.get('key1')).toBeNull();
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

    it('should handle array of objects', () => {
      const arr = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      service.set('key1', arr);
      const result = service.get<typeof arr>('key1');
      expect(result).toEqual(arr);
      expect(result?.[0].id).toBe(1);
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple sets and gets', () => {
      for (let i = 0; i < 30; i++) {
        service.set(`key${i}`, `value${i}`);
      }

      for (let i = 0; i < 30; i++) {
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

  describe('performance characteristics', () => {
    it('should have small max size for hot data', () => {
      expect(service.size).toBeLessThanOrEqual(50);
    });

    it('should handle rapid set operations', () => {
      const iterations = 100;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        service.set(`key${i}`, `value${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should be very fast (< 100ms for 100 operations)
      expect(duration).toBeLessThan(100);
    });

    it('should handle rapid get operations', () => {
      // Setup
      for (let i = 0; i < 50; i++) {
        service.set(`key${i}`, `value${i}`);
      }

      const startTime = Date.now();

      // Perform rapid gets
      for (let i = 0; i < 1000; i++) {
        service.get(`key${i % 50}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should be very fast (< 100ms for 1000 operations)
      expect(duration).toBeLessThan(100);
    });
  });
});
