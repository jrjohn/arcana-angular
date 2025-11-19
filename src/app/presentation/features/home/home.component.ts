import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * Stat card interface
 */
interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: string;
  iconClass: string;
}

/**
 * Quick action interface
 */
interface QuickAction {
  icon: string;
  title: string;
  description: string;
  route: string;
  color: string;
}

/**
 * Home Component
 * Dashboard landing page with stats and quick actions
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbProgressbarModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  stats = signal<StatCard[]>([
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12.5%',
      changeType: 'increase',
      icon: 'bi-people',
      iconClass: 'bg-primary',
    },
    {
      title: 'Active Projects',
      value: '42',
      change: '+8.2%',
      changeType: 'increase',
      icon: 'bi-folder',
      iconClass: 'bg-success',
    },
    {
      title: 'Pending Tasks',
      value: '18',
      change: '-5.4%',
      changeType: 'decrease',
      icon: 'bi-list-check',
      iconClass: 'bg-warning',
    },
    {
      title: 'Messages',
      value: '89',
      change: '+23.1%',
      changeType: 'increase',
      icon: 'bi-chat-dots',
      iconClass: 'bg-info',
    },
  ]);

  quickActions = signal<QuickAction[]>([
    {
      icon: 'bi-person-plus',
      title: 'Create User',
      description: 'Add a new user to the system',
      route: '/users/new',
      color: 'primary',
    },
    {
      icon: 'bi-folder-plus',
      title: 'New Project',
      description: 'Start a new project',
      route: '/projects/new',
      color: 'success',
    },
    {
      icon: 'bi-file-earmark-text',
      title: 'View Documents',
      description: 'Browse your documents',
      route: '/documents',
      color: 'info',
    },
    {
      icon: 'bi-graph-up',
      title: 'View Analytics',
      description: 'Check performance metrics',
      route: '/analytics',
      color: 'warning',
    },
  ]);

  recentActivities = signal([
    {
      id: 1,
      user: 'John Doe',
      action: 'created a new user',
      target: 'Jane Smith',
      time: '5 minutes ago',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    {
      id: 2,
      user: 'Sarah Wilson',
      action: 'updated project',
      target: 'Website Redesign',
      time: '15 minutes ago',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'completed task',
      target: 'API Integration',
      time: '1 hour ago',
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
    {
      id: 4,
      user: 'Emily Brown',
      action: 'uploaded document',
      target: 'Q4 Report.pdf',
      time: '2 hours ago',
      avatar: 'https://i.pravatar.cc/150?img=10',
    },
  ]);
}
