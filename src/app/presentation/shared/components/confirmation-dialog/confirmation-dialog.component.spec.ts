import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
      providers: [
        { provide: NgbActiveModal, useValue: mockActiveModal }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default title', () => {
    expect(component.title).toBe('Confirm Action');
  });

  it('should have default message', () => {
    expect(component.message).toBe('Are you sure you want to proceed?');
  });

  it('should have default confirmText', () => {
    expect(component.confirmText).toBe('Confirm');
  });

  it('should have default cancelText', () => {
    expect(component.cancelText).toBe('Cancel');
  });

  it('should have default confirmButtonClass as primary', () => {
    expect(component.confirmButtonClass).toBe('primary');
  });

  it('should allow setting custom title', () => {
    component.title = 'Delete User';
    expect(component.title).toBe('Delete User');
  });

  it('should allow setting custom message', () => {
    component.message = 'Are you sure you want to delete this user?';
    expect(component.message).toBe('Are you sure you want to delete this user?');
  });

  it('should allow setting danger button class', () => {
    component.confirmButtonClass = 'danger';
    expect(component.confirmButtonClass).toBe('danger');
  });

  it('should call activeModal.close(true) when confirm button is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    // Find the confirm button and click it
    const buttons = compiled.querySelectorAll('button');
    const confirmBtn = Array.from(buttons).find(btn =>
      btn.textContent?.includes(component.confirmText)
    );
    confirmBtn?.click();

    expect(mockActiveModal.close).toHaveBeenCalledWith(true);
  });

  it('should call activeModal.dismiss() when cancel button is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    const buttons = compiled.querySelectorAll('button');
    const cancelBtn = Array.from(buttons).find(btn =>
      btn.textContent?.trim() === component.cancelText
    );
    cancelBtn?.click();

    expect(mockActiveModal.dismiss).toHaveBeenCalled();
  });

  it('should call activeModal.dismiss() when close (X) button is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    const closeBtn = compiled.querySelector('.btn-close') as HTMLElement;
    closeBtn?.click();

    expect(mockActiveModal.dismiss).toHaveBeenCalled();
  });

  it('should render title in template', () => {
    component.title = 'My Custom Title';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal-title')?.textContent?.trim()).toBe('My Custom Title');
  });

  it('should render message in template', () => {
    component.message = 'Custom message text';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal-body p')?.textContent?.trim()).toBe('Custom message text');
  });
});
