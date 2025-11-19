# ng-bootstrap Integration

This project uses [ng-bootstrap](https://ng-bootstrap.github.io/) - Angular widgets built from the ground up using Bootstrap 5 CSS with APIs designed for the Angular ecosystem.

## Installation

✅ **Already Installed**

```bash
npm install @ng-bootstrap/ng-bootstrap bootstrap
```

**Versions:**
- `@ng-bootstrap/ng-bootstrap`: 19.0.1
- `bootstrap`: Latest (CSS only)

## Configuration

### 1. Bootstrap CSS Import

Bootstrap CSS is already imported in [src/styles.scss](../src/styles.scss):

```scss
@use "bootstrap/scss/bootstrap" as *;
```

### 2. Animations

`provideAnimations()` is already configured in [src/app/app.config.ts](../src/app/app.config.ts), which is required for many ng-bootstrap components (modals, tooltips, etc.).

## Usage

Since this project uses **standalone components** (Angular 19+), you import ng-bootstrap components directly into your component's `imports` array.

### Example: Using NgbModal in a Component

```typescript
import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [
    // Import specific ng-bootstrap components as needed
  ],
  template: `
    <button (click)="open(content)">Open Modal</button>

    <ng-template #content let-modal>
      <div class="modal-header">
        <h4 class="modal-title">Modal title</h4>
        <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body">
        <p>Modal body text goes here.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="modal.close()">Close</button>
      </div>
    </ng-template>
  `
})
export class MyComponent {
  private modalService = inject(NgbModal);

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-title' });
  }
}
```

### Example: Using NgbPagination

```typescript
import { Component, signal } from '@angular/core';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NgbPaginationModule],
  template: `
    <ngb-pagination
      [collectionSize]="totalItems()"
      [pageSize]="pageSize()"
      [(page)]="currentPage"
      [maxSize]="5"
      [rotate]="true"
      [boundaryLinks]="true"
    />
  `
})
export class UserListComponent {
  totalItems = signal(120);
  pageSize = signal(10);
  currentPage = 1;
}
```

### Example: Using NgbDatepicker

```typescript
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [FormsModule, NgbDatepickerModule],
  template: `
    <div class="input-group">
      <input
        class="form-control"
        placeholder="yyyy-mm-dd"
        name="dp"
        [(ngModel)]="model"
        ngbDatepicker
        #d="ngbDatepicker"
      />
      <button class="btn btn-outline-secondary" (click)="d.toggle()" type="button">
        📅
      </button>
    </div>
  `
})
export class DatePickerComponent {
  model: any;
}
```

### Example: Using NgbTooltip

```typescript
import { Component } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tooltip-example',
  standalone: true,
  imports: [NgbTooltipModule],
  template: `
    <button
      class="btn btn-primary"
      ngbTooltip="This is a tooltip"
      placement="top"
    >
      Hover me
    </button>
  `
})
export class TooltipExampleComponent {}
```

## Available Components

ng-bootstrap provides the following components:

### Navigation
- **Accordion** - `NgbAccordionModule`
- **Carousel** - `NgbCarouselModule`
- **Nav** - `NgbNavModule`
- **Pagination** - `NgbPaginationModule`

### Forms
- **Datepicker** - `NgbDatepickerModule`
- **Timepicker** - `NgbTimepickerModule`
- **Typeahead** - `NgbTypeaheadModule`
- **Rating** - `NgbRatingModule`

### Overlays
- **Modal** - `NgbModal` (service)
- **Popover** - `NgbPopoverModule`
- **Tooltip** - `NgbTooltipModule`
- **Offcanvas** - `NgbOffcanvas` (service)

### Indicators
- **Alert** - `NgbAlertModule`
- **Badge** - Bootstrap CSS only (no module needed)
- **Progress** - `NgbProgressbarModule`
- **Toast** - `NgbToastModule`

### Content
- **Collapse** - `NgbCollapseModule`
- **Dropdown** - `NgbDropdownModule`
- **Table** - Bootstrap CSS only (no module needed)

## Best Practices

### 1. Import Only What You Need

Instead of importing all ng-bootstrap modules, import only the specific modules you use:

```typescript
// ✅ Good - Tree-shakeable
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

// ❌ Avoid - Imports everything
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
```

### 2. Use Standalone Component Imports

For standalone components (recommended), import modules directly:

```typescript
@Component({
  standalone: true,
  imports: [NgbModalModule, NgbTooltipModule],
  // ...
})
```

### 3. Follow Bootstrap Classes

ng-bootstrap components work with Bootstrap CSS classes:

```html
<!-- Use Bootstrap utility classes -->
<button class="btn btn-primary" ngbTooltip="Info">Click me</button>

<!-- Responsive utilities -->
<div class="d-none d-md-block">Visible on medium and up</div>

<!-- Grid system -->
<div class="container">
  <div class="row">
    <div class="col-md-6">Column 1</div>
    <div class="col-md-6">Column 2</div>
  </div>
</div>
```

### 4. Accessibility

ng-bootstrap components are built with accessibility in mind:

```typescript
// Always provide aria labels
this.modalService.open(content, {
  ariaLabelledBy: 'modal-title',
  ariaDescribedBy: 'modal-body'
});

// Use semantic HTML
<button type="button" class="btn btn-primary">
  Submit
</button>
```

## Integration with Clean Architecture

### ViewModel Pattern

ng-bootstrap components work seamlessly with the Input/Output/Effect pattern:

```typescript
export class UserFormViewModel extends BaseViewModel {
  // INPUTS
  openModal(content: any): void {
    const modalService = inject(NgbModal);
    modalService.open(content);
  }

  selectDate(date: NgbDateStruct): void {
    // Convert NgbDateStruct to Date
    const jsDate = new Date(date.year, date.month - 1, date.day);
    this.selectedDate.set(jsDate);
  }

  // OUTPUTS
  selectedDate = signal<Date | null>(null);
  isModalOpen = signal(false);
}
```

### Repository Layer

Use ng-bootstrap's datepicker with your repository pattern:

```typescript
// In your repository
async getUsersByDateRange(start: Date, end: Date): Promise<User[]> {
  // Use dates from ng-bootstrap datepicker
  return this.apiClient.get<User[]>('/users', {
    params: { start: start.toISOString(), end: end.toISOString() }
  });
}
```

## Examples in This Project

You can enhance the existing components with ng-bootstrap:

### User List Pagination

Replace custom pagination in [user-list.component.ts](../src/app/presentation/features/users/user-list/user-list.component.ts) with `NgbPaginationModule`.

### User Form Date Picker

Add date picker to user form in [user-form.component.ts](../src/app/presentation/features/users/user-form/user-form.component.ts) for birth date selection.

### User Detail Modal

Convert user detail page to a modal using `NgbModal` for better UX.

### Alert Messages

Use `NgbAlertModule` for showing success/error messages instead of console logs.

## Testing

ng-bootstrap components are fully testable:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let modalService: NgbModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(NgbModal);
  });

  it('should open modal', () => {
    const spy = spyOn(modalService, 'open');
    component.openModal({});
    expect(spy).toHaveBeenCalled();
  });
});
```

## Documentation

- **Official Docs**: https://ng-bootstrap.github.io/
- **API Reference**: https://ng-bootstrap.github.io/#/components
- **GitHub**: https://github.com/ng-bootstrap/ng-bootstrap
- **Bootstrap Docs**: https://getbootstrap.com/docs/5.3/

## Migration from Bootstrap JS

If migrating from Bootstrap's JavaScript:

| Bootstrap JS | ng-bootstrap |
|--------------|--------------|
| `$('#modal').modal()` | `NgbModal.open()` |
| `data-bs-toggle="tooltip"` | `ngbTooltip` directive |
| `data-bs-toggle="collapse"` | `NgbCollapse` directive |
| `$('.dropdown-toggle').dropdown()` | `NgbDropdown` component |

## Common Issues

### 1. Modal Not Opening

**Issue**: Modal service doesn't work.

**Solution**: Ensure `provideAnimations()` is in `app.config.ts` (already configured).

### 2. Styles Not Applied

**Issue**: Components render but don't look right.

**Solution**: Verify Bootstrap CSS is imported in `styles.scss` (already configured).

### 3. Datepicker Format

**Issue**: Need custom date format.

**Solution**: Implement `NgbDateParserFormatter`:

```typescript
import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class CustomDateFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    // Custom parsing logic
  }

  format(date: NgbDateStruct | null): string {
    return date ? `${date.month}/${date.day}/${date.year}` : '';
  }
}

// In component or app.config
providers: [
  { provide: NgbDateParserFormatter, useClass: CustomDateFormatter }
]
```

## Next Steps

1. **Replace Custom Pagination**: Update user list to use `NgbPaginationModule`
2. **Add Date Filters**: Use `NgbDatepickerModule` for date range filtering
3. **Improve Alerts**: Replace console logs with `NgbAlertModule` toast notifications
4. **Add Tooltips**: Enhance user experience with `NgbTooltipModule` on icons
5. **Modal Dialogs**: Use `NgbModal` for confirmations and forms

## Version Compatibility

- **Angular 20**: ✅ Fully compatible
- **Bootstrap 5**: ✅ Required
- **TypeScript 5.7**: ✅ Fully compatible
- **Standalone Components**: ✅ First-class support

---

**Status**: ✅ **Ready to Use**

ng-bootstrap is fully configured and ready to use in your components. Simply import the required modules and start building!
