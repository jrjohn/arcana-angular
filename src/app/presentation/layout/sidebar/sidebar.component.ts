import { Component, Input, Output, EventEmitter, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { I18nService } from '../../../domain/services/i18n.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/**
 * Navigation menu item interface
 */
interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  badge?: string;
  badgeClass?: string;
  children?: MenuItem[];
  expanded?: boolean;
  action?: 'userPanel' | 'navigate';
}

/**
 * Sidebar Component
 * Left navigation sidebar with user profile and menu items
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgbCollapseModule, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() collapsed = false;

  private i18nService = inject(I18nService);

  // Mock user data
  currentUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'Administrator',
    status: 'online' as 'online' | 'away' | 'busy' | 'offline',
  };

  // Computed menu items that update when language changes
  menuItems = computed<MenuItem[]>(() => [
    {
      icon: 'bi-house-door',
      label: this.i18nService.translate('nav.home'),
      route: '/home',
      badge: 'New',
      badgeClass: 'bg-success',
    },
    {
      icon: 'bi-people',
      label: this.i18nService.translate('nav.users'),
      route: '/users',
      badge: '12',
      badgeClass: 'bg-primary',
    },
    {
      icon: 'bi-folder',
      label: this.i18nService.translate('nav.projects'),
      children: [
        { icon: 'bi-list-ul', label: 'All Projects', route: '/projects' },
        { icon: 'bi-plus-circle', label: 'Create Project', route: '/projects/new' },
        { icon: 'bi-archive', label: 'Archived', route: '/projects/archived' },
      ],
      expanded: false,
    },
    {
      icon: 'bi-kanban',
      label: this.i18nService.translate('nav.tasks'),
      children: [
        { icon: 'bi-check2-square', label: 'My Tasks', route: '/tasks/my' },
        { icon: 'bi-clock-history', label: 'Recent', route: '/tasks/recent' },
        { icon: 'bi-star', label: 'Important', route: '/tasks/important' },
      ],
      expanded: false,
    },
    {
      icon: 'bi-calendar-event',
      label: this.i18nService.translate('nav.calendar'),
      route: '/calendar',
    },
    {
      icon: 'bi-chat-dots',
      label: this.i18nService.translate('nav.messages'),
      route: '/messages',
      badge: '5',
      badgeClass: 'bg-danger',
    },
    {
      icon: 'bi-file-earmark-text',
      label: this.i18nService.translate('nav.documents'),
      route: '/documents',
    },
    {
      icon: 'bi-graph-up',
      label: this.i18nService.translate('nav.analytics'),
      children: [
        { icon: 'bi-pie-chart', label: 'Overview', route: '/analytics/overview' },
        { icon: 'bi-bar-chart', label: 'Reports', route: '/analytics/reports' },
        { icon: 'bi-trophy', label: 'Performance', route: '/analytics/performance' },
      ],
      expanded: false,
    },
    {
      icon: 'bi-gear',
      label: this.i18nService.translate('nav.settings'),
      route: '/settings',
    },
  ]);

  onMenuItemClick(item: MenuItem): void {
    if (item.children) {
      this.toggleMenuItem(item);
    }
    // For items with route, the routerLink will handle navigation
  }

  toggleMenuItem(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
      // Close other expanded items
      this.menuItems().forEach(menuItem => {
        if (menuItem !== item && menuItem.children) {
          menuItem.expanded = false;
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      online: 'status-online',
      away: 'status-away',
      busy: 'status-busy',
      offline: 'status-offline',
    };
    return statusClasses[status] || 'status-offline';
  }
}
