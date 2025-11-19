import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { NgbModal, NgbPaginationModule, NgbTooltipModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { UserListViewModel } from './user-list.view-model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { User } from '../../../../domain/entities/user.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../../domain/services/i18n.service';

/**
 * User List Component
 * Displays paginated list of users with search and CRUD actions
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbPaginationModule,
    NgbTooltipModule,
    NgbAlertModule,
    LoadingSpinnerComponent,
    TranslatePipe,
  ],
  providers: [UserListViewModel],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  vm = inject(UserListViewModel);
  private modalService = inject(NgbModal);
  private i18nService = inject(I18nService);

  searchQuery = '';
  showSuccessAlert = false;
  successMessage = '';

  // Expose Math to template
  Math = Math;

  ngOnInit(): void {
    // Load initial data
    this.vm.input.loadInitial();

    // Setup search with debounce
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(query => {
        this.vm.input.search(query);
      });

    // Subscribe to effects (navigation now handled by ViewModel via NavGraph)
    this.vm.effect$.confirmDelete$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.openDeleteConfirmation(user);
    });

    this.vm.effect$.showSuccess$.pipe(takeUntil(this.destroy$)).subscribe(message => {
      this.showSuccessMessage(message);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(query: string): void {
    this.searchSubject$.next(query);
  }

  onEditUser(user: User, event: Event): void {
    event.stopPropagation();
    this.vm.input.editUser(user);
  }

  onDeleteUser(user: User, event: Event): void {
    event.stopPropagation();
    this.vm.input.deleteUser(user);
  }

  onPageChange(page: number): void {
    this.vm.input.goToPage(page);
  }

  private openDeleteConfirmation(user: User): void {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, { centered: true });
    const component = modalRef.componentInstance as ConfirmationDialogComponent;

    const userName = `${user.firstName} ${user.lastName}`;
    component.title = this.i18nService.translate('user.delete.title');
    component.message = this.i18nService.translate('user.delete.message', { name: userName });
    component.confirmText = this.i18nService.translate('common.delete');
    component.cancelText = this.i18nService.translate('common.cancel');
    component.confirmButtonClass = 'danger';

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.vm.deleteUserConfirmed(user);
        }
      },
      () => {
        // Dismissed
      }
    );
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccessAlert = true;

    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 3000);
  }
}
