import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { I18nService } from '../../../domain/services/i18n.service';
import { NavGraphService } from '../../../domain/services/nav-graph.service';
import { computed, signal } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockI18nService: jasmine.SpyObj<I18nService>;
  let mockNavGraph: jasmine.SpyObj<NavGraphService>;

  const mockLanguageConfig = {
    code: 'en' as const,
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  };

  beforeEach(async () => {
    mockI18nService = jasmine.createSpyObj('I18nService', ['setLanguage', 'getCurrentLanguage'], {
      currentLanguageConfig: signal(mockLanguageConfig),
      languages: [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
        { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
      ],
    });
    mockI18nService.getCurrentLanguage.and.returnValue('en');

    mockNavGraph = jasmine.createSpyObj('NavGraphService', [
      'toProfile', 'toSettings', 'toNotifications', 'toHelp', 'toHome'
    ]);
    mockNavGraph.toProfile.and.returnValue(Promise.resolve(true));
    mockNavGraph.toSettings.and.returnValue(Promise.resolve(true));
    mockNavGraph.toNotifications.and.returnValue(Promise.resolve(true));
    mockNavGraph.toHelp.and.returnValue(Promise.resolve(true));
    mockNavGraph.toHome.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: NavGraphService, useValue: mockNavGraph },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('events', () => {
    it('should emit sidebarToggle when onSidebarToggle is called', () => {
      spyOn(component.sidebarToggle, 'emit');
      component.onSidebarToggle();
      expect(component.sidebarToggle.emit).toHaveBeenCalled();
    });

    it('should emit rightPanelToggle when onRightPanelToggle is called', () => {
      spyOn(component.rightPanelToggle, 'emit');
      component.onRightPanelToggle();
      expect(component.rightPanelToggle.emit).toHaveBeenCalled();
    });
  });

  describe('user menu actions', () => {
    it('should navigate to profile on profile action', () => {
      component.onUserMenuAction('profile');
      expect(mockNavGraph.toProfile).toHaveBeenCalled();
    });

    it('should navigate to settings on settings action', () => {
      component.onUserMenuAction('settings');
      expect(mockNavGraph.toSettings).toHaveBeenCalled();
    });

    it('should navigate to notifications on notifications action', () => {
      component.onUserMenuAction('notifications');
      expect(mockNavGraph.toNotifications).toHaveBeenCalled();
    });

    it('should navigate to help on help action', () => {
      component.onUserMenuAction('help');
      expect(mockNavGraph.toHelp).toHaveBeenCalled();
    });

    it('should navigate to home on logout action', () => {
      component.onUserMenuAction('logout');
      expect(mockNavGraph.toHome).toHaveBeenCalled();
    });

    it('should not throw on unknown action', () => {
      expect(() => component.onUserMenuAction('unknown')).not.toThrow();
    });
  });

  describe('changeLanguage()', () => {
    it('should call i18nService.setLanguage with the language code', () => {
      component.changeLanguage({ code: 'zh', name: '简体中文', flag: '🇨🇳' });
      expect(mockI18nService.setLanguage).toHaveBeenCalledWith('zh');
    });

    it('should call setLanguage with English code', () => {
      component.changeLanguage({ code: 'en', name: 'English', flag: '🇺🇸' });
      expect(mockI18nService.setLanguage).toHaveBeenCalledWith('en');
    });
  });

  describe('data', () => {
    it('should have languages list', () => {
      expect(component.languages.length).toBeGreaterThan(0);
    });

    it('should have userMenuActions', () => {
      expect(component.userMenuActions.length).toBeGreaterThan(0);
    });

    it('should have currentUser defined', () => {
      expect(component.currentUser).toBeDefined();
      expect(component.currentUser.name).toBe('John Doe');
      expect(component.currentUser.email).toBe('john.doe@example.com');
    });

    it('should have logout action with divider', () => {
      const logout = component.userMenuActions.find(a => a.action === 'logout');
      expect(logout).toBeDefined();
      expect(logout?.divider).toBe(true);
    });
  });

  describe('currentLanguage computed', () => {
    it('should compute current language from I18nService', () => {
      const lang = component.currentLanguage();
      expect(lang.code).toBe('en');
      expect(lang.flag).toBe('🇺🇸');
    });
  });
});
