import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../data/api/api.service';
import { IUserDao } from '../user.dao';
import {
  UserDto,
  PaginatedUserResponseDto,
  SingleUserResponseDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
} from '../../data/dto/user.dto';

/**
 * UserDaoImpl — Concrete DAO implementation backed by {@link ApiService}.
 *
 * Responsibilities:
 *  - Execute raw HTTP requests via ApiService (GET / POST / PUT / DELETE)
 *  - Return raw API DTOs; NO domain mapping, NO caching, NO offline logic
 *
 * Domain mapping, caching, and offline-first orchestration belong to the
 * Repository layer ({@link UserRepositoryImpl}).
 */
@Injectable()
export class UserDaoImpl implements IUserDao {

  private readonly apiService = inject(ApiService);

  /**
   * GET /users?page=<page>&per_page=<pageSize>
   */
  getUsers(page: number, pageSize: number): Observable<PaginatedUserResponseDto> {
    return this.apiService.get<PaginatedUserResponseDto>(
      `/users?page=${page}&per_page=${pageSize}`
    );
  }

  /**
   * GET /users/:id
   */
  getUserById(id: string): Observable<SingleUserResponseDto> {
    return this.apiService.get<SingleUserResponseDto>(`/users/${id}`);
  }

  /**
   * POST /users
   */
  createUser(data: CreateUserRequestDto): Observable<UserDto> {
    return this.apiService.post<UserDto>('/users', data);
  }

  /**
   * PUT /users/:id
   */
  updateUser(id: string, data: UpdateUserRequestDto): Observable<UserDto> {
    return this.apiService.put<UserDto>(`/users/${id}`, data);
  }

  /**
   * DELETE /users/:id
   */
  deleteUser(id: string): Observable<void> {
    return this.apiService.delete<void>(`/users/${id}`);
  }
}
