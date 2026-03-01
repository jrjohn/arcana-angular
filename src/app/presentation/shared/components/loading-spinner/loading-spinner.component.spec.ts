import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default message "Loading..."', () => {
    expect(component.message).toBe('Loading...');
  });

  it('should have default showMessage as true', () => {
    expect(component.showMessage).toBe(true);
  });

  it('should have default color "primary"', () => {
    expect(component.color).toBe('primary');
  });

  it('should have default size "3rem"', () => {
    expect(component.size).toBe('3rem');
  });

  it('should have default inline as false', () => {
    expect(component.inline).toBe(false);
  });

  it('should accept custom message', () => {
    component.message = 'Please wait...';
    fixture.detectChanges();
    expect(component.message).toBe('Please wait...');
  });

  it('should accept custom color', () => {
    component.color = 'danger';
    fixture.detectChanges();
    expect(component.color).toBe('danger');
  });

  it('should accept custom size', () => {
    component.size = '5rem';
    fixture.detectChanges();
    expect(component.size).toBe('5rem');
  });

  it('should accept inline true', () => {
    component.inline = true;
    fixture.detectChanges();
    expect(component.inline).toBe(true);
  });

  it('should accept showMessage false', () => {
    component.showMessage = false;
    fixture.detectChanges();
    expect(component.showMessage).toBe(false);
  });

  it('should render spinner element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('.spinner-border');
    expect(spinner).toBeTruthy();
  });

  it('should render message when showMessage is true', () => {
    component.showMessage = true;
    component.message = 'Loading data...';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const para = compiled.querySelector('p');
    expect(para?.textContent).toContain('Loading data...');
  });
});
