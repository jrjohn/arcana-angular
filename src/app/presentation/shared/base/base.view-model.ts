import { inject } from '@angular/core';
import { NavGraphService } from '../../../domain/services/nav-graph.service';

/**
 * Base ViewModel Class
 * Provides common functionality for all ViewModels
 * - NavGraph service for centralized navigation
 * - Input/Output/Effect pattern enforcement
 */
export abstract class BaseViewModel {
  /**
   * Centralized navigation service
   * Available to all ViewModels
   */
  protected readonly navGraph = inject(NavGraphService);

  /**
   * Input - User actions (must be implemented by child class)
   * All user-triggered actions should be exposed here
   */
  abstract readonly input: Record<string, (...args: any[]) => any>;

  /**
   * Output - Observable state (must be implemented by child class)
   * All template-bound state should be exposed here as readonly signals/computeds
   */
  abstract readonly output: Record<string, any>;

  /**
   * Effect - Side effects (must be implemented by child class)
   * All imperative side effects (toasts, logging, etc.) should be exposed here
   */
  abstract readonly effect$: Record<string, any>;
}
