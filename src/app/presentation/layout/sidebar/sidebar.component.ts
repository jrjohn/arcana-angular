import { Component, Input, Output, EventEmitter, signal, inject, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { I18nService } from '../../../domain/services/i18n.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { SidebarViewModel } from './sidebar.view-model';

/**
 * Navigation menu item interface
 */
interface MenuItem {
  id: string; // Stable unique identifier
  icon: string;
  labelKey: string; // Translation key instead of translated label
  route?: string;
  badge?: string;
  badgeClass?: string;
  children?: MenuItem[];
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
  providers: [SidebarViewModel],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Input() mobileOpen = false;

  i18nService = inject(I18nService);
  viewModel = inject(SidebarViewModel);

  // Track expanded menu items by stable ID
  expandedMenuId = signal<string | null>(null);

  // Mock user data
  currentUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'Administrator',
    status: 'online' as 'online' | 'away' | 'busy' | 'offline',
  };

  // Static menu items with translation keys - objects never change
  menuItems: MenuItem[] = [
    {
      id: 'home',
      icon: 'bi-house-door',
      labelKey: 'nav.home',
      route: '/home',
      badge: 'New',
      badgeClass: 'bg-success',
    },
    {
      id: 'users',
      icon: 'bi-people',
      labelKey: 'nav.users',
      route: '/users',
      badgeClass: 'bg-primary',
    },
    {
      id: 'projects',
      icon: 'bi-folder',
      labelKey: 'nav.projects',
      children: [
        { id: 'projects-all', icon: 'bi-list-ul', labelKey: 'nav.projects.all', route: '/projects' },
        { id: 'projects-create', icon: 'bi-plus-circle', labelKey: 'nav.projects.create', route: '/projects/new' },
        { id: 'projects-archived', icon: 'bi-archive', labelKey: 'nav.projects.archived', route: '/projects/archived' },
      ],
    },
    {
      id: 'tasks',
      icon: 'bi-kanban',
      labelKey: 'nav.tasks',
      children: [
        { id: 'tasks-my', icon: 'bi-check2-square', labelKey: 'nav.tasks.my', route: '/tasks/my' },
        { id: 'tasks-recent', icon: 'bi-clock-history', labelKey: 'nav.tasks.recent', route: '/tasks/recent' },
        { id: 'tasks-important', icon: 'bi-star', labelKey: 'nav.tasks.important', route: '/tasks/important' },
      ],
    },
    {
      id: 'calendar',
      icon: 'bi-calendar-event',
      labelKey: 'nav.calendar',
      route: '/calendar',
    },
    {
      id: 'messages',
      icon: 'bi-chat-dots',
      labelKey: 'nav.messages',
      route: '/messages',
      badge: '5',
      badgeClass: 'bg-danger',
    },
    {
      id: 'documents',
      icon: 'bi-file-earmark-text',
      labelKey: 'nav.documents',
      route: '/documents',
    },
    {
      id: 'analytics',
      icon: 'bi-graph-up',
      labelKey: 'nav.analytics',
      children: [
        { id: 'analytics-overview', icon: 'bi-pie-chart', labelKey: 'nav.analytics.overview', route: '/analytics/overview' },
        { id: 'analytics-reports', icon: 'bi-bar-chart', labelKey: 'nav.analytics.reports', route: '/analytics/reports' },
        { id: 'analytics-performance', icon: 'bi-trophy', labelKey: 'nav.analytics.performance', route: '/analytics/performance' },
      ],
    },
    {
      id: 'settings',
      icon: 'bi-gear',
      labelKey: 'nav.settings',
      route: '/settings',
    },
  ];

  ngOnInit(): void {
    // User count is loaded automatically by ViewModel effect
  }

  getUserBadge(item: MenuItem): string | undefined {
    if (item.id === 'users') {
      // Use computed badge from ViewModel output
      return this.viewModel.output.userBadge();
    }
    return item.badge;
  }

  onMenuItemClick(item: MenuItem): void {
    if (item.children) {
      this.toggleMenuItem(item);
    }
    // For items with route, the routerLink will handle navigation
  }

  toggleMenuItem(item: MenuItem): void {
    if (item.children) {
      // Toggle: if this item is already expanded, collapse it; otherwise expand it
      const currentExpanded = this.expandedMenuId();
      if (currentExpanded === item.id) {
        this.expandedMenuId.set(null); // Collapse
      } else {
        this.expandedMenuId.set(item.id); // Expand this, collapse others
      }
    }
  }

  isMenuExpanded(item: MenuItem): boolean {
    return this.expandedMenuId() === item.id;
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
