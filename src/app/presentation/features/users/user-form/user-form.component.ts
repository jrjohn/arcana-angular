import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { UserFormViewModel } from './user-form.view-model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

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
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  errorMessage: string | null = null;
  showSuccessAlert = false;
  successMessage = '';

  ngOnInit(): void {
    // Get userId from route params (if editing)
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId && userId !== 'new') {
      this.vm.input.initialize(userId);
    } else {
      this.vm.input.initialize();
    }

    // Subscribe to effects
    this.vm.effect$.navigateBack$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.router.navigate(['/users']);
    });

    this.vm.effect$.showError$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      this.errorMessage = error.userMessage;
    });

    this.vm.effect$.showSuccess$.pipe(takeUntil(this.destroy$)).subscribe(message => {
      this.successMessage = message;
      this.showSuccessAlert = true;
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
