import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { UserDetailViewModel } from './user-detail.view-model';

/**
 * User Detail Component
 * Displays detailed information about a user
 */
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, NgbAlertModule, LoadingSpinnerComponent, TranslatePipe],
  providers: [UserDetailViewModel],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  viewModel = inject(UserDetailViewModel);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Expose ViewModel computed values
  user = this.viewModel.user;
  isLoading = this.viewModel.isLoading;
  hasError = this.viewModel.hasError;
  errorMessage = this.viewModel.errorMessage;

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.viewModel.loadUser(userId);
    } else {
      this.router.navigate(['/users']);
    }
  }

  onBack(): void {
    this.router.navigate(['/users']);
  }

  onEdit(): void {
    const user = this.viewModel.getUser();
    if (user) {
      this.router.navigate(['/users', user.id, 'edit']);
    }
  }
}
