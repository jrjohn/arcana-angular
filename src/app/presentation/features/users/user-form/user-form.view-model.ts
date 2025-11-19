import { Injectable, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';
import { UserService } from '../../../../domain/services/user.service';
import { User, UserValidator } from '../../../../domain/entities/user.model';
import { AppError } from '../../../../domain/entities/app-error.model';
import { BaseViewModel } from '../../../shared/base';
import { SanitizationService } from '../../../../domain/services/sanitization.service';

/**
 * User Form ViewModel
 * Manages state and logic for user create/edit form
 * Extends BaseViewModel for common functionality (NavGraph, etc.)
 */
@Injectable()
export class UserFormViewModel extends BaseViewModel {
  // Form field signals
  private readonly firstNameSignal = signal('');
  private readonly lastNameSignal = signal('');
  private readonly emailSignal = signal('');
  private readonly avatarSignal = signal('');

  // Validation error signals
  private readonly firstNameErrorSignal = signal<string | null>(null);
  private readonly lastNameErrorSignal = signal<string | null>(null);
  private readonly emailErrorSignal = signal<string | null>(null);
  private readonly avatarErrorSignal = signal<string | null>(null);

  // UI state signals
  private readonly isLoadingSignal = signal(false);
  private readonly isSavingSignal = signal(false);
  private readonly isEditModeSignal = signal(false);
  private readonly userIdSignal = signal<string | null>(null);

  // Input - User actions
  readonly input = {
    initialize: (userId?: string) => this.initialize(userId),
    updateFirstName: (value: string) => this.updateFirstName(value),
    updateLastName: (value: string) => this.updateLastName(value),
    updateEmail: (value: string) => this.updateEmail(value),
    updateAvatar: (value: string) => this.updateAvatar(value),
    submit: () => this.submit(),
    cancel: () => this.effect$.navigateBack$.next(),
  };

  // Computed states
  private readonly isValidComputed = computed(() => {
    return (
      this.firstNameSignal().trim().length > 0 &&
      this.lastNameSignal().trim().length > 0 &&
      this.emailSignal().trim().length > 0 &&
      this.firstNameErrorSignal() === null &&
      this.lastNameErrorSignal() === null &&
      this.emailErrorSignal() === null &&
      this.avatarErrorSignal() === null
    );
  });

  // Output - Observable state
  readonly output = {
    // Form values
    firstName: this.firstNameSignal.asReadonly(),
    lastName: this.lastNameSignal.asReadonly(),
    email: this.emailSignal.asReadonly(),
    avatar: this.avatarSignal.asReadonly(),

    // Validation errors
    firstNameError: this.firstNameErrorSignal.asReadonly(),
    lastNameError: this.lastNameErrorSignal.asReadonly(),
    emailError: this.emailErrorSignal.asReadonly(),
    avatarError: this.avatarErrorSignal.asReadonly(),

    // UI states
    isLoading: this.isLoadingSignal.asReadonly(),
    isSaving: this.isSavingSignal.asReadonly(),
    isEditMode: this.isEditModeSignal.asReadonly(),
    userId: this.userIdSignal.asReadonly(),

    // Computed states
    isValid: this.isValidComputed,
    canSubmit: computed(() => this.isValidComputed() && !this.isSavingSignal()),
    formTitle: computed(() => (this.isEditModeSignal() ? 'user.form.edit.title' : 'user.form.create.title')),
    submitButtonText: computed(() => (this.isEditModeSignal() ? 'user.form.button.update' : 'user.form.button.create')),
  };

  // Effect - Side effects as Subjects
  readonly effect$ = {
    navigateBack$: new Subject<void>(),
    showError$: new Subject<AppError>(),
    showSuccess$: new Subject<string>(),
    userSaved$: new Subject<User>(),
  };

  constructor(
    private userService: UserService,
    private sanitizationService: SanitizationService
  ) {
    super();
  }

  /**
   * Initializes form (for create or edit mode)
   */
  private initialize(userId?: string): void {
    if (userId) {
      this.isEditModeSignal.set(true);
      this.userIdSignal.set(userId);
      this.loadUser(userId);
    } else {
      this.isEditModeSignal.set(false);
      this.userIdSignal.set(null);
      this.resetForm();
    }
  }

  /**
   * Loads user data for editing
   */
  private loadUser(userId: string): void {
    this.isLoadingSignal.set(true);

    this.userService.getUser(userId).subscribe({
      next: user => {
        this.firstNameSignal.set(user.firstName);
        this.lastNameSignal.set(user.lastName);
        this.emailSignal.set(user.email);
        this.avatarSignal.set(user.avatar || '');
        this.isLoadingSignal.set(false);
      },
      error: (error: AppError) => {
        this.isLoadingSignal.set(false);
        this.effect$.showError$.next(error);
        this.effect$.navigateBack$.next();
      },
    });
  }

  /**
   * Updates first name with validation and sanitization
   */
  private updateFirstName(value: string): void {
    // Sanitize input to prevent XSS
    const sanitized = this.sanitizationService.sanitizeInput(value, {
      allowHtml: false,
      maxLength: 100,
      allowedChars: /a-zA-Z\s'-/
    });
    this.firstNameSignal.set(sanitized);
    this.firstNameErrorSignal.set(UserValidator.validateFirstName(sanitized));
  }

  /**
   * Updates last name with validation and sanitization
   */
  private updateLastName(value: string): void {
    // Sanitize input to prevent XSS
    const sanitized = this.sanitizationService.sanitizeInput(value, {
      allowHtml: false,
      maxLength: 100,
      allowedChars: /a-zA-Z\s'-/
    });
    this.lastNameSignal.set(sanitized);
    this.lastNameErrorSignal.set(UserValidator.validateLastName(sanitized));
  }

  /**
   * Updates email with validation and sanitization
   */
  private updateEmail(value: string): void {
    // Sanitize email input
    const sanitized = this.sanitizationService.sanitizeEmail(value);
    this.emailSignal.set(sanitized);
    this.emailErrorSignal.set(UserValidator.validateEmail(sanitized));
  }

  /**
   * Updates avatar with validation and sanitization
   */
  private updateAvatar(value: string): void {
    // Sanitize URL to prevent javascript: and other malicious URLs
    const sanitized = this.sanitizationService.sanitizeUrl(value);
    this.avatarSignal.set(sanitized);
    this.avatarErrorSignal.set(UserValidator.validateAvatar(sanitized));
  }

  /**
   * Submits form (create or update)
   */
  private submit(): void {
    if (!this.output.isValid()) {
      return;
    }

    this.isSavingSignal.set(true);

    // Final sanitization before submission (defense in depth)
    const sanitizedData = this.sanitizationService.sanitizeUserInput({
      firstName: this.firstNameSignal(),
      lastName: this.lastNameSignal(),
      email: this.emailSignal(),
      avatar: this.avatarSignal() || undefined,
    });

    const userData = {
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      email: sanitizedData.email,
      avatar: sanitizedData.avatar,
    };

    const request$ = this.isEditModeSignal()
      ? this.userService.updateUser(this.userIdSignal()!, userData)
      : this.userService.createUser(userData);

    request$.subscribe({
      next: user => {
        this.isSavingSignal.set(false);
        const message = this.isEditModeSignal()
          ? 'user.updated.success'
          : 'user.created.success';
        this.effect$.showSuccess$.next(message);
        this.effect$.userSaved$.next(user);
        this.effect$.navigateBack$.next();
      },
      error: (error: AppError) => {
        this.isSavingSignal.set(false);
        this.effect$.showError$.next(error);
      },
    });
  }

  /**
   * Resets form to initial state
   */
  private resetForm(): void {
    this.firstNameSignal.set('');
    this.lastNameSignal.set('');
    this.emailSignal.set('');
    this.avatarSignal.set('');
    this.firstNameErrorSignal.set(null);
    this.lastNameErrorSignal.set(null);
    this.emailErrorSignal.set(null);
    this.avatarErrorSignal.set(null);
  }
}
