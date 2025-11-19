import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SanitizationService } from './sanitization.service';

describe('SanitizationService', () => {
  let service: SanitizationService;
  let domSanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SanitizationService);
    domSanitizer = TestBed.inject(DomSanitizer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("XSS")</script><p>Safe text</p>';
      const result = service.sanitizeHtml(malicious);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Safe text');
    });

    it('should remove onclick handlers', () => {
      const malicious = '<button onclick="alert(\'XSS\')">Click me</button>';
      const result = service.sanitizeHtml(malicious);
      expect(result).not.toContain('onclick');
    });

    it('should preserve safe HTML', () => {
      const safe = '<p>Hello <strong>World</strong></p>';
      const result = service.sanitizeHtml(safe);
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should handle empty input', () => {
      const result = service.sanitizeHtml('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('should remove all HTML tags', () => {
      const input = '<script>alert("XSS")</script>Hello <b>World</b>';
      const result = service.sanitizeText(input);
      expect(result).toBe('Hello World');
    });

    it('should escape special HTML characters', () => {
      const input = 'Test & < > " \' /';
      const result = service.sanitizeText(input);
      expect(result).toContain('&amp;');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#x27;');
      expect(result).toContain('&#x2F;');
    });

    it('should handle empty input', () => {
      const result = service.sanitizeText('');
      expect(result).toBe('');
    });

    it('should trim whitespace', () => {
      const input = '   Hello World   ';
      const result = service.sanitizeText(input);
      expect(result).toBe('Hello World');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow https URLs', () => {
      const url = 'https://example.com/image.jpg';
      const result = service.sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it('should allow http URLs', () => {
      const url = 'http://example.com/image.jpg';
      const result = service.sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it('should block javascript: URLs', () => {
      const url = 'javascript:alert("XSS")';
      const result = service.sanitizeUrl(url);
      expect(result).toContain('unsafe');
    });

    it('should handle empty input', () => {
      const result = service.sanitizeUrl('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should sanitize valid email addresses', () => {
      const email = 'user@example.com';
      const result = service.sanitizeEmail(email);
      expect(result).toBe(email);
    });

    it('should convert email to lowercase', () => {
      const email = 'User@Example.COM';
      const result = service.sanitizeEmail(email);
      expect(result).toBe('user@example.com');
    });

    it('should remove HTML tags from email', () => {
      const malicious = 'user@example.com<script>alert(1)</script>';
      const result = service.sanitizeEmail(malicious);
      expect(result).toBe('');
    });

    it('should return empty for invalid email patterns', () => {
      const invalid = 'not-an-email';
      const result = service.sanitizeEmail(invalid);
      expect(result).toBe('');
    });

    it('should handle empty input', () => {
      const result = service.sanitizeEmail('');
      expect(result).toBe('');
    });

    it('should trim whitespace', () => {
      const email = '  user@example.com  ';
      const result = service.sanitizeEmail(email);
      expect(result).toBe('user@example.com');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path traversal attempts', () => {
      const malicious = '../../../etc/passwd';
      const result = service.sanitizeFilename(malicious);
      expect(result).toBe('passwd');
    });

    it('should remove backslashes', () => {
      const malicious = '..\\..\\..\\windows\\system32';
      const result = service.sanitizeFilename(malicious);
      expect(result).toBe('windowssystem32');
    });

    it('should replace dangerous characters with underscores', () => {
      const malicious = 'file:name&with*special?chars';
      const result = service.sanitizeFilename(malicious);
      expect(result).toBe('file_name_with_special_chars');
    });

    it('should remove leading dots', () => {
      const hidden = '...hidden-file.txt';
      const result = service.sanitizeFilename(hidden);
      expect(result).toBe('hidden-file.txt');
    });

    it('should preserve valid filenames', () => {
      const valid = 'my-document_v2.pdf';
      const result = service.sanitizeFilename(valid);
      expect(result).toBe(valid);
    });

    it('should handle empty input', () => {
      const result = service.sanitizeFilename('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    it('should respect maxLength option', () => {
      const long = 'A'.repeat(200);
      const result = service.sanitizeInput(long, { maxLength: 100 });
      expect(result.length).toBe(100);
    });

    it('should remove HTML when allowHtml is false', () => {
      const input = '<p>Hello</p>';
      const result = service.sanitizeInput(input, { allowHtml: false });
      expect(result).not.toContain('<p>');
    });

    it('should sanitize HTML when allowHtml is true', () => {
      const input = '<script>alert("XSS")</script><p>Safe</p>';
      const result = service.sanitizeInput(input, { allowHtml: true });
      expect(result).not.toContain('<script>');
      expect(result).toContain('Safe');
    });

    it('should apply character filter', () => {
      const input = 'abc123!@#';
      const result = service.sanitizeInput(input, { allowedChars: /a-z/ });
      expect(result).toBe('abc');
    });

    it('should handle empty input', () => {
      const result = service.sanitizeInput('');
      expect(result).toBe('');
    });

    it('should trim whitespace', () => {
      const input = '   Test   ';
      const result = service.sanitizeInput(input);
      expect(result).toBe('Test');
    });
  });

  describe('sanitizeSqlInput', () => {
    it('should remove single quotes', () => {
      const malicious = "'; DROP TABLE users; --";
      const result = service.sanitizeSqlInput(malicious);
      expect(result).not.toContain("'");
    });

    it('should remove double quotes', () => {
      const malicious = '"; DROP TABLE users; --';
      const result = service.sanitizeSqlInput(malicious);
      expect(result).not.toContain('"');
    });

    it('should remove semicolons', () => {
      const malicious = 'SELECT * FROM users; DROP TABLE users;';
      const result = service.sanitizeSqlInput(malicious);
      expect(result).not.toContain(';');
    });

    it('should remove SQL comments', () => {
      const malicious = 'admin -- comment';
      const result = service.sanitizeSqlInput(malicious);
      expect(result).not.toContain('--');
    });

    it('should remove block comments', () => {
      const malicious = 'admin /* comment */';
      const result = service.sanitizeSqlInput(malicious);
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
    });

    it('should handle empty input', () => {
      const result = service.sanitizeSqlInput('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeUserInput', () => {
    it('should sanitize all user fields', () => {
      const user = {
        firstName: '<script>John</script>',
        lastName: 'Doe123',
        email: 'JOHN@EXAMPLE.COM',
        avatar: 'https://example.com/avatar.jpg'
      };

      const result = service.sanitizeUserInput(user);

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should preserve user ID if provided', () => {
      const user = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      const result = service.sanitizeUserInput(user);

      expect(result.id).toBe('123');
      expect(result.firstName).toBe('John');
    });

    it('should enforce max length on names', () => {
      const user = {
        firstName: 'A'.repeat(200),
        lastName: 'B'.repeat(200),
        email: 'test@example.com'
      };

      const result = service.sanitizeUserInput(user);

      expect(result.firstName.length).toBeLessThanOrEqual(100);
      expect(result.lastName.length).toBeLessThanOrEqual(100);
    });

    it('should handle missing fields', () => {
      const user = {};
      const result = service.sanitizeUserInput(user);

      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
      expect(result.email).toBe('');
      expect(result.avatar).toBeUndefined();
    });
  });

  describe('containsXss', () => {
    it('should detect script tags', () => {
      const malicious = '<script>alert("XSS")</script>';
      expect(service.containsXss(malicious)).toBe(true);
    });

    it('should detect javascript: URLs', () => {
      const malicious = 'javascript:alert("XSS")';
      expect(service.containsXss(malicious)).toBe(true);
    });

    it('should detect event handlers', () => {
      const malicious = '<img src="x" onerror="alert(\'XSS\')">';
      expect(service.containsXss(malicious)).toBe(true);
    });

    it('should detect iframe tags', () => {
      const malicious = '<iframe src="evil.com"></iframe>';
      expect(service.containsXss(malicious)).toBe(true);
    });

    it('should detect eval calls', () => {
      const malicious = 'eval(maliciousCode)';
      expect(service.containsXss(malicious)).toBe(true);
    });

    it('should return false for safe content', () => {
      const safe = '<p>Hello World</p>';
      expect(service.containsXss(safe)).toBe(false);
    });

    it('should handle empty input', () => {
      expect(service.containsXss('')).toBe(false);
    });
  });

  describe('validateNoXss', () => {
    it('should throw error if XSS detected', () => {
      const malicious = '<script>alert("XSS")</script>';
      expect(() => service.validateNoXss(malicious, 'Test Field')).toThrow();
    });

    it('should not throw for safe content', () => {
      const safe = 'Hello World';
      expect(() => service.validateNoXss(safe, 'Test Field')).not.toThrow();
    });

    it('should include field name in error message', () => {
      const malicious = '<script>alert("XSS")</script>';
      try {
        service.validateNoXss(malicious, 'Username');
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Username');
      }
    });
  });
});
