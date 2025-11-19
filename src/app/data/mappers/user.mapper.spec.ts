import { UserMapper } from './user.mapper';
import { User } from '../../domain/entities/user.model';
import {
  UserDto,
  PaginatedUserResponseDto,
  SingleUserResponseDto,
  CreateUserRequestDto,
  UpdateUserRequestDto
} from '../dto/user.dto';

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should map UserDto to User with number ID', () => {
      const dto: UserDto = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'https://example.com/avatar.jpg'
      };

      const user = UserMapper.toDomain(dto);

      expect(user.id).toBe('1'); // Converted to string
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.avatar).toBe('https://example.com/avatar.jpg');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should map UserDto to User with string ID', () => {
      const dto: UserDto = {
        id: 'abc123',
        email: 'test@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        avatar: 'https://example.com/avatar2.jpg'
      };

      const user = UserMapper.toDomain(dto);

      expect(user.id).toBe('abc123');
      expect(user.firstName).toBe('Jane');
      expect(user.lastName).toBe('Smith');
    });

    it('should handle dto with createdAt and updatedAt', () => {
      const dto: UserDto = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const user = UserMapper.toDomain(dto);

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
      expect(user.updatedAt.toISOString()).toBe('2024-01-02T00:00:00.000Z');
    });

    it('should handle dto without avatar', () => {
      const dto: UserDto = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };

      const user = UserMapper.toDomain(dto);

      expect(user.avatar).toBeUndefined();
    });
  });

  describe('toDomainList', () => {
    it('should map array of UserDto to array of User', () => {
      const dtos: UserDto[] = [
        {
          id: 1,
          email: 'user1@example.com',
          first_name: 'User',
          last_name: 'One'
        },
        {
          id: 2,
          email: 'user2@example.com',
          first_name: 'User',
          last_name: 'Two'
        }
      ];

      const users = UserMapper.toDomainList(dtos);

      expect(users.length).toBe(2);
      expect(users[0].id).toBe('1');
      expect(users[0].firstName).toBe('User');
      expect(users[1].id).toBe('2');
      expect(users[1].firstName).toBe('User');
    });

    it('should handle empty array', () => {
      const users = UserMapper.toDomainList([]);

      expect(users).toEqual([]);
      expect(users.length).toBe(0);
    });
  });

  describe('toPaginatedDomain', () => {
    it('should map PaginatedUserResponseDto to PaginatedResponse', () => {
      const dto: PaginatedUserResponseDto = {
        page: 1,
        per_page: 10,
        total: 100,
        total_pages: 10,
        data: [
          {
            id: 1,
            email: 'user1@example.com',
            first_name: 'User',
            last_name: 'One'
          }
        ]
      };

      const result = UserMapper.toPaginatedDomain(dto);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10); // per_page -> pageSize
      expect(result.total).toBe(100);
      expect(result.totalPages).toBe(10); // total_pages -> totalPages
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('1');
      expect(result.data[0].firstName).toBe('User');
    });

    it('should handle empty data array', () => {
      const dto: PaginatedUserResponseDto = {
        page: 1,
        per_page: 10,
        total: 0,
        total_pages: 0,
        data: []
      };

      const result = UserMapper.toPaginatedDomain(dto);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('toSingleDomain', () => {
    it('should map SingleUserResponseDto to User', () => {
      const dto: SingleUserResponseDto = {
        data: {
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          avatar: 'https://example.com/avatar.jpg'
        }
      };

      const user = UserMapper.toSingleDomain(dto);

      expect(user.id).toBe('1');
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
    });
  });

  describe('toCreateDto', () => {
    it('should map User to CreateUserRequestDto', () => {
      const user: Partial<User> = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg'
      };

      const dto = UserMapper.toCreateDto(user);

      expect(dto.email).toBe('new@example.com');
      expect(dto.first_name).toBe('New'); // camelCase -> snake_case
      expect(dto.last_name).toBe('User'); // camelCase -> snake_case
      expect(dto.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should handle user without avatar', () => {
      const user: Partial<User> = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User'
      };

      const dto = UserMapper.toCreateDto(user);

      expect(dto.avatar).toBeUndefined();
    });
  });

  describe('toUpdateDto', () => {
    it('should map all fields when provided', () => {
      const user: Partial<User> = {
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'User',
        avatar: 'https://example.com/new-avatar.jpg'
      };

      const dto = UserMapper.toUpdateDto(user);

      expect(dto.email).toBe('updated@example.com');
      expect(dto.first_name).toBe('Updated');
      expect(dto.last_name).toBe('User');
      expect(dto.avatar).toBe('https://example.com/new-avatar.jpg');
    });

    it('should map only provided fields', () => {
      const user: Partial<User> = {
        firstName: 'Updated'
      };

      const dto = UserMapper.toUpdateDto(user);

      expect(dto.first_name).toBe('Updated');
      expect(dto.email).toBeUndefined();
      expect(dto.last_name).toBeUndefined();
      expect(dto.avatar).toBeUndefined();
    });

    it('should map email only', () => {
      const user: Partial<User> = {
        email: 'updated@example.com'
      };

      const dto = UserMapper.toUpdateDto(user);

      expect(dto.email).toBe('updated@example.com');
      expect(dto.first_name).toBeUndefined();
    });

    it('should handle empty user object', () => {
      const user: Partial<User> = {};

      const dto = UserMapper.toUpdateDto(user);

      expect(dto).toEqual({});
    });

    it('should include field even when value is empty string', () => {
      const user: Partial<User> = {
        firstName: '',
        avatar: ''
      };

      const dto = UserMapper.toUpdateDto(user);

      expect(dto.first_name).toBe('');
      expect(dto.avatar).toBe('');
    });
  });

  describe('toDto', () => {
    it('should map User to UserDto', () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
      };

      const dto = UserMapper.toDto(user);

      expect(dto.id).toBe('123');
      expect(dto.email).toBe('test@example.com');
      expect(dto.first_name).toBe('John'); // camelCase -> snake_case
      expect(dto.last_name).toBe('Doe'); // camelCase -> snake_case
      expect(dto.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should handle user without avatar', () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dto = UserMapper.toDto(user);

      expect(dto.avatar).toBeUndefined();
    });
  });

  describe('snake_case to camelCase conversion', () => {
    it('should consistently convert snake_case to camelCase', () => {
      const dto: UserDto = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      };

      const user = UserMapper.toDomain(dto);

      expect(user.firstName).toBe('Test');
      expect(user.lastName).toBe('User');
      expect('first_name' in (user as any)).toBe(false);
      expect('last_name' in (user as any)).toBe(false);
    });

    it('should consistently convert camelCase to snake_case', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dto = UserMapper.toDto(user);

      expect(dto.first_name).toBe('Test');
      expect(dto.last_name).toBe('User');
      expect('firstName' in dto).toBe(false);
      expect('lastName' in dto).toBe(false);
    });
  });
});
