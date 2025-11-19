import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/**
 * Confirmation Dialog Component
 * Reusable modal for confirming user actions
 */
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        (click)="activeModal.dismiss()"
      ></button>
    </div>
    <div class="modal-body">
      <p>{{ message }}</p>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-secondary"
        (click)="activeModal.dismiss()"
      >
        {{ cancelText }}
      </button>
      <button
        type="button"
        [class]="'btn btn-' + confirmButtonClass"
        (click)="activeModal.close(true)"
      >
        {{ confirmText }}
      </button>
    </div>
  `,
})
export class ConfirmationDialogComponent {
  activeModal = inject(NgbActiveModal);

  title = 'Confirm Action';
  message = 'Are you sure you want to proceed?';
  confirmText = 'Confirm';
  cancelText = 'Cancel';
  confirmButtonClass = 'primary';
}
