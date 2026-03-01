import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { UserService } from './user.service';
import { USER_REPOSITORY_TOKEN } from '../../repository/repository.tokens';
import { UserRepository } from '../../repository/user.repository';
import { User, CreateUserDto, UpdateUserDto } from '../entities/user.model';
import { PaginatedResponse, PaginationParams } from '../entities/pagination.model';
import { AppError, ErrorCategory } from '../entities/app-error.model';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

const makePaginatedResponse = <T>(data: T[]): PaginatedResponse<T> => ({
  data,
  page: 1,
  pageSize: 10,
  total: data.length,
  totalPages: 1,
});

describe('UserService', () => {
  let service: UserService;
  let mockRepo: jasmine.SpyObj<UserRepository>;

  beforeEach(() => {
    const repoSpy = jasmine.createSpyObj<UserRepository>('UserRepository', [
      'findPaginated',
      'findById',
      'findAll',
      'findByQuery',
      'findByEmail',
      'create',
      'update',
      'deleteById',
      'save',
      'count',
    ]);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: USER_REPOSITORY_TOKEN, useValue: repoSpy },
      ],
    });

    service = TestBed.inject(UserService);
    mockRepo = TestBed.inject(USER_REPOSITORY_TOKEN) as jasmine.SpyObj<UserRepository>;
  });

  // ── getUsers ───────────────────────────────────────────────────────────────

  describe('getUsers()', () => {
    it('should return paginated users with default params when none provided', (done) => {
      const users = [makeUser()];
      const response = makePaginatedResponse(users);
      mockRepo.findPaginated.and.returnValue(of(response));

      service.getUsers().subscribe((result) => {
        expect(result.data.length).toBe(1);
        expect(result.data[0].email).toBe('john@example.com');
        expect(mockRepo.findPaginated).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
        done();
      });
    });

    it('should pass custom pagination params to the repository', (done) => {
      const params: PaginationParams = { page: 3, pageSize: 25 };
      const response = makePaginatedResponse([makeUser(), makeUser({ id: '2' })]);
      mockRepo.findPaginated.and.returnValue(of(response));

      service.getUsers(params).subscribe((result) => {
        expect(result.data.length).toBe(2);
        expect(mockRepo.findPaginated).toHaveBeenCalledWith(params);
        done();
      });
    });

    it('should propagate repository errors wrapped as AppError', (done) => {
      const rawError = new Error('Network failure');
      mockRepo.findPaginated.and.returnValue(throwError(() => rawError));

      service.getUsers().subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.UNKNOWN);
          expect(err.userMessage).toBe('Failed to load users');
          done();
        },
      });
    });

    it('should re-throw existing AppErrors unchanged', (done) => {
      const appError: AppError = {
        code: ErrorCategory.NETWORK,
        message: 'Timeout',
        category: ErrorCategory.NETWORK,
        userMessage: 'Connection timed out',
        timestamp: new Date(),
      };
      mockRepo.findPaginated.and.returnValue(throwError(() => appError));

      service.getUsers().subscribe({
        error: (err: AppError) => {
          expect(err).toBe(appError);
          done();
        },
      });
    });
  });

  // ── getUser ────────────────────────────────────────────────────────────────

  describe('getUser()', () => {
    it('should return a user for a valid id', (done) => {
      const user = makeUser();
      mockRepo.findById.and.returnValue(of(user));

      service.getUser('1').subscribe((result) => {
        expect(result.id).toBe('1');
        expect(mockRepo.findById).toHaveBeenCalledWith('1');
        done();
      });
    });

    it('should throw a VALIDATION AppError when id is empty string', (done) => {
      service.getUser('').subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          expect(err.userMessage).toBe('User ID is required');
          expect(mockRepo.findById).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should throw a VALIDATION AppError when id is whitespace only', (done) => {
      service.getUser('   ').subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          done();
        },
      });
    });

    it('should propagate repository errors as AppError', (done) => {
      mockRepo.findById.and.returnValue(throwError(() => new Error('Not found')));

      service.getUser('999').subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.UNKNOWN);
          expect(err.userMessage).toBe('Failed to load user');
          done();
        },
      });
    });
  });

  // ── createUser ─────────────────────────────────────────────────────────────

  describe('createUser()', () => {
    const validDto: CreateUserDto = {
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should create a user with valid data', (done) => {
      const created = makeUser({ id: '2', email: validDto.email });
      mockRepo.create.and.returnValue(of(created));

      service.createUser(validDto).subscribe((result) => {
        expect(result.id).toBe('2');
        expect(mockRepo.create).toHaveBeenCalledWith(validDto);
        done();
      });
    });

    it('should throw VALIDATION AppError when firstName is empty', (done) => {
      service.createUser({ ...validDto, firstName: '' }).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          expect(mockRepo.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should throw VALIDATION AppError when lastName is empty', (done) => {
      service.createUser({ ...validDto, lastName: '' }).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          expect(mockRepo.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should throw VALIDATION AppError when email is invalid', (done) => {
      service.createUser({ ...validDto, email: 'not-an-email' }).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          expect(mockRepo.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should throw VALIDATION AppError when email is empty', (done) => {
      service.createUser({ ...validDto, email: '' }).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          done();
        },
      });
    });

    it('should throw VALIDATION AppError when firstName is too short', (done) => {
      service.createUser({ ...validDto, firstName: 'A' }).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          done();
        },
      });
    });

    it('should throw VALIDATION AppError when firstName has invalid characters', (done) => {
      service.createUser({ ...validDto, firstName: 'John123' }).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          done();
        },
      });
    });

    it('should accept a valid avatar URL', (done) => {
      const created = makeUser({ avatar: 'https://example.com/avatar.png' });
      mockRepo.create.and.returnValue(of(created));

      service.createUser({ ...validDto, avatar: 'https://example.com/avatar.png' }).subscribe((result) => {
        expect(result.avatar).toBe('https://example.com/avatar.png');
        done();
      });
    });

    it('should throw VALIDATION AppError when avatar URL is invalid', (done) => {
      service.createUser({ ...validDto, avatar: 'not-a-url' }).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          done();
        },
      });
    });

    it('should propagate repository errors as AppError', (done) => {
      mockRepo.create.and.returnValue(throwError(() => new Error('DB error')));

      service.createUser(validDto).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.UNKNOWN);
          expect(err.userMessage).toBe('Failed to create user');
          done();
        },
      });
    });
  });

  // ── updateUser ─────────────────────────────────────────────────────────────

  describe('updateUser()', () => {
    const validUpdate: UpdateUserDto = { firstName: 'Jonathan', email: 'jonathan@example.com' };

    it('should update a user with valid data', (done) => {
      const updated = makeUser({ firstName: 'Jonathan' });
      mockRepo.update.and.returnValue(of(updated));

      service.updateUser('1', validUpdate).subscribe((result) => {
        expect(result.firstName).toBe('Jonathan');
        expect(mockRepo.update).toHaveBeenCalledWith('1', validUpdate);
        done();
      });
    });

    it('should throw VALIDATION AppError when id is empty', (done) => {
      service.updateUser('', validUpdate).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          expect(mockRepo.update).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should throw VALIDATION AppError when id is whitespace', (done) => {
      service.updateUser('  ', validUpdate).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          done();
        },
      });
    });

    it('should throw VALIDATION AppError when provided email is invalid', (done) => {
      service.updateUser('1', { email: 'bad-email' }).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          expect(mockRepo.update).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should throw VALIDATION AppError when provided firstName is too short', (done) => {
      service.updateUser('1', { firstName: 'X' }).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          done();
        },
      });
    });

    it('should allow partial update (only lastName provided)', (done) => {
      const updated = makeUser({ lastName: 'Brown' });
      mockRepo.update.and.returnValue(of(updated));

      service.updateUser('1', { lastName: 'Brown' }).subscribe((result) => {
        expect(result.lastName).toBe('Brown');
        done();
      });
    });

    it('should propagate repository errors as AppError', (done) => {
      mockRepo.update.and.returnValue(throwError(() => new Error('Update failed')));

      service.updateUser('1', validUpdate).subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.UNKNOWN);
          expect(err.userMessage).toBe('Failed to update user');
          done();
        },
      });
    });

    it('should re-throw existing AppErrors unchanged on update', (done) => {
      const appError: AppError = {
        code: ErrorCategory.AUTHORIZATION,
        message: 'Forbidden',
        category: ErrorCategory.AUTHORIZATION,
        userMessage: 'You are not allowed to do this',
        timestamp: new Date(),
      };
      mockRepo.update.and.returnValue(throwError(() => appError));

      service.updateUser('1', validUpdate).subscribe({
        error: (err: AppError) => {
          expect(err).toBe(appError);
          done();
        },
      });
    });
  });

  // ── deleteUser ─────────────────────────────────────────────────────────────

  describe('deleteUser()', () => {
    it('should delete a user with a valid id', (done) => {
      mockRepo.deleteById.and.returnValue(of(void 0));

      service.deleteUser('1').subscribe({
        complete: () => {
          expect(mockRepo.deleteById).toHaveBeenCalledWith('1');
          done();
        },
      });
    });

    it('should throw VALIDATION AppError when id is empty', (done) => {
      service.deleteUser('').subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          expect(err.userMessage).toBe('User ID is required');
          expect(mockRepo.deleteById).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should throw VALIDATION AppError when id is whitespace', (done) => {
      service.deleteUser('   ').subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.VALIDATION);
          done();
        },
      });
    });

    it('should propagate repository errors as AppError', (done) => {
      mockRepo.deleteById.and.returnValue(throwError(() => new Error('Delete failed')));

      service.deleteUser('1').subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.UNKNOWN);
          expect(err.userMessage).toBe('Failed to delete user');
          done();
        },
      });
    });
  });

  // ── searchUsers ────────────────────────────────────────────────────────────

  describe('searchUsers()', () => {
    it('should search users with a query and default pagination', (done) => {
      const users = [makeUser(), makeUser({ id: '2', firstName: 'Johnny' })];
      const response = makePaginatedResponse(users);
      mockRepo.findByQuery.and.returnValue(of(response));

      service.searchUsers('John').subscribe((result) => {
        expect(result.data.length).toBe(2);
        expect(mockRepo.findByQuery).toHaveBeenCalledWith('John', { page: 1, pageSize: 10 });
        done();
      });
    });

    it('should pass custom pagination params when searching', (done) => {
      const params: PaginationParams = { page: 2, pageSize: 5 };
      mockRepo.findByQuery.and.returnValue(of(makePaginatedResponse([])));

      service.searchUsers('test', params).subscribe((result) => {
        expect(result.total).toBe(0);
        expect(mockRepo.findByQuery).toHaveBeenCalledWith('test', params);
        done();
      });
    });

    it('should propagate repository errors as AppError on search', (done) => {
      mockRepo.findByQuery.and.returnValue(throwError(() => new Error('Search failed')));

      service.searchUsers('test').subscribe({
        error: (err: AppError) => {
          expect(err.category).toBe(ErrorCategory.UNKNOWN);
          expect(err.userMessage).toBe('Failed to search users');
          done();
        },
      });
    });

    it('should search with an empty query string', (done) => {
      const response = makePaginatedResponse([makeUser()]);
      mockRepo.findByQuery.and.returnValue(of(response));

      service.searchUsers('').subscribe((result) => {
        expect(result.data.length).toBe(1);
        expect(mockRepo.findByQuery).toHaveBeenCalledWith('', { page: 1, pageSize: 10 });
        done();
      });
    });
  });

  // ── isAppError guard ───────────────────────────────────────────────────────

  describe('AppError passthrough (isAppError guard)', () => {
    it('should pass an AppError unchanged through getUser error path', (done) => {
      const appError: AppError = {
        code: ErrorCategory.NOT_FOUND,
        message: 'Resource not found',
        category: ErrorCategory.NOT_FOUND,
        userMessage: 'The user could not be found',
        timestamp: new Date(),
      };
      mockRepo.findById.and.returnValue(throwError(() => appError));

      service.getUser('42').subscribe({
        error: (err: AppError) => {
          expect(err).toBe(appError);
          expect(err.category).toBe(ErrorCategory.NOT_FOUND);
          done();
        },
      });
    });

    it('should pass an AppError unchanged through deleteUser error path', (done) => {
      const appError: AppError = {
        code: ErrorCategory.AUTHORIZATION,
        message: 'Forbidden',
        category: ErrorCategory.AUTHORIZATION,
        userMessage: 'Not allowed',
        timestamp: new Date(),
      };
      mockRepo.deleteById.and.returnValue(throwError(() => appError));

      service.deleteUser('1').subscribe({
        error: (err: AppError) => {
          expect(err).toBe(appError);
          done();
        },
      });
    });
  });
});
