import { Directive, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { NavGraphService } from '../../../domain/services/nav-graph.service';

/**
 * Base Component Class
 * Provides common functionality for all components
 * - NavGraph service for centralized navigation
 * - ActivatedRoute for route parameter access
 * - destroy$ Subject for subscription cleanup
 * - setupEffects() pattern enforcement
 */
@Directive()
export abstract class BaseComponent implements OnDestroy {
  /**
   * Centralized navigation service
   * Available to all components
   */
  protected readonly navGraph = inject(NavGraphService);

  /**
   * Current route for accessing route parameters
   * Available to all components
   */
  protected readonly route = inject(ActivatedRoute);

  /**
   * Subject for managing subscription lifecycle
   * Use with takeUntil(this.destroy$) for automatic cleanup
   */
  protected readonly destroy$ = new Subject<void>();

  /**
   * Constructor
   * Child classes must call setupEffects() in their own constructor after dependency injection
   */
  constructor() {
    // setupEffects() must be called by child class after all dependencies are injected
  }

  /**
   * Setup effect subscriptions
   * Must be implemented and called by child class in constructor to subscribe to ViewModel effects
   */
  protected abstract setupEffects(): void;

  /**
   * Cleanup subscriptions on component destroy
   * Automatically called by Angular
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
