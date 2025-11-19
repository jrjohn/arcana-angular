import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Loading Spinner Component
 * Displays a loading indicator
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center" [class.my-5]="!inline">
      <div
        class="spinner-border"
        [class]="'text-' + color"
        role="status"
        [style.width]="size"
        [style.height]="size"
      >
        <span class="visually-hidden">{{ message }}</span>
      </div>
      @if (showMessage) {
        <p class="mt-3 text-muted">{{ message }}</p>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
  @Input() showMessage = true;
  @Input() color = 'primary';
  @Input() size = '3rem';
  @Input() inline = false;
}
