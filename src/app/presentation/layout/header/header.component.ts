import { Component, Output, EventEmitter, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { I18nService, type Language as I18nLanguage } from '../../../domain/services/i18n.service';

/**
 * Language option interface
 */
interface Language {
  code: string;
  name: string;
  flag: string;
}

/**
 * User menu action interface
 */
interface UserMenuAction {
  icon: string;
  label: string;
  action: string;
  divider?: boolean;
}

/**
 * Header Component
 * Top navigation bar with branding, search, language selector, and user menu
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbDropdownModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() rightPanelToggle = new EventEmitter<void>();

  private router = inject(Router);
  private i18nService = inject(I18nService);

  // Get current language from I18nService
  currentLanguage = computed(() => {
    const config = this.i18nService.currentLanguageConfig();
    return {
      code: config.code,
      name: config.nativeName,
      flag: config.flag,
    };
  });

  // Get languages from I18nService
  languages: Language[] = this.i18nService.languages.map(lang => ({
    code: lang.code,
    name: lang.nativeName,
    flag: lang.flag,
  }));

  userMenuActions: UserMenuAction[] = [
    { icon: 'bi-person', label: 'My Profile', action: 'profile' },
    { icon: 'bi-gear', label: 'Settings', action: 'settings' },
    { icon: 'bi-bell', label: 'Notifications', action: 'notifications' },
    { icon: 'bi-question-circle', label: 'Help', action: 'help' },
    { icon: 'bi-box-arrow-right', label: 'Logout', action: 'logout', divider: true },
  ];

  // Mock user data
  currentUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'Administrator',
  };

  onSidebarToggle(): void {
    this.sidebarToggle.emit();
  }

  onRightPanelToggle(): void {
    this.rightPanelToggle.emit();
  }

  changeLanguage(language: Language): void {
    // Update the I18nService with the new language
    this.i18nService.setLanguage(language.code as I18nLanguage);
    console.log('Language changed to:', language.code);
  }

  onUserMenuAction(action: string): void {
    switch (action) {
      case 'profile':
        this.router.navigate(['/profile']);
        break;
      case 'settings':
        this.router.navigate(['/settings']);
        break;
      case 'notifications':
        this.router.navigate(['/notifications']);
        break;
      case 'help':
        this.router.navigate(['/help']);
        break;
      case 'logout':
        this.handleLogout();
        break;
    }
  }

  private handleLogout(): void {
    console.log('Logging out...');
    // Here you would integrate with auth service
    // For now, just navigate to login or home
    this.router.navigate(['/']);
  }
}
