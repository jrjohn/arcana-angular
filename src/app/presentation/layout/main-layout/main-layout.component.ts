import { Component, signal, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();

  sidebarCollapsed = signal(false);
  sidebarMobileOpen = signal(false);
  rightPanelOpen = signal(false);

  // Track if current viewport is mobile (SSR-safe)
  private isMobile = signal(false);

  ngOnInit(): void {
    // Observe mobile breakpoint changes
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile.set(result.matches);

        // Close mobile sidebar if switching to desktop
        if (!result.matches && this.sidebarMobileOpen()) {
          this.sidebarMobileOpen.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    // Check if mobile using BreakpointObserver (SSR-safe)
    if (this.isMobile()) {
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
