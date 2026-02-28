import { InjectionToken } from '@angular/core';
import { IUserDao } from './interfaces/user.dao';

/**
 * Angular DI token for IUserDao.
 *
 * Usage in providers:
 *   { provide: USER_DAO_TOKEN, useClass: UserDaoImpl }
 *
 * Usage in consumers (inject function):
 *   private readonly userDao = inject(USER_DAO_TOKEN);
 */
export const USER_DAO_TOKEN = new InjectionToken<IUserDao>('UserDao');

// ── Public API ───────────────────────────────────────────────────────────────
export * from './interfaces/user.dao';
export * from './impl/user.dao.impl';
