import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SidebarComponent } from './sidebar.component';
import { SidebarViewModel } from './sidebar.view-model';
import { I18nService } from '../../../domain/services/i18n.service';
import { of, throwError } from 'rxjs';
import { signal, computed } from '@angular/core';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockViewModel: jasmine.SpyObj<SidebarViewModel>;
  let mockI18nService: jasmine.SpyObj<I18nService>;

  beforeEach(async () => {
    // Create mock ViewModel with Input/Output/Effect structure
    const userCountSignal = signal(5);
    const isLoadingSignal = signal(false);

    mockViewModel = jasmine.createSpyObj('SidebarViewModel', [], {
      input: {
        refresh: jasmine.createSpy('refresh')
      },
      output: {
        userCount: computed(() => userCountSignal()),
        isLoading: computed(() => isLoadingSignal()),
        userBadge: computed(() => {
          const count = userCountSignal();
          return count > 0 ? count.toString() : undefined;
        })
      },
      effect$: {
        loadError$: of()
      }
    });

    // Create mock I18nService
    mockI18nService = jasmine.createSpyObj('I18nService', ['translate', 'getCurrentLanguage', 'setLanguage']);
    mockI18nService.translate.and.returnValue('Translated Text');
    mockI18nService.getCurrentLanguage.and.returnValue('en');

    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: I18nService, useValue: mockI18nService }
      ]
    })
    .overrideComponent(SidebarComponent, {
      set: {
        providers: [
          { provide: SidebarViewModel, useValue: mockViewModel }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject ViewModel', () => {
      expect(component.viewModel).toBe(mockViewModel);
    });

    it('should inject I18nService', () => {
      expect(component.i18nService).toBe(mockI18nService);
    });

    it('should have default collapsed state as false', () => {
      expect(component.collapsed).toBe(false);
    });

    it('should have default mobileOpen state as false', () => {
      expect(component.mobileOpen).toBe(false);
    });

    it('should initialize expandedMenuId as null', () => {
      expect(component.expandedMenuId()).toBeNull();
    });
  });

  describe('Menu Items', () => {
    it('should have predefined menu items', () => {
      expect(component.menuItems).toBeDefined();
      expect(component.menuItems.length).toBeGreaterThan(0);
    });

    it('should have menu items with required properties', () => {
      component.menuItems.forEach(item => {
        expect(item.id).toBeDefined();
        expect(item.icon).toBeDefined();
        expect(item.labelKey).toBeDefined();
      });
    });

    it('should include users menu item', () => {
      const usersItem = component.menuItems.find(item => item.id === 'users');
      expect(usersItem).toBeDefined();
      expect(usersItem?.route).toBe('/users');
    });

    it('should include home menu item', () => {
      const homeItem = component.menuItems.find(item => item.id === 'home');
      expect(homeItem).toBeDefined();
      expect(homeItem?.route).toBe('/home');
    });

    it('should include menu items with children', () => {
      const projectsItem = component.menuItems.find(item => item.id === 'projects');
      expect(projectsItem).toBeDefined();
      expect(projectsItem?.children).toBeDefined();
      expect(projectsItem?.children?.length).toBeGreaterThan(0);
    });
  });

  describe('ViewModel Integration', () => {
    it('should access user badge from ViewModel output', () => {
      const usersItem = component.menuItems.find(item => item.id === 'users');
      const badge = component.getUserBadge(usersItem!);

      expect(badge).toBe('5');
      expect(mockViewModel.output.userBadge).toBeDefined();
    });

    it('should return undefined badge when user count is 0', () => {
      // Update the mock to return 0
      const userCountSignal = signal(0);
      (mockViewModel.output as any).userBadge = computed(() => {
        const count = userCountSignal();
        return count > 0 ? count.toString() : undefined;
      });

      const usersItem = component.menuItems.find(item => item.id === 'users');
      const badge = component.getUserBadge(usersItem!);

      expect(badge).toBeUndefined();
    });

    it('should return item badge for non-users menu items', () => {
      const messagesItem = component.menuItems.find(item => item.id === 'messages');
      const badge = component.getUserBadge(messagesItem!);

      expect(badge).toBe(messagesItem?.badge);
    });
  });

  describe('Menu Item Expansion', () => {
    it('should expand menu item when toggleMenuItem is called', () => {
      const projectsItem = component.menuItems.find(item => item.id === 'projects')!;

      component.toggleMenuItem(projectsItem);

      expect(component.expandedMenuId()).toBe('projects');
      expect(component.isMenuExpanded(projectsItem)).toBe(true);
    });

    it('should collapse menu item when toggleMenuItem is called twice', () => {
      const projectsItem = component.menuItems.find(item => item.id === 'projects')!;

      component.toggleMenuItem(projectsItem);
      expect(component.expandedMenuId()).toBe('projects');

      component.toggleMenuItem(projectsItem);
      expect(component.expandedMenuId()).toBeNull();
      expect(component.isMenuExpanded(projectsItem)).toBe(false);
    });

    it('should only allow one expanded menu at a time', () => {
      const projectsItem = component.menuItems.find(item => item.id === 'projects')!;
      const tasksItem = component.menuItems.find(item => item.id === 'tasks')!;

      component.toggleMenuItem(projectsItem);
      expect(component.expandedMenuId()).toBe('projects');

      component.toggleMenuItem(tasksItem);
      expect(component.expandedMenuId()).toBe('tasks');
      expect(component.isMenuExpanded(projectsItem)).toBe(false);
      expect(component.isMenuExpanded(tasksItem)).toBe(true);
    });

    it('should not expand menu items without children', () => {
      const homeItem = component.menuItems.find(item => item.id === 'home')!;
      const initialState = component.expandedMenuId();

      component.toggleMenuItem(homeItem);

      expect(component.expandedMenuId()).toBe(initialState);
    });
  });

  describe('Menu Item Click Handling', () => {
    it('should toggle menu when item with children is clicked', () => {
      const projectsItem = component.menuItems.find(item => item.id === 'projects')!;
      spyOn(component, 'toggleMenuItem');

      component.onMenuItemClick(projectsItem);

      expect(component.toggleMenuItem).toHaveBeenCalledWith(projectsItem);
    });

    it('should not toggle menu when item without children is clicked', () => {
      const homeItem = component.menuItems.find(item => item.id === 'home')!;
      spyOn(component, 'toggleMenuItem');

      component.onMenuItemClick(homeItem);

      expect(component.toggleMenuItem).not.toHaveBeenCalled();
    });
  });

  describe('User Status', () => {
    it('should return correct class for online status', () => {
      const statusClass = component.getStatusClass('online');
      expect(statusClass).toBe('status-online');
    });

    it('should return correct class for away status', () => {
      const statusClass = component.getStatusClass('away');
      expect(statusClass).toBe('status-away');
    });

    it('should return correct class for busy status', () => {
      const statusClass = component.getStatusClass('busy');
      expect(statusClass).toBe('status-busy');
    });

    it('should return correct class for offline status', () => {
      const statusClass = component.getStatusClass('offline');
      expect(statusClass).toBe('status-offline');
    });

    it('should return offline class for unknown status', () => {
      const statusClass = component.getStatusClass('unknown');
      expect(statusClass).toBe('status-offline');
    });
  });

  describe('Current User', () => {
    it('should have current user data', () => {
      expect(component.currentUser).toBeDefined();
      expect(component.currentUser.name).toBe('John Doe');
      expect(component.currentUser.email).toBe('john.doe@example.com');
      expect(component.currentUser.role).toBe('Administrator');
      expect(component.currentUser.status).toBe('online');
    });
  });

  describe('OnPush Change Detection', () => {
    it('should detect changes when ViewModel output changes', () => {
      fixture.detectChanges();

      const userCountSignal = signal(10);
      (mockViewModel.output as any).userBadge = computed(() => {
        const count = userCountSignal();
        return count > 0 ? count.toString() : undefined;
      });

      fixture.detectChanges();

      const usersItem = component.menuItems.find(item => item.id === 'users');
      const badge = component.getUserBadge(usersItem!);
      expect(badge).toBe('10');
    });

    it('should work with signal-based expandedMenuId', () => {
      const projectsItem = component.menuItems.find(item => item.id === 'projects')!;

      expect(component.isMenuExpanded(projectsItem)).toBe(false);

      component.expandedMenuId.set('projects');
      fixture.detectChanges();

      expect(component.isMenuExpanded(projectsItem)).toBe(true);
    });
  });

  describe('Input Properties', () => {
    it('should accept collapsed input', () => {
      component.collapsed = true;
      fixture.detectChanges();

      expect(component.collapsed).toBe(true);
    });

    it('should accept mobileOpen input', () => {
      component.mobileOpen = true;
      fixture.detectChanges();

      expect(component.mobileOpen).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should be defined', () => {
      expect(component.ngOnInit).toBeDefined();
    });
  });
});
