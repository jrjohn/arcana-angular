import { Injectable } from '@angular/core';
import { Observable, map, switchMap, of } from 'rxjs';
import { UserDao } from '../user.dao';
import { UserRepository } from '../../data/repositories/user.repository';
import { User, CreateUserDto, UpdateUserDto } from '../../domain/entities/user.model';
import { PaginatedResponse, PaginationParams } from '../../domain/entities/pagination.model';

/**
 * UserDaoImpl - Concrete implementation of UserDao.
 *
 * Wraps the existing UserRepository so that the domain / service layer never
 * depends on the repository (or HTTP / caching internals) directly.
 * This mirrors the arcana-cloud-springboot pattern where UserDaoImpl
 * delegates to UserRepository (JPA) internally.
 */
@Injectable()
export class UserDaoImpl implements UserDao {

  constructor(private readonly userRepository: UserRepository) {}

  // ── BaseDao ───────────────────────────────────────────────────────────────

  /**
   * Save (create) an entity.
   * Because the repository distinguishes create / update, "save" maps to
   * create when called from BaseDao context (no id mutation needed here –
   * callers with an id should use update() instead).
   */
  save(entity: User): Observable<User> {
    const dto: CreateUserDto = {
      email:     entity.email,
      firstName: entity.firstName,
      lastName:  entity.lastName,
      avatar:    entity.avatar,
    };
    return this.userRepository.createUser(dto);
  }

  findById(id: string): Observable<User> {
    return this.userRepository.getUser(id);
  }

  /**
   * findAll fetches the first page (up to 100 items) and returns the data array.
   * For paginated access use findPaginated().
   */
  findAll(): Observable<User[]> {
    return this.userRepository.getUsers({ page: 1, pageSize: 100 }).pipe(
      map(response => response.data)
    );
  }

  count(): Observable<number> {
    return this.userRepository.getUsers({ page: 1, pageSize: 1 }).pipe(
      map(response => response.total)
    );
  }

  deleteById(id: string): Observable<void> {
    return this.userRepository.deleteUser(id);
  }

  // ── UserDao extensions ────────────────────────────────────────────────────

  findPaginated(params: PaginationParams): Observable<PaginatedResponse<User>> {
    return this.userRepository.getUsers(params);
  }

  findByQuery(query: string, params: PaginationParams): Observable<PaginatedResponse<User>> {
    return this.userRepository.getUsers(params).pipe(
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
          data: filteredData,
          total: filteredData.length,
          totalPages: Math.ceil(filteredData.length / response.pageSize),
        };
      })
    );
  }

  findByEmail(email: string): Observable<User | null> {
    // No direct API endpoint for single-email lookup; filter client-side
    return this.userRepository.getUsers({ page: 1, pageSize: 100 }).pipe(
      map(response =>
        response.data.find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null
      )
    );
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.userRepository.createUser(dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<User> {
    return this.userRepository.updateUser(id, dto);
  }
}
