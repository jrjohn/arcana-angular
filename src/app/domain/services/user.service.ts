import { Injectable, Inject } from '@angular/core';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { UserRepository } from '../../repository/user.repository';
import { USER_REPOSITORY_TOKEN } from '../../repository/repository.tokens';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserValidator,
} from '../entities/user.model';
import { PaginatedResponse, PaginationParams } from '../entities/pagination.model';
import { AppError, ErrorCategory, createAppError } from '../entities/app-error.model';

/**
 * User Service (Domain Layer)
 * Handles business logic for user management.
 *
 * Depends on UserRepository (via USER_REPOSITORY_TOKEN) rather than the data
 * repository directly, following the Service→Repository→DAO→DB abstraction pattern.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: UserRepository
  ) {}

  /**
   * Gets paginated list of users
   */
  getUsers(params?: PaginationParams): Observable<PaginatedResponse<User>> {
    const paginationParams = params || { page: 1, pageSize: 10 };

    return this.userRepository.findPaginated(paginationParams).pipe(
      tap(() => console.log('[UserService] Users loaded successfully')),
      catchError(error => this.handleError(error, 'Failed to load users'))
    );
  }

  /**
   * Gets a single user by ID
   */
  getUser(id: string): Observable<User> {
    if (!id || id.trim().length === 0) {
      return throwError(() =>
        createAppError(
          new Error('User ID is required'),
          ErrorCategory.VALIDATION,
          'User ID is required'
        )
      );
    }

    return this.userRepository.findById(id).pipe(
      tap(user => console.log('[UserService] User loaded:', user.id)),
      catchError(error => this.handleError(error, 'Failed to load user'))
    );
  }

  /**
   * Creates a new user
   */
  createUser(userData: CreateUserDto): Observable<User> {
    // Validate user data
    const errors = UserValidator.validateCreateUser(userData);
    if (UserValidator.hasErrors(errors)) {
      const errorMessages = Object.entries(errors)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      return throwError(() =>
        createAppError(
          new Error(errorMessages),
          ErrorCategory.VALIDATION,
          'Please check your input and try again'
        )
      );
    }

    return this.userRepository.create(userData).pipe(
      tap(user => console.log('[UserService] User created:', user.id)),
      catchError(error => this.handleError(error, 'Failed to create user'))
    );
  }

  /**
   * Updates an existing user
   */
  updateUser(id: string, userData: UpdateUserDto): Observable<User> {
    if (!id || id.trim().length === 0) {
      return throwError(() =>
        createAppError(
          new Error('User ID is required'),
          ErrorCategory.VALIDATION,
          'User ID is required'
        )
      );
    }

    // Validate user data (only provided fields)
    const errors = UserValidator.validateUpdateUser(userData);
    if (UserValidator.hasErrors(errors)) {
      const errorMessages = Object.entries(errors)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      return throwError(() =>
        createAppError(
          new Error(errorMessages),
          ErrorCategory.VALIDATION,
          'Please check your input and try again'
        )
      );
    }

    return this.userRepository.update(id, userData).pipe(
      tap(user => console.log('[UserService] User updated:', user.id)),
      catchError(error => this.handleError(error, 'Failed to update user'))
    );
  }

  /**
   * Deletes a user
   */
  deleteUser(id: string): Observable<void> {
    if (!id || id.trim().length === 0) {
      return throwError(() =>
        createAppError(
          new Error('User ID is required'),
          ErrorCategory.VALIDATION,
          'User ID is required'
        )
      );
    }

    return this.userRepository.deleteById(id).pipe(
      tap(() => console.log('[UserService] User deleted:', id)),
      catchError(error => this.handleError(error, 'Failed to delete user'))
    );
  }

  /**
   * Searches users by query string
   */
  searchUsers(
    query: string,
    params?: PaginationParams
  ): Observable<PaginatedResponse<User>> {
    const paginationParams = params || { page: 1, pageSize: 10 };

    return this.userRepository.findByQuery(query, paginationParams).pipe(
      tap(() => console.log('[UserService] Search performed:', query)),
      catchError(error => this.handleError(error, 'Failed to search users'))
    );
  }

  /**
   * Handles errors and converts to AppError
   */
  private handleError(error: unknown, defaultMessage: string): Observable<never> {
    if (this.isAppError(error)) {
      return throwError(() => error);
    }

    const appError = createAppError(error, ErrorCategory.UNKNOWN, defaultMessage);
    return throwError(() => appError);
  }

  /**
   * Type guard for AppError
   */
  private isAppError(error: unknown): error is AppError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'category' in error &&
      'userMessage' in error
    );
  }
}
