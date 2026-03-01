import { TestBed } from '@angular/core/testing';
import { Route } from '@angular/router';
import { of } from 'rxjs';
import { PreloadAllModulesStrategy, SelectivePreloadingStrategy } from './preload-all-modules.strategy';

describe('PreloadAllModulesStrategy', () => {
  let strategy: PreloadAllModulesStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreloadAllModulesStrategy]
    });
    strategy = TestBed.inject(PreloadAllModulesStrategy);
  });

  it('should be created', () => {
    expect(strategy).toBeTruthy();
  });

  it('should preload all routes by calling load()', (done) => {
    const mockRoute: Route = { path: 'users' };
    const loadFn = jasmine.createSpy('load').and.returnValue(of('module'));

    strategy.preload(mockRoute, loadFn).subscribe(result => {
      expect(loadFn).toHaveBeenCalled();
      expect(result).toBe('module');
      done();
    });
  });

  it('should preload routes without preload data', (done) => {
    const mockRoute: Route = { path: 'settings', data: {} };
    const loadFn = jasmine.createSpy('load').and.returnValue(of('settingsModule'));

    strategy.preload(mockRoute, loadFn).subscribe(result => {
      expect(loadFn).toHaveBeenCalled();
      expect(result).toBe('settingsModule');
      done();
    });
  });
});

describe('SelectivePreloadingStrategy', () => {
  let strategy: SelectivePreloadingStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SelectivePreloadingStrategy]
    });
    strategy = TestBed.inject(SelectivePreloadingStrategy);
  });

  it('should be created', () => {
    expect(strategy).toBeTruthy();
  });

  it('should preload routes with data.preload = true', (done) => {
    const mockRoute: Route = { path: 'users', data: { preload: true } };
    const loadFn = jasmine.createSpy('load').and.returnValue(of('usersModule'));

    strategy.preload(mockRoute, loadFn).subscribe(result => {
      expect(loadFn).toHaveBeenCalled();
      expect(result).toBe('usersModule');
      done();
    });
  });

  it('should NOT preload routes without preload flag', (done) => {
    const mockRoute: Route = { path: 'settings' };
    const loadFn = jasmine.createSpy('load').and.returnValue(of('settingsModule'));

    strategy.preload(mockRoute, loadFn).subscribe(result => {
      expect(loadFn).not.toHaveBeenCalled();
      expect(result).toBeNull();
      done();
    });
  });

  it('should NOT preload routes with data.preload = false', (done) => {
    const mockRoute: Route = { path: 'admin', data: { preload: false } };
    const loadFn = jasmine.createSpy('load').and.returnValue(of('adminModule'));

    strategy.preload(mockRoute, loadFn).subscribe(result => {
      expect(loadFn).not.toHaveBeenCalled();
      expect(result).toBeNull();
      done();
    });
  });

  it('should NOT preload routes with empty data object', (done) => {
    const mockRoute: Route = { path: 'dashboard', data: {} };
    const loadFn = jasmine.createSpy('load').and.returnValue(of('dashboardModule'));

    strategy.preload(mockRoute, loadFn).subscribe(result => {
      expect(loadFn).not.toHaveBeenCalled();
      expect(result).toBeNull();
      done();
    });
  });
});
