import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('stats', () => {
    it('should have stats signal defined', () => {
      expect(component.stats).toBeDefined();
    });

    it('should have 4 stat cards', () => {
      expect(component.stats().length).toBe(4);
    });

    it('should have Total Users stat card', () => {
      const usersCard = component.stats().find(s => s.title === 'Total Users');
      expect(usersCard).toBeDefined();
      expect(usersCard?.value).toBe('1,234');
    });

    it('should have Active Projects stat card', () => {
      const projectsCard = component.stats().find(s => s.title === 'Active Projects');
      expect(projectsCard).toBeDefined();
      expect(projectsCard?.value).toBe('42');
    });

    it('should have Pending Tasks stat card with decrease change type', () => {
      const tasksCard = component.stats().find(s => s.title === 'Pending Tasks');
      expect(tasksCard).toBeDefined();
      expect(tasksCard?.changeType).toBe('decrease');
    });

    it('should have Messages stat card with increase change type', () => {
      const msgCard = component.stats().find(s => s.title === 'Messages');
      expect(msgCard).toBeDefined();
      expect(msgCard?.changeType).toBe('increase');
    });

    it('each stat card should have icon and iconClass', () => {
      component.stats().forEach(stat => {
        expect(stat.icon).toBeTruthy();
        expect(stat.iconClass).toBeTruthy();
      });
    });
  });

  describe('quickActions', () => {
    it('should have quickActions signal defined', () => {
      expect(component.quickActions).toBeDefined();
    });

    it('should have 4 quick actions', () => {
      expect(component.quickActions().length).toBe(4);
    });

    it('should have Create User action', () => {
      const action = component.quickActions().find(a => a.title === 'Create User');
      expect(action).toBeDefined();
      expect(action?.route).toBe('/users/new');
    });

    it('should have New Project action', () => {
      const action = component.quickActions().find(a => a.title === 'New Project');
      expect(action).toBeDefined();
    });

    it('each action should have icon, title, description, route, color', () => {
      component.quickActions().forEach(action => {
        expect(action.icon).toBeTruthy();
        expect(action.title).toBeTruthy();
        expect(action.description).toBeTruthy();
        expect(action.route).toBeTruthy();
        expect(action.color).toBeTruthy();
      });
    });
  });

  describe('recentActivities', () => {
    it('should have recentActivities signal defined', () => {
      expect(component.recentActivities).toBeDefined();
    });

    it('should have 4 recent activities', () => {
      expect(component.recentActivities().length).toBe(4);
    });

    it('each activity should have id, user, action, target, time, avatar', () => {
      component.recentActivities().forEach(activity => {
        expect(activity.id).toBeDefined();
        expect(activity.user).toBeTruthy();
        expect(activity.action).toBeTruthy();
        expect(activity.target).toBeTruthy();
        expect(activity.time).toBeTruthy();
        expect(activity.avatar).toBeTruthy();
      });
    });

    it('should have John Doe in first activity', () => {
      const first = component.recentActivities()[0];
      expect(first.user).toBe('John Doe');
    });
  });
});
