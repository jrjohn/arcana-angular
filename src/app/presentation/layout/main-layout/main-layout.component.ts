import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RightPanelComponent } from '../right-panel/right-panel.component';

/**
 * Main Layout Component
 * Provides the application shell with header, sidebar, and content area
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    RightPanelComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
  sidebarMobileOpen = signal(false);
  rightPanelOpen = signal(false);

  toggleSidebar(): void {
    // Check if mobile
    if (window.innerWidth <= 768) {
      this.sidebarMobileOpen.update(value => !value);
    } else {
      this.sidebarCollapsed.update(value => !value);
    }
  }

  toggleRightPanel(): void {
    this.rightPanelOpen.update(value => !value);
  }

  closeRightPanel(): void {
    this.rightPanelOpen.set(false);
  }

  closeSidebar(): void {
    this.sidebarMobileOpen.set(false);
  }
}
