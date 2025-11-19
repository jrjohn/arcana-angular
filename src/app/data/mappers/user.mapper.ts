import { User } from '../../domain/entities/user.model';
import { PaginatedResponse } from '../../domain/entities/pagination.model';
import {
  UserDto,
  PaginatedUserResponseDto,
  SingleUserResponseDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
} from '../dto/user.dto';

/**
 * User Mapper
 * Maps between API DTOs and Domain entities
 *
 * Benefits:
 * - Decouples API structure from domain models
 * - Allows API changes without affecting business logic
 * - Enables data transformation (e.g., snake_case to camelCase)
 * - Centralizes mapping logic for easier maintenance
 */
export class UserMapper {
  /**
   * Maps UserDto to User domain entity
   * Converts API snake_case to domain camelCase and handles date parsing
   * Converts number ID to string (reqres.in returns numbers)
   */
  static toDomain(dto: UserDto): User {
    return {
      id: typeof dto.id === 'number' ? String(dto.id) : dto.id,
      email: dto.email,
      firstName: dto.first_name,  // snake_case -> camelCase
      lastName: dto.last_name,    // snake_case -> camelCase
      avatar: dto.avatar,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
    };
  }

  /**
   * Maps array of UserDto to array of User domain entities
   */
  static toDomainList(dtos: UserDto[]): User[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Maps PaginatedUserResponseDto to PaginatedResponse<User>
   * Converts API response to domain paginated response
   */
  static toPaginatedDomain(dto: PaginatedUserResponseDto): PaginatedResponse<User> {
    return {
      data: this.toDomainList(dto.data),
      page: dto.page,
      pageSize: dto.per_page,       // per_page -> pageSize
      total: dto.total,
      totalPages: dto.total_pages,  // total_pages -> totalPages
    };
  }

  /**
   * Maps SingleUserResponseDto to User domain entity
   */
  static toSingleDomain(dto: SingleUserResponseDto): User {
    return this.toDomain(dto.data);
  }

  /**
   * Maps User domain entity to CreateUserRequestDto
   * Converts domain camelCase to API snake_case
   */
  static toCreateDto(user: Partial<User>): CreateUserRequestDto {
    return {
      email: user.email!,
      first_name: user.firstName!,  // camelCase -> snake_case
      last_name: user.lastName!,    // camelCase -> snake_case
      avatar: user.avatar,
    };
  }

  /**
   * Maps User domain entity to UpdateUserRequestDto
   * Converts domain camelCase to API snake_case
   */
  static toUpdateDto(user: Partial<User>): UpdateUserRequestDto {
    const dto: UpdateUserRequestDto = {};

    if (user.email !== undefined) {
      dto.email = user.email;
    }
    if (user.firstName !== undefined) {
      dto.first_name = user.firstName;  // camelCase -> snake_case
    }
    if (user.lastName !== undefined) {
      dto.last_name = user.lastName;    // camelCase -> snake_case
    }
    if (user.avatar !== undefined) {
      dto.avatar = user.avatar;
    }

    return dto;
  }

  /**
   * Maps User domain entity back to UserDto (if needed)
   * Converts domain camelCase to API snake_case
   */
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,   // camelCase -> snake_case
      last_name: user.lastName,     // camelCase -> snake_case
      avatar: user.avatar,
    };
  }
}
