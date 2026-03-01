import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserApiResponse,
  UserValidator,
  mapUserFromApi,
  mapUserToApi,
} from './user.model';

describe('User model', () => {
  it('should create user with required fields', () => {
    const user: User = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(user.id).toBe('1');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.email).toBe('john@test.com');
  });

  it('should have optional avatar', () => {
    const user: User = {
      id: '1',
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      avatar: 'http://img.png',
    };
    expect(user.avatar).toBe('http://img.png');
  });

  it('should allow undefined avatar', () => {
    const user: User = {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(user.avatar).toBeUndefined();
  });

  it('should store date objects for createdAt and updatedAt', () => {
    const created = new Date('2024-01-01');
    const updated = new Date('2024-06-01');
    const user: User = {
      id: '3',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      createdAt: created,
      updatedAt: updated,
    };
    expect(user.createdAt).toEqual(created);
    expect(user.updatedAt).toEqual(updated);
  });
});

describe('CreateUserDto', () => {
  it('should create dto with required fields', () => {
    const dto: CreateUserDto = {
      email: 'new@test.com',
      firstName: 'New',
      lastName: 'User',
    };
    expect(dto.email).toBe('new@test.com');
    expect(dto.firstName).toBe('New');
    expect(dto.lastName).toBe('User');
    expect(dto.avatar).toBeUndefined();
  });

  it('should accept optional avatar', () => {
    const dto: CreateUserDto = {
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'Person',
      avatar: 'https://example.com/avatar.jpg',
    };
    expect(dto.avatar).toBe('https://example.com/avatar.jpg');
  });
});

describe('mapUserFromApi', () => {
  it('should map api response to user domain model', () => {
    const apiResponse: UserApiResponse = {
      id: '42',
      email: 'api@test.com',
      first_name: 'Api',
      last_name: 'User',
      avatar: 'https://avatar.com/img.png',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-06-01T00:00:00Z',
    };
    const user = mapUserFromApi(apiResponse);
    expect(user.id).toBe('42');
    expect(user.email).toBe('api@test.com');
    expect(user.firstName).toBe('Api');
    expect(user.lastName).toBe('User');
    expect(user.avatar).toBe('https://avatar.com/img.png');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should use current date when createdAt/updatedAt are missing', () => {
    const before = new Date();
    const apiResponse: UserApiResponse = {
      id: '1',
      email: 'test@test.com',
      first_name: 'Test',
      last_name: 'User',
    };
    const user = mapUserFromApi(apiResponse);
    const after = new Date();
    expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

describe('mapUserToApi', () => {
  it('should map create dto to api format', () => {
    const dto: CreateUserDto = {
      email: 'new@test.com',
      firstName: 'New',
      lastName: 'User',
    };
    const result = mapUserToApi(dto);
    expect(result.email).toBe('new@test.com');
    expect(result.first_name).toBe('New');
    expect(result.last_name).toBe('User');
  });

  it('should map update dto to api format', () => {
    const dto: UpdateUserDto = {
      firstName: 'Updated',
    };
    const result = mapUserToApi(dto);
    expect(result.first_name).toBe('Updated');
    expect(result.last_name).toBeUndefined();
  });
});

describe('UserValidator', () => {
  describe('validateFirstName', () => {
    it('should return null for valid first name', () => {
      expect(UserValidator.validateFirstName('John')).toBeNull();
    });

    it('should return error for empty first name', () => {
      expect(UserValidator.validateFirstName('')).toBe('validation.first.name.required');
    });

    it('should return error for whitespace-only first name', () => {
      expect(UserValidator.validateFirstName('   ')).toBe('validation.first.name.required');
    });

    it('should return error for first name that is too short', () => {
      expect(UserValidator.validateFirstName('A')).toBe('validation.first.name.too.short');
    });

    it('should return error for first name that is too long', () => {
      expect(UserValidator.validateFirstName('A'.repeat(51))).toBe('validation.first.name.too.long');
    });

    it('should return error for first name with invalid characters', () => {
      expect(UserValidator.validateFirstName('J0hn')).toBe('validation.first.name.invalid.characters');
    });

    it('should accept names with hyphens and apostrophes', () => {
      expect(UserValidator.validateFirstName("O'Brien")).toBeNull();
      expect(UserValidator.validateFirstName('Mary-Jane')).toBeNull();
    });
  });

  describe('validateLastName', () => {
    it('should return null for valid last name', () => {
      expect(UserValidator.validateLastName('Smith')).toBeNull();
    });

    it('should return error for empty last name', () => {
      expect(UserValidator.validateLastName('')).toBe('validation.last.name.required');
    });

    it('should return error for last name that is too short', () => {
      expect(UserValidator.validateLastName('X')).toBe('validation.last.name.too.short');
    });

    it('should return error for last name that is too long', () => {
      expect(UserValidator.validateLastName('Z'.repeat(51))).toBe('validation.last.name.too.long');
    });
  });

  describe('validateEmail', () => {
    it('should return null for valid email', () => {
      expect(UserValidator.validateEmail('user@example.com')).toBeNull();
    });

    it('should return error for empty email', () => {
      expect(UserValidator.validateEmail('')).toBe('validation.email.required');
    });

    it('should return error for invalid email format', () => {
      expect(UserValidator.validateEmail('not-an-email')).toBe('validation.email.invalid');
    });

    it('should return error for email that is too long', () => {
      expect(UserValidator.validateEmail('a'.repeat(95) + '@b.com')).toBe('validation.email.too.long');
    });
  });

  describe('validateAvatar', () => {
    it('should return null for valid URL', () => {
      expect(UserValidator.validateAvatar('https://example.com/img.png')).toBeNull();
    });

    it('should return null when avatar is undefined (optional)', () => {
      expect(UserValidator.validateAvatar(undefined)).toBeNull();
    });

    it('should return null for empty avatar string (optional)', () => {
      expect(UserValidator.validateAvatar('')).toBeNull();
    });

    it('should return error for invalid URL', () => {
      expect(UserValidator.validateAvatar('not-a-url')).toBe('validation.avatar.invalid.url');
    });
  });

  describe('hasErrors', () => {
    it('should return false when no errors', () => {
      expect(UserValidator.hasErrors({ firstName: null, lastName: null, email: null })).toBeFalse();
    });

    it('should return true when any error exists', () => {
      expect(UserValidator.hasErrors({ firstName: 'validation.first.name.required' })).toBeTrue();
    });
  });

  describe('validateCreateUser', () => {
    it('should return no errors for valid create dto', () => {
      const errors = UserValidator.validateCreateUser({
        email: 'valid@test.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(UserValidator.hasErrors(errors)).toBeFalse();
    });

    it('should return errors for invalid create dto', () => {
      const errors = UserValidator.validateCreateUser({
        email: 'not-valid',
        firstName: '',
        lastName: '',
      });
      expect(UserValidator.hasErrors(errors)).toBeTrue();
      expect(errors.email).toBe('validation.email.invalid');
      expect(errors.firstName).toBe('validation.first.name.required');
    });
  });

  describe('validateUpdateUser', () => {
    it('should only validate provided fields', () => {
      const errors = UserValidator.validateUpdateUser({ firstName: 'Jane' });
      expect(errors.firstName).toBeNull();
      expect(errors.lastName).toBeUndefined();
      expect(errors.email).toBeUndefined();
    });

    it('should return error for invalid update field', () => {
      const errors = UserValidator.validateUpdateUser({ email: 'bad-email' });
      expect(errors.email).toBe('validation.email.invalid');
    });
  });
});
