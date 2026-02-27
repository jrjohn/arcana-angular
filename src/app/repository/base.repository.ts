import { Observable } from 'rxjs';

/**
 * BaseRepository - Generic CRUD abstraction interface
 * Mirrors arcana-cloud-springboot's BaseDao<T, K> pattern.
 *
 * @template T  - Domain entity type
 * @template K  - Primary key type (e.g. string, number)
 */
export interface BaseRepository<T, K> {
  /**
   * Persist (create or update) an entity.
   */
  save(entity: T): Observable<T>;

  /**
   * Find a single entity by its primary key.
   */
  findById(id: K): Observable<T>;

  /**
   * Return all entities (no pagination).
   */
  findAll(): Observable<T[]>;

  /**
   * Return the total count of entities.
   */
  count(): Observable<number>;

  /**
   * Remove an entity by its primary key.
   */
  deleteById(id: K): Observable<void>;
}
