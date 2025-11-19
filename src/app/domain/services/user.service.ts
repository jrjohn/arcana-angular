import { Injectable } from '@angular/core';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { UserRepository } from '../../data/repositories/user.repository';
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
 * Handles business logic for user management
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Gets paginated list of users
   */
  getUsers(params?: PaginationParams): Observable<PaginatedResponse<User>> {
    const paginationParams = params || { page: 1, pageSize: 10 };

    return this.userRepository.getUsers(paginationParams).pipe(
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

    return this.userRepository.getUser(id).pipe(
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

    return this.userRepository.createUser(userData).pipe(
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

    return this.userRepository.updateUser(id, userData).pipe(
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

    return this.userRepository.deleteUser(id).pipe(
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

    return this.userRepository.getUsers(paginationParams).pipe(
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
      }),
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
