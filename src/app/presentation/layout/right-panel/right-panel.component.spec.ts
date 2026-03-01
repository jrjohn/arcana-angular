import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RightPanelComponent } from './right-panel.component';

describe('RightPanelComponent', () => {
  let component: RightPanelComponent;
  let fixture: ComponentFixture<RightPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RightPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with active tab 1', () => {
    expect(component.activeTab()).toBe(1);
  });

  it('should have activities', () => {
    expect(component.activities().length).toBeGreaterThan(0);
  });

  it('should have notifications', () => {
    expect(component.notifications().length).toBeGreaterThan(0);
  });

  describe('onClose', () => {
    it('should emit close event', () => {
      spyOn(component.close, 'emit');
      component.onClose();
      expect(component.close.emit).toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', () => {
      const notification = component.notifications()[0];
      notification.read = false;
      component.markAsRead(notification);
      expect(notification.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      component.markAllAsRead();
      const allRead = component.notifications().every(n => n.read);
      expect(allRead).toBe(true);
    });
  });

  describe('clearActivities', () => {
    it('should clear all activities', () => {
      component.clearActivities();
      expect(component.activities().length).toBe(0);
    });
  });

  describe('getActivityTypeClass', () => {
    it('should return correct class for info', () => {
      expect(component.getActivityTypeClass('info')).toBe('text-info');
    });
    it('should return correct class for success', () => {
      expect(component.getActivityTypeClass('success')).toBe('text-success');
    });
    it('should return correct class for warning', () => {
      expect(component.getActivityTypeClass('warning')).toBe('text-warning');
    });
    it('should return correct class for danger', () => {
      expect(component.getActivityTypeClass('danger')).toBe('text-danger');
    });
    it('should return fallback for unknown type', () => {
      expect(component.getActivityTypeClass('unknown')).toBe('text-secondary');
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', () => {
      const unread = component.notifications().filter(n => !n.read).length;
      expect(component.getUnreadCount()).toBe(unread);
    });

    it('should return 0 after markAllAsRead', () => {
      component.markAllAsRead();
      expect(component.getUnreadCount()).toBe(0);
    });
  });
});
