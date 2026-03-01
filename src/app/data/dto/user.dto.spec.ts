import {
  UserDto,
  PaginatedUserResponseDto,
  SingleUserResponseDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserErrorResponseDto,
} from './user.dto';

describe('UserDto', () => {
  it('should create a UserDto with required fields', () => {
    const dto: UserDto = {
      id: 1,
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
    };
    expect(dto.id).toBe(1);
    expect(dto.email).toBe('test@example.com');
    expect(dto.first_name).toBe('John');
    expect(dto.last_name).toBe('Doe');
  });

  it('should allow string id', () => {
    const dto: UserDto = {
      id: 'string-id-123',
      email: 'test@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
    };
    expect(dto.id).toBe('string-id-123');
  });

  it('should allow optional avatar', () => {
    const dto: UserDto = {
      id: 2,
      email: 'a@b.com',
      first_name: 'A',
      last_name: 'B',
      avatar: 'https://img.png',
    };
    expect(dto.avatar).toBe('https://img.png');
  });

  it('should allow optional date strings', () => {
    const dto: UserDto = {
      id: 3,
      email: 'dated@test.com',
      first_name: 'Date',
      last_name: 'Test',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-06-01T00:00:00Z',
    };
    expect(dto.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(dto.updatedAt).toBe('2024-06-01T00:00:00Z');
  });
});

describe('PaginatedUserResponseDto', () => {
  it('should create a paginated response', () => {
    const dto: PaginatedUserResponseDto = {
      page: 1,
      per_page: 6,
      total: 12,
      total_pages: 2,
      data: [
        { id: 1, email: 'a@a.com', first_name: 'A', last_name: 'AA' },
        { id: 2, email: 'b@b.com', first_name: 'B', last_name: 'BB' },
      ],
    };
    expect(dto.page).toBe(1);
    expect(dto.per_page).toBe(6);
    expect(dto.total).toBe(12);
    expect(dto.total_pages).toBe(2);
    expect(dto.data.length).toBe(2);
  });

  it('should allow empty data array', () => {
    const dto: PaginatedUserResponseDto = {
      page: 1,
      per_page: 10,
      total: 0,
      total_pages: 0,
      data: [],
    };
    expect(dto.data).toEqual([]);
  });
});

describe('SingleUserResponseDto', () => {
  it('should wrap a single UserDto', () => {
    const dto: SingleUserResponseDto = {
      data: { id: 7, email: 'single@test.com', first_name: 'Single', last_name: 'User' },
    };
    expect(dto.data.id).toBe(7);
    expect(dto.data.email).toBe('single@test.com');
  });
});

describe('CreateUserRequestDto', () => {
  it('should create with required fields', () => {
    const dto: CreateUserRequestDto = {
      email: 'new@test.com',
      first_name: 'New',
      last_name: 'User',
    };
    expect(dto.email).toBe('new@test.com');
    expect(dto.first_name).toBe('New');
    expect(dto.last_name).toBe('User');
    expect(dto.avatar).toBeUndefined();
  });

  it('should allow optional avatar', () => {
    const dto: CreateUserRequestDto = {
      email: 'new@test.com',
      first_name: 'New',
      last_name: 'User',
      avatar: 'https://img.com/av.png',
    };
    expect(dto.avatar).toBe('https://img.com/av.png');
  });
});

describe('UpdateUserRequestDto', () => {
  it('should allow partial update with only email', () => {
    const dto: UpdateUserRequestDto = { email: 'updated@test.com' };
    expect(dto.email).toBe('updated@test.com');
    expect(dto.first_name).toBeUndefined();
  });

  it('should allow full update', () => {
    const dto: UpdateUserRequestDto = {
      email: 'full@test.com',
      first_name: 'Full',
      last_name: 'Update',
      avatar: 'https://img.com/full.png',
    };
    expect(dto.first_name).toBe('Full');
    expect(dto.last_name).toBe('Update');
  });

  it('should allow empty update', () => {
    const dto: UpdateUserRequestDto = {};
    expect(Object.keys(dto).length).toBe(0);
  });
});

describe('UserErrorResponseDto', () => {
  it('should allow error field', () => {
    const dto: UserErrorResponseDto = { error: 'Not found' };
    expect(dto.error).toBe('Not found');
  });

  it('should allow message field', () => {
    const dto: UserErrorResponseDto = { message: 'Validation failed' };
    expect(dto.message).toBe('Validation failed');
  });

  it('should allow both fields', () => {
    const dto: UserErrorResponseDto = { error: 'ERR001', message: 'Something went wrong' };
    expect(dto.error).toBe('ERR001');
    expect(dto.message).toBe('Something went wrong');
  });

  it('should allow empty dto', () => {
    const dto: UserErrorResponseDto = {};
    expect(dto.error).toBeUndefined();
    expect(dto.message).toBeUndefined();
  });
});
