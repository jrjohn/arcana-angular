import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { UserFormViewModel } from './user-form.view-model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { NavGraphService } from '../../../../domain/services/nav-graph.service';

/**
 * User Form Component
 * Handles creating and editing users
 */
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbAlertModule, LoadingSpinnerComponent, TranslatePipe],
  providers: [UserFormViewModel],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  vm = inject(UserFormViewModel);
  private navGraph = inject(NavGraphService);
  private route = inject(ActivatedRoute);

  errorMessage: string | null = null;
  showSuccessAlert = false;
  successMessage = '';

  constructor() {
    this.setupEffects();
  }

  ngOnInit(): void {
    // Get userId from route params (if editing)
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId && userId !== 'new') {
      this.vm.input.initialize(userId);
    } else {
      this.vm.input.initialize();
    }
  }

  /**
   * Setup effect subscriptions
   */
  private setupEffects(): void {
    // Navigate back to user list
    this.vm.effect$.navigateBack$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.navGraph.users.toList();
      });

    // Show error messages
    this.vm.effect$.showError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error.userMessage;
        console.error('[UserForm] Error:', error);
      });

    // Show success messages
    this.vm.effect$.showSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.successMessage = message;
        this.showSuccessAlert = true;
      });

    // Log when user is saved
    this.vm.effect$.userSaved$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        console.log('[UserForm] User saved:', user);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancel(): void {
    this.vm.input.cancel();
  }
}
