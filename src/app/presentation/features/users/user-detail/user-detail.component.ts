import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../../domain/services/user.service';
import { User } from '../../../../domain/entities/user.model';
import { AppError } from '../../../../domain/entities/app-error.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/**
 * User Detail Component
 * Displays detailed information about a user
 */
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, NgbAlertModule, LoadingSpinnerComponent, TranslatePipe],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // State signals
  private userSignal = signal<User | null>(null);
  private isLoadingSignal = signal(false);
  private errorSignal = signal<AppError | null>(null);

  // Computed values
  user = computed(() => this.userSignal());
  isLoading = computed(() => this.isLoadingSignal());
  hasError = computed(() => this.errorSignal() !== null);
  errorMessage = computed(() => this.errorSignal()?.userMessage || '');

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    } else {
      this.router.navigate(['/users']);
    }
  }

  private loadUser(userId: string): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.userService.getUser(userId).subscribe({
      next: user => {
        this.userSignal.set(user);
        this.isLoadingSignal.set(false);
      },
      error: (error: AppError) => {
        this.errorSignal.set(error);
        this.isLoadingSignal.set(false);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/users']);
  }

  onEdit(): void {
    const user = this.userSignal();
    if (user) {
      this.router.navigate(['/users', user.id, 'edit']);
    }
  }
}
