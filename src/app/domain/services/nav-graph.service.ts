import { Injectable, inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { User } from '../entities/user.model';

/**
 * NavGraph Service
 * Centralized navigation service that handles all routing in the application
 * Provides type-safe navigation methods and encapsulates routing logic
 *
 * Benefits:
 * - Single source of truth for all routes
 * - Type-safe navigation with compile-time checks
 * - Easy to test navigation logic
 * - Consistent navigation behavior across the app
 * - Easy to add analytics/logging for navigation events
 */
@Injectable({
  providedIn: 'root'
})
export class NavGraphService {
  private router = inject(Router);

  /**
   * Navigation to Home/Dashboard
   */
  toHome(extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(['/home'], extras);
  }

  /**
   * User-related navigation
   */
  readonly users = {
    /**
     * Navigate to user list
     */
    toList: (extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/users'], extras);
    },

    /**
     * Navigate to user detail
     */
    toDetail: (userId: string, extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/users', userId], extras);
    },

    /**
     * Navigate to user detail (from User object)
     */
    toUserDetail: (user: User, extras?: NavigationExtras): Promise<boolean> => {
      return this.users.toDetail(user.id, extras);
    },

    /**
     * Navigate to create new user
     */
    toCreate: (extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/users', 'new'], extras);
    },

    /**
     * Navigate to edit user
     */
    toEdit: (userId: string, extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/users', userId, 'edit'], extras);
    },

    /**
     * Navigate to edit user (from User object)
     */
    toUserEdit: (user: User, extras?: NavigationExtras): Promise<boolean> => {
      return this.users.toEdit(user.id, extras);
    }
  };

  /**
   * Calendar navigation
   */
  toCalendar(extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(['/calendar'], extras);
  }

  /**
   * Messages navigation
   */
  toMessages(extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(['/messages'], extras);
  }

  /**
   * Documents navigation
   */
  toDocuments(extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(['/documents'], extras);
  }

  /**
   * Profile navigation
   */
  toProfile(extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(['/profile'], extras);
  }

  /**
   * Settings navigation
   */
  toSettings(extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(['/settings'], extras);
  }

  /**
   * Notifications navigation
   */
  toNotifications(extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(['/notifications'], extras);
  }

  /**
   * Help navigation
   */
  toHelp(extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(['/help'], extras);
  }

  /**
   * Projects navigation
   */
  readonly projects = {
    toList: (extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/projects'], extras);
    },

    toCreate: (extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/projects', 'new'], extras);
    },

    toArchived: (extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/projects', 'archived'], extras);
    }
  };

  /**
   * Tasks navigation
   */
  readonly tasks = {
    toMy: (extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/tasks', 'my'], extras);
    },

    toRecent: (extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/tasks', 'recent'], extras);
    },

    toImportant: (extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/tasks', 'important'], extras);
    }
  };

  /**
   * Analytics navigation
   */
  readonly analytics = {
    toOverview: (extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/analytics', 'overview'], extras);
    },

    toReports: (extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/analytics', 'reports'], extras);
    },

    toPerformance: (extras?: NavigationExtras): Promise<boolean> => {
      return this.router.navigate(['/analytics', 'performance'], extras);
    }
  };

  /**
   * Navigate back to previous page
   */
  back(): void {
    window.history.back();
  }

  /**
   * Navigate to a custom path
   * Use this for dynamic routes or routes not defined above
   */
  toPath(path: string | any[], extras?: NavigationExtras): Promise<boolean> {
    const commands = Array.isArray(path) ? path : [path];
    return this.router.navigate(commands, extras);
  }

  /**
   * Get current route URL
   */
  getCurrentUrl(): string {
    return this.router.url;
  }

  /**
   * Check if currently on a specific route
   */
  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
