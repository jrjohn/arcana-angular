import { UserMapper } from './user.mapper';
import { UserDto, PaginatedUserResponseDto, SingleUserResponseDto } from '../dto/user.dto';
import { User } from '../../domain/entities/user.model';

const mockUserDto: UserDto = {
  id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
};

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should map UserDto to User domain entity', () => {
      const result = UserMapper.toDomain(mockUserDto);
      expect(result.id).toBe('1');
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.avatar).toBe('https://example.com/avatar.jpg');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should convert numeric id to string', () => {
      const dto: UserDto = { ...mockUserDto, id: 42 };
      expect(UserMapper.toDomain(dto).id).toBe('42');
    });

    it('should keep string id as is', () => {
      const dto: UserDto = { ...mockUserDto, id: 'abc-123' };
      expect(UserMapper.toDomain(dto).id).toBe('abc-123');
    });

    it('should use current date when createdAt/updatedAt missing', () => {
      const dto: UserDto = { id: 5, email: 'x@y.com', first_name: 'X', last_name: 'Y' };
      const before = new Date();
      const result = UserMapper.toDomain(dto);
      const after = new Date();
      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should handle missing avatar (undefined)', () => {
      const dto: UserDto = { id: 1, email: 'a@b.com', first_name: 'A', last_name: 'B' };
      expect(UserMapper.toDomain(dto).avatar).toBeUndefined();
    });
  });

  describe('toDomainList', () => {
    it('should map an array of UserDto to User domain entities', () => {
      const dtos: UserDto[] = [
        { ...mockUserDto, id: 1 },
        { ...mockUserDto, id: 2, email: 'other@example.com' },
      ];
      const result = UserMapper.toDomainList(dtos);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[1].email).toBe('other@example.com');
    });

    it('should return empty array for empty input', () => {
      expect(UserMapper.toDomainList([])).toEqual([]);
    });
  });

  describe('toPaginatedDomain', () => {
    it('should map PaginatedUserResponseDto to PaginatedResponse<User>', () => {
      const dto: PaginatedUserResponseDto = {
        page: 2,
        per_page: 5,
        total: 20,
        total_pages: 4,
        data: [mockUserDto],
      };
      const result = UserMapper.toPaginatedDomain(dto);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(5);
      expect(result.total).toBe(20);
      expect(result.totalPages).toBe(4);
      expect(result.data.length).toBe(1);
      expect(result.data[0].firstName).toBe('John');
    });
  });

  describe('toSingleDomain', () => {
    it('should map SingleUserResponseDto to User domain entity', () => {
      const dto: SingleUserResponseDto = { data: mockUserDto };
      const result = UserMapper.toSingleDomain(dto);
      expect(result.id).toBe('1');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('toCreateDto', () => {
    it('should map User partial to CreateUserRequestDto', () => {
      const partial: Partial<User> = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        avatar: 'https://img.com/a.png',
      };
      const result = UserMapper.toCreateDto(partial);
      expect(result.email).toBe('new@example.com');
      expect(result.first_name).toBe('New');
      expect(result.last_name).toBe('User');
      expect(result.avatar).toBe('https://img.com/a.png');
    });
  });

  describe('toUpdateDto', () => {
    it('should map partial user with only updated fields', () => {
      const partial: Partial<User> = { firstName: 'Updated', email: 'upd@test.com' };
      const result = UserMapper.toUpdateDto(partial);
      expect(result.first_name).toBe('Updated');
      expect(result.email).toBe('upd@test.com');
      expect(result.last_name).toBeUndefined();
    });

    it('should return empty dto when no fields provided', () => {
      const result = UserMapper.toUpdateDto({});
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('toDto', () => {
    it('should map User domain entity to UserDto', () => {
      const result = UserMapper.toDto(mockUser);
      expect(result.id).toBe('1');
      expect(result.email).toBe('test@example.com');
      expect(result.first_name).toBe('John');
      expect(result.last_name).toBe('Doe');
      expect(result.avatar).toBe('https://example.com/avatar.jpg');
    });
  });
});
