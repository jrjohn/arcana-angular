import { TestBed } from '@angular/core/testing';
import { I18nService, Language } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [I18nService],
    });

    service = TestBed.inject(I18nService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should default to English', () => {
    expect(service.getCurrentLanguage()).toBe('en');
  });

  it('should have languages list', () => {
    expect(service.languages.length).toBeGreaterThan(0);
  });

  it('should include English in languages', () => {
    const en = service.languages.find(l => l.code === 'en');
    expect(en).toBeDefined();
    expect(en?.name).toBe('English');
  });

  it('should include Chinese in languages', () => {
    const zh = service.languages.find(l => l.code === 'zh');
    expect(zh).toBeDefined();
  });

  it('should include Spanish in languages', () => {
    const es = service.languages.find(l => l.code === 'es');
    expect(es).toBeDefined();
  });

  describe('translate()', () => {
    it('should translate a known English key', () => {
      service.setLanguage('en');
      expect(service.translate('common.save')).toBe('Save');
    });

    it('should translate common.cancel to Cancel in English', () => {
      service.setLanguage('en');
      expect(service.translate('common.cancel')).toBe('Cancel');
    });

    it('should return key for unknown translation', () => {
      const result = service.translate('unknown.key.xyz');
      expect(result).toBe('unknown.key.xyz');
    });

    it('should interpolate single parameter', () => {
      service.setLanguage('en');
      const result = service.translate('user.created.success', { name: 'John' });
      expect(result).toContain('John');
    });

    it('should interpolate multiple parameters', () => {
      service.setLanguage('en');
      const result = service.translate('user.list.showing', { start: 1, end: 10, total: 100 });
      expect(result).toContain('1');
      expect(result).toContain('10');
      expect(result).toContain('100');
    });

    it('should translate to Chinese when language is zh', () => {
      service.setLanguage('zh');
      const result = service.translate('common.save');
      expect(result).toBe('保存');
    });

    it('should translate to Traditional Chinese', () => {
      service.setLanguage('zh-TW');
      const result = service.translate('common.save');
      expect(result).toBe('保存');
    });
  });

  describe('t() shorthand', () => {
    it('should behave the same as translate()', () => {
      service.setLanguage('en');
      expect(service.t('common.save')).toBe(service.translate('common.save'));
    });

    it('should pass params', () => {
      service.setLanguage('en');
      const params = { name: 'Alice' };
      expect(service.t('user.created.success', params)).toBe(service.translate('user.created.success', params));
    });
  });

  describe('setLanguage()', () => {
    it('should change language to Chinese', () => {
      service.setLanguage('zh');
      expect(service.getCurrentLanguage()).toBe('zh');
    });

    it('should persist language to localStorage', () => {
      service.setLanguage('es');
      expect(localStorage.getItem('arcana_language')).toBe('es');
    });

    it('should update currentLanguage signal', () => {
      service.setLanguage('fr');
      expect(service.currentLanguage()).toBe('fr');
    });

    it('should update currentLanguageConfig signal', () => {
      service.setLanguage('de');
      const config = service.currentLanguageConfig();
      expect(config.code).toBe('de');
    });
  });

  describe('currentLanguageConfig', () => {
    it('should return config for English', () => {
      service.setLanguage('en');
      const config = service.currentLanguageConfig();
      expect(config.flag).toBe('🇺🇸');
    });

    it('should return config for Chinese', () => {
      service.setLanguage('zh');
      const config = service.currentLanguageConfig();
      expect(config.flag).toBe('🇨🇳');
    });
  });

  describe('localStorage persistence', () => {
    it('should restore language from localStorage on initialization', () => {
      localStorage.setItem('arcana_language', 'fr');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [I18nService] });
      const newService = TestBed.inject(I18nService);
      expect(newService.getCurrentLanguage()).toBe('fr');
    });

    it('should default to English if stored language is invalid', () => {
      localStorage.setItem('arcana_language', 'invalid_lang');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [I18nService] });
      const newService = TestBed.inject(I18nService);
      expect(newService.getCurrentLanguage()).toBe('en');
    });
  });

  describe('error message keys', () => {
    it('should translate error.network in English', () => {
      service.setLanguage('en');
      const result = service.translate('error.network');
      expect(result).toBeTruthy();
      expect(result).not.toBe('error.network');
    });

    it('should translate error.not.found in English', () => {
      service.setLanguage('en');
      const result = service.translate('error.not.found');
      expect(result).toBeTruthy();
      expect(result).not.toBe('error.not.found');
    });
  });
});
