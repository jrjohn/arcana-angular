import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { UserDetailViewModel } from './user-detail.view-model';
import { BaseComponent } from '../../../shared/base';

/**
 * User Detail Component
 * Displays detailed information about a user
 * Extends BaseComponent for common functionality (NavGraph, Route, destroy$, setupEffects)
 */
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, NgbAlertModule, LoadingSpinnerComponent, TranslatePipe],
  providers: [UserDetailViewModel],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent extends BaseComponent implements OnInit {
  vm = inject(UserDetailViewModel);

  // Expose ViewModel outputs
  user = this.vm.output.user;
  isLoading = this.vm.output.isLoading;
  hasError = this.vm.output.hasError;
  errorMessage = this.vm.output.errorMessage;

  constructor() {
    super();
    this.setupEffects();
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.vm.input.loadUser(userId);
    } else {
      this.navGraph.users.toList();
    }
  }

  /**
   * Setup effect subscriptions
   */
  protected setupEffects(): void {
    // Handle errors (could show toast notification)
    this.vm.effect$.loadError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        console.error('[UserDetail] Error:', error);
        // Could show toast notification here
      });

    // Log when user is loaded
    this.vm.effect$.userLoaded$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        console.log('[UserDetail] User loaded:', user);
      });
  }

  onBack(): void {
    this.navGraph.users.toList();
  }

  onEdit(): void {
    const user = this.vm.output.user();
    if (user) {
      this.navGraph.users.toUserEdit(user);
    }
  }

  onRetry(): void {
    this.vm.input.retry();
  }
}
