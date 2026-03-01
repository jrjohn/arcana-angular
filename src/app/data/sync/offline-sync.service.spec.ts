import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OfflineSyncService } from './offline-sync.service';
import { NetworkStatusService } from '../../domain/services/network-status.service';
import { IndexedDbService, PendingOperation } from '../storage/indexed-db.service';
import { ApiService } from '../api/api.service';

describe('OfflineSyncService', () => {
  let service: OfflineSyncService;
  let mockNetworkStatus: jasmine.SpyObj<NetworkStatusService>;
  let mockIndexedDb: jasmine.SpyObj<IndexedDbService>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  const makePendingOp = (overrides: Partial<PendingOperation> = {}): PendingOperation => ({
    id: 1,
    entityType: 'user',
    entityId: '42',
    operationType: 'update',
    payload: { id: '42', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', avatar: '', createdAt: new Date(), updatedAt: new Date() },
    timestamp: Date.now(),
    retryCount: 0,
    ...overrides,
  });

  beforeEach(() => {
    mockNetworkStatus = jasmine.createSpyObj<NetworkStatusService>(
      'NetworkStatusService',
      ['checkOnline', 'checkOffline'],
      { isOnline: jasmine.createSpy().and.returnValue(true), isOffline: false }
    );
    mockIndexedDb = jasmine.createSpyObj('IndexedDbService', [
      'getPendingOperations', 'markOperationComplete', 'incrementRetryCount',
      'deleteUser', 'saveUser', 'getAllUsers', 'getUserById', 'addPendingOperation'
    ]);
    mockApiService = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);

    mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([]));
    mockIndexedDb.markOperationComplete.and.returnValue(Promise.resolve());
    mockIndexedDb.incrementRetryCount.and.returnValue(Promise.resolve());
    mockIndexedDb.deleteUser.and.returnValue(Promise.resolve());
    mockIndexedDb.saveUser.and.returnValue(Promise.resolve());

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
      (mockNetworkStatus as any).isOffline = true;
      await service.syncPendingOperations();
      expect(mockIndexedDb.getPendingOperations).not.toHaveBeenCalled();
    });

    it('should do nothing when no pending operations', async () => {
      (mockNetworkStatus as any).isOffline = false;
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([]));
      await service.syncPendingOperations();
      expect(mockIndexedDb.markOperationComplete).not.toHaveBeenCalled();
    });

    it('should sync update operations', async () => {
      (mockNetworkStatus as any).isOffline = false;
      const op = makePendingOp({ operationType: 'update' });
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([op]));
      mockApiService.put.and.returnValue(of({ id: '42', email: 'alice@example.com', first_name: 'Alice', last_name: 'Smith', avatar: '', createdAt: '', updatedAt: '' }));
      await service.syncPendingOperations();
      expect(mockApiService.put).toHaveBeenCalled();
    });

    it('should sync create operations', async () => {
      (mockNetworkStatus as any).isOffline = false;
      const op = makePendingOp({ operationType: 'create' });
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([op]));
      mockApiService.post.and.returnValue(of({ id: '99', email: 'alice@example.com', first_name: 'Alice', last_name: 'Smith', avatar: '', createdAt: '', updatedAt: '' }));
      await service.syncPendingOperations();
      expect(mockApiService.post).toHaveBeenCalled();
    });

    it('should sync delete operations', async () => {
      (mockNetworkStatus as any).isOffline = false;
      const op = makePendingOp({ operationType: 'delete' });
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([op]));
      mockApiService.delete.and.returnValue(of(undefined));
      await service.syncPendingOperations();
      expect(mockApiService.delete).toHaveBeenCalled();
    });

    it('should handle 404 on delete gracefully', async () => {
      (mockNetworkStatus as any).isOffline = false;
      const op = makePendingOp({ operationType: 'delete' });
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([op]));
      mockApiService.delete.and.returnValue(throwError(() => ({ status: 404 })));
      await service.syncPendingOperations();
      expect(mockIndexedDb.deleteUser).toHaveBeenCalledWith('42');
    });

    it('should increment retry count when operation fails', async () => {
      (mockNetworkStatus as any).isOffline = false;
      const op = makePendingOp({ operationType: 'update' });
      mockIndexedDb.getPendingOperations.and.returnValue(Promise.resolve([op]));
      mockApiService.put.and.returnValue(throwError(() => new Error('Network error')));
      await service.syncPendingOperations();
      expect(mockIndexedDb.incrementRetryCount).toHaveBeenCalledWith(1);
    });
  });
});
