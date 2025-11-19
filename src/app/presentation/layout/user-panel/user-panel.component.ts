import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../domain/entities/user.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { UserPanelViewModel } from './user-panel.view-model';

/**
 * User Panel Component
 * Right panel showing user list with quick actions
 * Uses Input/Output/Effect pattern via UserPanelViewModel
 * Navigation is handled by ViewModel via NavGraph
 */
@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbPaginationModule,
    NgbTooltipModule,
    LoadingSpinnerComponent,
  ],
  providers: [UserPanelViewModel],
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.scss',
})
export class UserPanelComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  // Inject dependencies using Angular 14+ inject() function
  private viewModel = inject(UserPanelViewModel);

  // Expose ViewModel output to template
  readonly vm = this.viewModel.output;

  // For ngb-pagination two-way binding
  currentPageValue = 1;

  // Expose Math to template for calculations
  Math = Math;

  // Component lifecycle management
  private destroy$ = new Subject<void>();

  constructor() {
    this.setupEffects();
  }

  ngOnInit(): void {
    this.viewModel.input.loadInitial();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup effect subscriptions for side effects
   * Navigation is now handled by ViewModel via NavGraph
   */
  private setupEffects(): void {
    // Close panel
    this.viewModel.effect$.closePanel$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.close.emit();
      });

    // Handle errors
    this.viewModel.effect$.showError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        console.error('[UserPanel] Error:', error);
        // Could show toast notification here
      });
  }

  // Template event handlers - delegate to ViewModel inputs
  onSearch(query: string): void {
    this.viewModel.input.search(query);
  }

  onPageChange(page: number): void {
    this.currentPageValue = page;
    this.viewModel.input.goToPage(page);
  }

  onViewUser(user: User): void {
    // Navigation handled by ViewModel via NavGraph, close panel on navigate
    this.viewModel.input.viewUser(user, () => this.close.emit());
  }

  onEditUser(user: User, event: Event): void {
    event.stopPropagation();
    // Navigation handled by ViewModel via NavGraph, close panel on navigate
    this.viewModel.input.editUser(user, () => this.close.emit());
  }

  onCreateUser(): void {
    // Navigation handled by ViewModel via NavGraph, close panel on navigate
    this.viewModel.input.createUser(() => this.close.emit());
  }

  onViewAll(): void {
    // Navigation handled by ViewModel via NavGraph, close panel on navigate
    this.viewModel.input.viewAllUsers(() => this.close.emit());
  }

  onClose(): void {
    this.viewModel.input.closePanel();
  }
}
