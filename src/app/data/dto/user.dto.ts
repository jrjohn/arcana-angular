/**
 * User Data Transfer Object (DTO)
 * Represents the raw data structure from the API
 * This is separate from the domain User model to decouple API structure from business logic
 * Note: reqres.in returns id as number, we convert to string in mapper
 */
export interface UserDto {
  id: number | string;  // reqres.in uses number, we accept both
  email: string;
  first_name: string;   // API uses snake_case
  last_name: string;    // API uses snake_case
  avatar?: string;
  createdAt?: string;   // ISO date string from API
  updatedAt?: string;   // ISO date string from API
}

/**
 * Paginated Response DTO for User List
 */
export interface PaginatedUserResponseDto {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: UserDto[];
}

/**
 * Single User Response DTO
 */
export interface SingleUserResponseDto {
  data: UserDto;
}

/**
 * Create User Request DTO
 */
export interface CreateUserRequestDto {
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

/**
 * Update User Request DTO
 */
export interface UpdateUserRequestDto {
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

/**
 * User API Error Response DTO
 */
export interface UserErrorResponseDto {
  error?: string;
  message?: string;
}
