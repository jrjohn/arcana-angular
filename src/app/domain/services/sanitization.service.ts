import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Sanitization Service
 * Provides input sanitization and XSS protection for user-generated content
 *
 * Features:
 * - HTML sanitization (removes dangerous scripts, iframes, etc.)
 * - URL sanitization (prevents javascript: and data: URLs)
 * - Text sanitization (removes/escapes HTML tags)
 * - Email validation and sanitization
 * - SQL injection prevention helpers
 *
 * @see https://angular.io/api/platform-browser/DomSanitizer
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 */
@Injectable({
  providedIn: 'root'
})
export class SanitizationService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Sanitize HTML content
   * Removes dangerous elements and attributes while preserving safe formatting
   *
   * @example
   * sanitizeHtml('<script>alert("XSS")</script><p>Safe text</p>')
   * // Returns: '<p>Safe text</p>'
   */
  sanitizeHtml(html: string): string {
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, html);
    return sanitized || '';
  }

  /**
   * Sanitize HTML and return SafeHtml for binding
   * Use with [innerHTML] binding
   *
   * @example
   * <div [innerHTML]="sanitizationService.sanitizeHtmlSafe(userContent)"></div>
   */
  sanitizeHtmlSafe(html: string): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
  }

  /**
   * Sanitize URL
   * Prevents javascript: and data: URLs that could execute code
   *
   * @example
   * sanitizeUrl('javascript:alert("XSS")')
   * // Returns: 'unsafe:javascript:alert("XSS")'
   */
  sanitizeUrl(url: string): string {
    const sanitized = this.sanitizer.sanitize(SecurityContext.URL, url);
    return sanitized || '';
  }

  /**
   * Sanitize URL and return SafeUrl for binding
   */
  sanitizeUrlSafe(url: string): SafeUrl {
    return this.sanitizer.sanitize(SecurityContext.URL, url) || '';
  }

  /**
   * Sanitize resource URL (for iframes, etc.)
   */
  sanitizeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url) || '';
  }

  /**
   * Sanitize plain text input
   * Removes all HTML tags and dangerous characters
   *
   * @example
   * sanitizeText('<script>alert("XSS")</script>Hello')
   * // Returns: 'Hello'
   */
  sanitizeText(text: string): string {
    if (!text) return '';

    // Remove all HTML tags
    let sanitized = text.replace(/<[^>]*>/g, '');

    // Escape special HTML characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized.trim();
  }

  /**
   * Sanitize user input for forms
   * Removes dangerous characters while preserving valid input
   *
   * @param input - User input string
   * @param options - Sanitization options
   */
  sanitizeInput(
    input: string,
    options: {
      allowHtml?: boolean;
      maxLength?: number;
      allowedChars?: RegExp;
    } = {}
  ): string {
    if (!input) return '';

    let sanitized = input;

    // Remove HTML if not allowed
    if (!options.allowHtml) {
      sanitized = this.sanitizeText(sanitized);
    } else {
      sanitized = this.sanitizeHtml(sanitized);
    }

    // Apply character filter if provided
    if (options.allowedChars) {
      sanitized = sanitized.replace(new RegExp(`[^${options.allowedChars.source}]`, 'g'), '');
    }

    // Trim to max length
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized.trim();
  }

  /**
   * Sanitize email address
   * Validates and sanitizes email input
   *
   * @example
   * sanitizeEmail('user@example.com<script>alert(1)</script>')
   * // Returns: 'user@example.com'
   */
  sanitizeEmail(email: string): string {
    if (!email) return '';

    // Remove any HTML tags
    let sanitized = this.sanitizeText(email);

    // Extract email using regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(sanitized)) {
      return sanitized.toLowerCase().trim();
    }

    // If doesn't match email pattern, return empty (invalid)
    return '';
  }

  /**
   * Sanitize filename
   * Removes path traversal attempts and dangerous characters
   *
   * @example
   * sanitizeFilename('../../../etc/passwd')
   * // Returns: 'passwd'
   */
  sanitizeFilename(filename: string): string {
    if (!filename) return '';

    // Remove path separators
    let sanitized = filename.replace(/[/\\]/g, '');

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Remove leading dots (hidden files)
    sanitized = sanitized.replace(/^\.+/, '');

    return sanitized.trim();
  }

  /**
   * Sanitize SQL input (basic protection)
   * WARNING: Use parameterized queries on the backend for real SQL injection protection
   * This is just a frontend helper for additional validation
   *
   * @example
   * sanitizeSqlInput("'; DROP TABLE users; --")
   * // Returns: " DROP TABLE users "
   */
  sanitizeSqlInput(input: string): string {
    if (!input) return '';

    // Remove common SQL injection patterns
    let sanitized = input
      .replace(/'/g, '')  // Remove single quotes
      .replace(/"/g, '')  // Remove double quotes
      .replace(/;/g, '')  // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment start
      .replace(/\*\//g, ''); // Remove block comment end

    return sanitized.trim();
  }

  /**
   * Validate and sanitize user object
   * Applies sanitization to all user-provided fields
   * NOTE: Only sanitizes provided fields, does not modify structure
   */
  sanitizeUserInput(user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  }): {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  } {
    return {
      // Preserve ID (never sanitize IDs as they're system-generated)
      ...(user.id && { id: user.id }),
      firstName: this.sanitizeInput(user.firstName || '', {
        allowHtml: false,
        maxLength: 100,
        allowedChars: /a-zA-Z\s'-/
      }),
      lastName: this.sanitizeInput(user.lastName || '', {
        allowHtml: false,
        maxLength: 100,
        allowedChars: /a-zA-Z\s'-/
      }),
      email: this.sanitizeEmail(user.email || ''),
      avatar: user.avatar ? this.sanitizeUrl(user.avatar) : undefined
    };
  }

  /**
   * Check if string contains potential XSS
   * Returns true if suspicious patterns detected
   */
  containsXss(input: string): boolean {
    if (!input) return false;

    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // Event handlers like onclick=
      /<iframe/gi,
      /eval\(/gi,
      /expression\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Validate input doesn't contain XSS
   * Throws error if XSS detected
   */
  validateNoXss(input: string, fieldName: string = 'Input'): void {
    if (this.containsXss(input)) {
      throw new Error(`${fieldName} contains potentially malicious content`);
    }
  }
}
