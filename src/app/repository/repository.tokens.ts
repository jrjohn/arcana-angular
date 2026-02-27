import { InjectionToken } from '@angular/core';
import { UserRepository } from './user.repository';

/**
 * Angular DI token for UserRepository.
 * Use this token (instead of a concrete class) wherever UserRepository is injected,
 * enabling easy substitution of implementations (e.g. mock, offline, remote).
 *
 * Usage in providers:
 *   { provide: USER_REPOSITORY_TOKEN, useClass: UserRepositoryImpl }
 *
 * Usage in consumers:
 *   constructor(@Inject(USER_REPOSITORY_TOKEN) private userRepository: UserRepository) {}
 */
export const USER_REPOSITORY_TOKEN = new InjectionToken<UserRepository>('UserRepository');
