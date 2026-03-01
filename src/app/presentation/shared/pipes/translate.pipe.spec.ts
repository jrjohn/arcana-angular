import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { I18nService } from '../../../domain/services/i18n.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let mockI18nService: jasmine.SpyObj<I18nService>;

  beforeEach(() => {
    mockI18nService = jasmine.createSpyObj('I18nService', ['translate', 'getCurrentLanguage']);
    mockI18nService.getCurrentLanguage.and.returnValue('en');
    mockI18nService.translate.and.callFake((key: string, params?: Record<string, string | number>) => {
      if (key === 'common.save') return 'Save';
      if (key === 'greeting') return `Hello, ${params?.['name']}!`;
      return key;
    });

    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        { provide: I18nService, useValue: mockI18nService },
      ],
    });

    pipe = TestBed.inject(TranslatePipe);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should translate a key', () => {
    const result = pipe.transform('common.save');
    expect(result).toBe('Save');
  });

  it('should call i18n.translate with the key', () => {
    pipe.transform('common.save');
    expect(mockI18nService.translate).toHaveBeenCalledWith('common.save', undefined);
  });

  it('should pass params to i18n.translate', () => {
    const params = { name: 'John' };
    pipe.transform('greeting', params);
    expect(mockI18nService.translate).toHaveBeenCalledWith('greeting', params);
  });

  it('should interpolate parameters', () => {
    const result = pipe.transform('greeting', { name: 'John' });
    expect(result).toBe('Hello, John!');
  });

  it('should return the key when translation not found', () => {
    mockI18nService.translate.and.returnValue('unknown.key');
    const result = pipe.transform('unknown.key');
    expect(result).toBe('unknown.key');
  });

  it('should use cache when key, params, and language are the same', () => {
    pipe.transform('common.save');
    pipe.transform('common.save');
    // translate called twice (first call and cache-busted second call for same key/params/lang)
    expect(mockI18nService.translate).toHaveBeenCalledTimes(1);
  });

  it('should re-translate when language changes', () => {
    pipe.transform('common.save');
    mockI18nService.getCurrentLanguage.and.returnValue('zh');
    mockI18nService.translate.and.returnValue('保存');
    const result = pipe.transform('common.save');
    expect(result).toBe('保存');
  });

  it('should re-translate when key changes', () => {
    pipe.transform('common.save');
    mockI18nService.translate.and.returnValue('Cancel');
    const result = pipe.transform('common.cancel');
    expect(result).toBe('Cancel');
  });
});
