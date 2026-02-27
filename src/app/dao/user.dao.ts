import { Observable } from 'rxjs';
import { BaseDao } from './base.dao';
import { User, CreateUserDto, UpdateUserDto } from '../domain/entities/user.model';
import { PaginatedResponse, PaginationParams } from '../domain/entities/pagination.model';

/**
 * UserDao - Data Access Object interface for User entities.
 * Extends BaseDao with user-specific query and mutation methods.
 * Mirrors arcana-cloud-springboot's UserDao pattern.
 */
export interface UserDao extends BaseDao<User, string> {
  // ── Paginated reads ──────────────────────────────────────────────────────
  /**
   * Retrieve a paginated list of users.
   */
  findPaginated(params: PaginationParams): Observable<PaginatedResponse<User>>;

  /**
   * Find users whose firstName, lastName, or email contains the given query.
   */
  findByQuery(query: string, params: PaginationParams): Observable<PaginatedResponse<User>>;

  // ── Single-field lookups (mirrors Spring-style finders) ──────────────────
  /**
   * Find a user by email address.
   */
  findByEmail(email: string): Observable<User | null>;

  // ── Mutations via DTOs ────────────────────────────────────────────────────
  /**
   * Create a new user from a CreateUserDto.
   */
  create(dto: CreateUserDto): Observable<User>;

  /**
   * Update an existing user's data.
   */
  update(id: string, dto: UpdateUserDto): Observable<User>;
}
