import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OfflineSyncService } from './offline-sync.service';
import { NetworkStatusService } from '../../domain/services/network-status.service';
import { IndexedDbService, PendingOperation } from '../storage/indexed-db.service';
import { ApiService } from '../api/api.service';
import { User } from '../../domain/entities/user.model';

describe('OfflineSyncService', () => {
  let service: OfflineSyncService;
  let mockNetworkStatus: jasmine.SpyObj<NetworkStatusService>;
  let mockIndexedDb: jasmine.SpyObj<IndexedDbService>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  const mockUser: User = {
    id: '42',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    avatar: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockApiResponse = {
    id: '42',
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice@example.com',
    avatar: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const makePendingOp = (overrides: Partial<PendingOperation> = {}): PendingOperation => ({
    id: 1,
    type: 'update',
    entityType: 'user',
    entityId: '42',
    data: mockUser,
    timestamp: new Date(),
    retryCount: 0,
    ...overrides,
  });

  beforeEach(() => {
    mockNetworkStatus = jasmine.createSpyObj<NetworkStatusService>(
      'NetworkStatusService',
      [],
      { isOffline: false }
    );
    // isOnline is a signal - mock as a function returning true
    (mockNetworkStatus as any).isOnline = jasmine.createSpy('isOnline').and.returnValue(true);

    mockIndexedDb = jasmine.createSpyObj('IndexedDbService', [
      'getPendingOperations', 'deletePendingOperation', 'incrementRetryCount',
      'deleteUser', 'saveUser', 'getAllUsers', 'getUserById', 'addPendingOperation'
    ]);
    mockApiService = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);

    mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([]));
    mockIndexedDb.deletePendingOperation.and.returnValue(Promise.resolve());
    mockIndexedDb.incrementRetryCount.and.returnValue(Promise.resolve());
    mockIndexedDb.deleteUser.and.returnValue(Promise.resolve());
    mockIndexedDb.saveUser.and.returnValue(Promise.resolve('42'));

    TestBed.configureTestingModule({
      providers: [
        OfflineSyncService,
        { provide: NetworkStatusService, useValue: mockNetworkStatus },
        { provide: IndexedDbService, useValue: mockIndexedDb },
        { provide: ApiService, useValue: mockApiService },
      ],
    });

    service = TestBed.inject(OfflineSyncService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('isSyncInProgress', () => {
    it('should initially be false', () => {
      expect(service.isSyncInProgress).toBe(false);
    });
  });

  describe('getPendingOperationsCount', () => {
    it('should return 0 when no pending ops', async () => {
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([]));
      const count = await service.getPendingOperationsCount();
      expect(count).toBe(0);
    });

    it('should return count of pending ops', async () => {
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([
        makePendingOp(), makePendingOp({ id: 2 })
      ]));
      const count = await service.getPendingOperationsCount();
      expect(count).toBe(2);
    });
  });

  describe('syncPendingOperations', () => {
    it('should return early when offline', async () => {
      Object.defineProperty(mockNetworkStatus, 'isOffline', { get: () => true, configurable: true });
      await service.syncPendingOperations();
      expect(mockIndexedDb.getPendingOperations).not.toHaveBeenCalled();
    });

    it('should do nothing when no pending operations', async () => {
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([]));
      await service.syncPendingOperations();
      expect(mockIndexedDb.deletePendingOperation).not.toHaveBeenCalled();
    });

    it('should sync update operations and remove them on success', async () => {
      const op = makePendingOp({ type: 'update' });
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([op]));
      mockApiService.put.and.returnValue(of(mockApiResponse));
      await service.syncPendingOperations();
      expect(mockApiService.put).toHaveBeenCalled();
      expect(mockIndexedDb.deletePendingOperation).toHaveBeenCalledWith(1);
    });

    it('should sync create operations', async () => {
      const op = makePendingOp({ type: 'create' });
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([op]));
      mockApiService.post.and.returnValue(of({ ...mockApiResponse, id: '99' }));
      await service.syncPendingOperations();
      expect(mockApiService.post).toHaveBeenCalled();
      expect(mockIndexedDb.deletePendingOperation).toHaveBeenCalledWith(1);
    });

    it('should sync delete operations', async () => {
      const op = makePendingOp({ type: 'delete' });
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([op]));
      mockApiService.delete.and.returnValue(of(undefined));
      await service.syncPendingOperations();
      expect(mockApiService.delete).toHaveBeenCalled();
      expect(mockIndexedDb.deletePendingOperation).toHaveBeenCalledWith(1);
    });

    it('should handle 404 on delete gracefully', async () => {
      const op = makePendingOp({ type: 'delete' });
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([op]));
      mockApiService.delete.and.returnValue(throwError(() => ({ status: 404 })));
      await service.syncPendingOperations();
      expect(mockIndexedDb.deleteUser).toHaveBeenCalledWith('42');
      expect(mockIndexedDb.deletePendingOperation).toHaveBeenCalledWith(1);
    });

    it('should increment retry count when operation fails', async () => {
      const op = makePendingOp({ type: 'update' });
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([op]));
      mockApiService.put.and.returnValue(throwError(() => new Error('Network error')));
      await service.syncPendingOperations();
      expect(mockIndexedDb.incrementRetryCount).toHaveBeenCalledWith(1);
    });

    it('should remove operation when max retries exceeded', async () => {
      const op = makePendingOp({ type: 'update', retryCount: 3 });
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([op]));
      mockApiService.put.and.returnValue(throwError(() => new Error('Persistent error')));
      await service.syncPendingOperations();
      expect(mockIndexedDb.deletePendingOperation).toHaveBeenCalledWith(1);
    });
  });
});
