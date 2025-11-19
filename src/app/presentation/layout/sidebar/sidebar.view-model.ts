import { Injectable, signal } from '@angular/core';
import { UserService } from '../../../domain/services/user.service';

/**
 * Sidebar ViewModel
 * Handles business logic for sidebar component
 */
@Injectable()
export class SidebarViewModel {
  // Track total user count
  userCount = signal<number>(0);

  constructor(private userService: UserService) {}

  /**
   * Load user count from service
   */
  loadUserCount(): void {
    this.userService.getUsers({ page: 1, pageSize: 1 }).subscribe({
      next: response => {
        this.userCount.set(response.total);
      },
      error: () => {
        // Silently fail - user count is not critical
        this.userCount.set(0);
      },
    });
  }

  /**
   * Get user count value
   */
  getUserCount(): number {
    return this.userCount();
  }
}
