import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * Activity item interface
 */
interface Activity {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  icon: string;
  title: string;
  description: string;
  time: string;
}

/**
 * Notification interface
 */
interface Notification {
  id: string;
  type: 'message' | 'alert' | 'update';
  icon: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
}

/**
 * Right Panel Component
 * Side panel for activities, notifications, and settings
 */
@Component({
  selector: 'app-right-panel',
  standalone: true,
  imports: [CommonModule, NgbNavModule],
  templateUrl: './right-panel.component.html',
  styleUrl: './right-panel.component.scss',
})
export class RightPanelComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  activeTab = signal(1);

  activities = signal<Activity[]>([
    {
      id: '1',
      type: 'success',
      icon: 'bi-check-circle',
      title: 'User Created',
      description: 'New user "Jane Smith" was created successfully',
      time: '2 min ago',
    },
    {
      id: '2',
      type: 'info',
      icon: 'bi-pencil',
      title: 'Profile Updated',
      description: 'John Doe updated his profile information',
      time: '15 min ago',
    },
    {
      id: '3',
      type: 'warning',
      icon: 'bi-exclamation-triangle',
      title: 'Storage Warning',
      description: 'You are using 85% of your storage quota',
      time: '1 hour ago',
    },
    {
      id: '4',
      type: 'danger',
      icon: 'bi-x-circle',
      title: 'Failed Login Attempt',
      description: 'Failed login attempt from unknown IP address',
      time: '2 hours ago',
    },
    {
      id: '5',
      type: 'success',
      icon: 'bi-file-earmark-check',
      title: 'Document Uploaded',
      description: 'Annual report 2024.pdf was uploaded',
      time: '3 hours ago',
    },
  ]);

  notifications = signal<Notification[]>([
    {
      id: '1',
      type: 'message',
      icon: 'bi-chat-dots',
      title: 'New Message',
      message: 'You have a new message from Sarah Wilson',
      time: '5 min ago',
      read: false,
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
      id: '2',
      type: 'alert',
      icon: 'bi-bell',
      title: 'System Alert',
      message: 'Scheduled maintenance in 2 hours',
      time: '30 min ago',
      read: false,
    },
    {
      id: '3',
      type: 'update',
      icon: 'bi-arrow-up-circle',
      title: 'Update Available',
      message: 'A new version is available for download',
      time: '1 hour ago',
      read: true,
    },
    {
      id: '4',
      type: 'message',
      icon: 'bi-chat-dots',
      title: 'Team Mention',
      message: '@you were mentioned in Project Alpha',
      time: '2 hours ago',
      read: true,
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
  ]);

  onClose(): void {
    this.close.emit();
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  markAllAsRead(): void {
    this.notifications().forEach(n => (n.read = true));
  }

  clearActivities(): void {
    this.activities.set([]);
  }

  getActivityTypeClass(type: string): string {
    const typeClasses: Record<string, string> = {
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
    };
    return typeClasses[type] || 'text-secondary';
  }

  getUnreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }
}
