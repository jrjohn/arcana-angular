import { InjectionToken } from '@angular/core';
import { UserDao } from './user.dao';

/**
 * Angular DI token for UserDao.
 * Use this token (instead of a concrete class) wherever UserDao is injected,
 * enabling easy substitution of implementations (e.g. mock, offline, remote).
 *
 * Usage in providers:
 *   { provide: USER_DAO_TOKEN, useClass: UserDaoImpl }
 *
 * Usage in consumers:
 *   constructor(@Inject(USER_DAO_TOKEN) private userDao: UserDao) {}
 */
export const USER_DAO_TOKEN = new InjectionToken<UserDao>('UserDao');
