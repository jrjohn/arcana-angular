import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavGraphService } from './nav-graph.service';
import { User } from '../entities/user.model';

describe('NavGraphService', () => {
  let service: NavGraphService;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], { url: '/home' });
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        NavGraphService,
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(NavGraphService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('toHome', () => {
    it('should navigate to /home', async () => {
      await service.toHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home'], undefined);
    });

    it('should pass NavigationExtras', async () => {
      const extras = { queryParams: { foo: 'bar' } };
      await service.toHome(extras);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home'], extras);
    });
  });

  describe('users navigation', () => {
    it('toList should navigate to /users', async () => {
      await service.users.toList();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users'], undefined);
    });

    it('toDetail should navigate to /users/:id', async () => {
      await service.users.toDetail('42');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users', '42'], undefined);
    });

    it('toUserDetail should navigate using user.id', async () => {
      const user: User = { id: '99', firstName: 'John', lastName: 'Doe', email: 'j@test.com', createdAt: new Date(), updatedAt: new Date() };
      await service.users.toUserDetail(user);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users', '99'], undefined);
    });

    it('toCreate should navigate to /users/new', async () => {
      await service.users.toCreate();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users', 'new'], undefined);
    });

    it('toEdit should navigate to /users/:id/edit', async () => {
      await service.users.toEdit('5');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users', '5', 'edit'], undefined);
    });

    it('toUserEdit should navigate using user.id', async () => {
      const user: User = { id: '7', firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com', createdAt: new Date(), updatedAt: new Date() };
      await service.users.toUserEdit(user);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users', '7', 'edit'], undefined);
    });
  });

  describe('other navigations', () => {
    it('toCalendar should navigate to /calendar', async () => {
      await service.toCalendar();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/calendar'], undefined);
    });

    it('toMessages should navigate to /messages', async () => {
      await service.toMessages();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/messages'], undefined);
    });

    it('toDocuments should navigate to /documents', async () => {
      await service.toDocuments();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/documents'], undefined);
    });

    it('toProfile should navigate to /profile', async () => {
      await service.toProfile();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile'], undefined);
    });

    it('toSettings should navigate to /settings', async () => {
      await service.toSettings();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/settings'], undefined);
    });

    it('toNotifications should navigate to /notifications', async () => {
      await service.toNotifications();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/notifications'], undefined);
    });

    it('toHelp should navigate to /help', async () => {
      await service.toHelp();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/help'], undefined);
    });
  });

  describe('projects navigation', () => {
    it('toList should navigate to /projects', async () => {
      await service.projects.toList();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects'], undefined);
    });

    it('toCreate should navigate to /projects/new', async () => {
      await service.projects.toCreate();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects', 'new'], undefined);
    });

    it('toArchived should navigate to /projects/archived', async () => {
      await service.projects.toArchived();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects', 'archived'], undefined);
    });
  });

  describe('tasks navigation', () => {
    it('toMy should navigate to /tasks/my', async () => {
      await service.tasks.toMy();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tasks', 'my'], undefined);
    });

    it('toRecent should navigate to /tasks/recent', async () => {
      await service.tasks.toRecent();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tasks', 'recent'], undefined);
    });

    it('toImportant should navigate to /tasks/important', async () => {
      await service.tasks.toImportant();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tasks', 'important'], undefined);
    });
  });

  describe('analytics navigation', () => {
    it('toOverview should navigate to /analytics/overview', async () => {
      await service.analytics.toOverview();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/analytics', 'overview'], undefined);
    });

    it('toReports should navigate to /analytics/reports', async () => {
      await service.analytics.toReports();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/analytics', 'reports'], undefined);
    });

    it('toPerformance should navigate to /analytics/performance', async () => {
      await service.analytics.toPerformance();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/analytics', 'performance'], undefined);
    });
  });

  describe('toPath', () => {
    it('should navigate to a string path', async () => {
      await service.toPath('/custom/path');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/custom/path'], undefined);
    });

    it('should navigate to array path', async () => {
      await service.toPath(['/custom', 'path', '123']);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/custom', 'path', '123'], undefined);
    });
  });

  describe('getCurrentUrl', () => {
    it('should return current router url', () => {
      expect(service.getCurrentUrl()).toBe('/home');
    });
  });

  describe('isActiveRoute', () => {
    it('should return true when url starts with route', () => {
      (mockRouter as any).url = '/home/dashboard';
      expect(service.isActiveRoute('/home')).toBe(true);
    });

    it('should return false when url does not start with route', () => {
      (mockRouter as any).url = '/users';
      expect(service.isActiveRoute('/home')).toBe(false);
    });
  });
});
