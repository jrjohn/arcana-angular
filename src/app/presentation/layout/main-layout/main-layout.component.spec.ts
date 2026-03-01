import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { of } from 'rxjs';
import { MainLayoutComponent } from './main-layout.component';
import { BreakpointObserver } from '@angular/cdk/layout';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  const makeBreakpointResult = (matches: boolean) => ({ matches, breakpoints: {} });

  beforeEach(async () => {
    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    mockBreakpointObserver.observe.and.returnValue(of(makeBreakpointResult(false)));

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
      ],
    })
    // Override child component imports to avoid their DI dependencies
    .overrideComponent(MainLayoutComponent, {
      set: {
        imports: [CommonModule, RouterOutlet],
        template: '<router-outlet></router-outlet>',
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with sidebar not collapsed', () => {
    expect(component.sidebarCollapsed()).toBe(false);
  });

  it('should initialize with right panel closed', () => {
    expect(component.rightPanelOpen()).toBe(false);
  });

  describe('toggleSidebar on desktop', () => {
    it('should toggle sidebarCollapsed', () => {
      component.toggleSidebar();
      expect(component.sidebarCollapsed()).toBe(true);
      component.toggleSidebar();
      expect(component.sidebarCollapsed()).toBe(false);
    });
  });

  describe('toggleSidebar on mobile', () => {
    beforeEach(() => {
      mockBreakpointObserver.observe.and.returnValue(of(makeBreakpointResult(true)));
      component.ngOnInit();
    });

    it('should toggle sidebarMobileOpen', () => {
      component.toggleSidebar();
      expect(component.sidebarMobileOpen()).toBe(true);
      component.toggleSidebar();
      expect(component.sidebarMobileOpen()).toBe(false);
    });
  });

  it('should close mobile sidebar when switching to desktop', () => {
    mockBreakpointObserver.observe.and.returnValue(of(makeBreakpointResult(true)));
    component.ngOnInit();
    component.toggleSidebar();
    expect(component.sidebarMobileOpen()).toBe(true);

    mockBreakpointObserver.observe.and.returnValue(of(makeBreakpointResult(false)));
    component.ngOnInit();
    expect(component.sidebarMobileOpen()).toBe(false);
  });

  describe('toggleRightPanel', () => {
    it('should toggle rightPanelOpen', () => {
      component.toggleRightPanel();
      expect(component.rightPanelOpen()).toBe(true);
      component.toggleRightPanel();
      expect(component.rightPanelOpen()).toBe(false);
    });
  });

  describe('closeRightPanel', () => {
    it('should close right panel', () => {
      component.toggleRightPanel();
      component.closeRightPanel();
      expect(component.rightPanelOpen()).toBe(false);
    });
  });

  describe('closeSidebar', () => {
    it('should close mobile sidebar', () => {
      component.sidebarMobileOpen.set(true);
      component.closeSidebar();
      expect(component.sidebarMobileOpen()).toBe(false);
    });
  });

  it('should unsubscribe on destroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
