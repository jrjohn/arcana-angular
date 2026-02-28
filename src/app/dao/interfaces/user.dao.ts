import { Observable } from 'rxjs';
import {
  UserDto,
  PaginatedUserResponseDto,
  SingleUserResponseDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
} from '../../data/dto/user.dto';

/**
 * IUserDao — HTTP-level DAO interface for User resources.
 *
 * Methods operate on raw DTOs (snake_case, API shape) rather than domain
 * entities. This is the lowest layer of the 3-tier architecture:
 *   Service → Repository → DAO → HTTP
 *
 * Mirrors the arcana-cloud-springboot UserDao<User, Long> pattern.
 */
export interface IUserDao {
  /**
   * Fetch a paginated list of users from the remote API.
   */
  getUsers(page: number, pageSize: number): Observable<PaginatedUserResponseDto>;

  /**
   * Fetch a single user by their numeric/string ID from the remote API.
   */
  getUserById(id: string): Observable<SingleUserResponseDto>;

  /**
   * Create a new user via the remote API.
   */
  createUser(data: CreateUserRequestDto): Observable<UserDto>;

  /**
   * Update an existing user via the remote API.
   */
  updateUser(id: string, data: UpdateUserRequestDto): Observable<UserDto>;

  /**
   * Delete a user by ID via the remote API.
   */
  deleteUser(id: string): Observable<void>;
}
