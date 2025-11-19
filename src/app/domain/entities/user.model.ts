/**
 * User Domain Model
 * Represents a user entity in the system
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new user
 */
export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

/**
 * DTO for updating an existing user
 */
export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

/**
 * API Response format from backend
 */
export interface UserApiResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Validation errors for user fields
 */
export interface UserValidationErrors {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatar?: string | null;
}

/**
 * Maps API response to domain User model
 */
export function mapUserFromApi(apiUser: UserApiResponse): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    avatar: apiUser.avatar,
    createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : new Date(),
    updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt) : new Date(),
  };
}

/**
 * Maps domain User model to API format
 */
export function mapUserToApi(user: CreateUserDto | UpdateUserDto): Partial<UserApiResponse> {
  const apiUser: Partial<UserApiResponse> = {};

  if ('email' in user && user.email !== undefined) {
    apiUser.email = user.email;
  }
  if ('firstName' in user && user.firstName !== undefined) {
    apiUser.first_name = user.firstName;
  }
  if ('lastName' in user && user.lastName !== undefined) {
    apiUser.last_name = user.lastName;
  }
  if ('avatar' in user && user.avatar !== undefined) {
    apiUser.avatar = user.avatar;
  }

  return apiUser;
}

/**
 * User validator class
 */
export class UserValidator {
  /**
   * Validates first name
   * Returns translation keys for errors
   */
  static validateFirstName(value: string): string | null {
    if (!value || value.trim().length === 0) {
      return 'validation.first.name.required';
    }
    if (value.length < 2) {
      return 'validation.first.name.too.short';
    }
    if (value.length > 50) {
      return 'validation.first.name.too.long';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(value)) {
      return 'validation.first.name.invalid.characters';
    }
    return null;
  }

  /**
   * Validates last name
   * Returns translation keys for errors
   */
  static validateLastName(value: string): string | null {
    if (!value || value.trim().length === 0) {
      return 'validation.last.name.required';
    }
    if (value.length < 2) {
      return 'validation.last.name.too.short';
    }
    if (value.length > 50) {
      return 'validation.last.name.too.long';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(value)) {
      return 'validation.last.name.invalid.characters';
    }
    return null;
  }

  /**
   * Validates email
   * Returns translation keys for errors
   */
  static validateEmail(value: string): string | null {
    if (!value || value.trim().length === 0) {
      return 'validation.email.required';
    }
    if (value.length > 100) {
      return 'validation.email.too.long';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'validation.email.invalid';
    }
    return null;
  }

  /**
   * Validates avatar URL (optional field)
   * Returns translation keys for errors
   */
  static validateAvatar(value?: string): string | null {
    if (!value || value.trim().length === 0) {
      return null; // Avatar is optional
    }
    try {
      new URL(value);
      return null;
    } catch {
      return 'validation.avatar.invalid.url';
    }
  }

  /**
   * Checks if validation errors object has any errors
   */
  static hasErrors(errors: UserValidationErrors): boolean {
    return Object.values(errors).some(error => error !== null && error !== undefined);
  }

  /**
   * Validates all user fields for creation
   */
  static validateCreateUser(data: CreateUserDto): UserValidationErrors {
    return {
      firstName: this.validateFirstName(data.firstName),
      lastName: this.validateLastName(data.lastName),
      email: this.validateEmail(data.email),
      avatar: this.validateAvatar(data.avatar),
    };
  }

  /**
   * Validates user fields for update (only validates provided fields)
   */
  static validateUpdateUser(data: UpdateUserDto): UserValidationErrors {
    const errors: UserValidationErrors = {};

    if (data.firstName !== undefined) {
      errors.firstName = this.validateFirstName(data.firstName);
    }
    if (data.lastName !== undefined) {
      errors.lastName = this.validateLastName(data.lastName);
    }
    if (data.email !== undefined) {
      errors.email = this.validateEmail(data.email);
    }
    if (data.avatar !== undefined) {
      errors.avatar = this.validateAvatar(data.avatar);
    }

    return errors;
  }
}
