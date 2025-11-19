import { Pipe, PipeTransform, effect } from '@angular/core';
import { I18nService } from '../../../domain/services/i18n.service';

/**
 * Translate Pipe
 * Translates keys to localized strings
 *
 * Usage:
 *   {{ 'user.list.title' | translate }}
 *   {{ 'user.created.success' | translate: {name: 'John'} }}
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Impure pipe to detect language changes
})
export class TranslatePipe implements PipeTransform {
  private lastKey: string | null = null;
  private lastParams: Record<string, string | number> | undefined;
  private lastValue: string | null = null;
  private lastLanguage: string | null = null;

  constructor(private i18n: I18nService) {}

  transform(key: string, params?: Record<string, string | number>): string {
    const currentLanguage = this.i18n.getCurrentLanguage();

    // Return cached value if inputs haven't changed and language is the same
    if (
      key === this.lastKey &&
      params === this.lastParams &&
      currentLanguage === this.lastLanguage &&
      this.lastValue !== null
    ) {
      return this.lastValue;
    }

    this.lastKey = key;
    this.lastParams = params;
    this.lastLanguage = currentLanguage;
    this.lastValue = this.i18n.translate(key, params);

    return this.lastValue;
  }
}
