import { Injectable, effect } from '@angular/core';
import { NetworkStatusService } from '../../domain/services/network-status.service';
import { IndexedDbService, PendingOperation } from '../storage/indexed-db.service';
import { ApiService } from '../api/api.service';
import {
  UserApiResponse,
  mapUserFromApi,
  mapUserToApi,
} from '../../domain/entities/user.model';

/**
 * Offline Sync Service
 * Monitors network status and syncs pending operations when coming online
 */
@Injectable({
  providedIn: 'root',
})
export class OfflineSyncService {
  private isSyncing = false;
  private readonly maxRetries = 3;

  constructor(
    private networkStatus: NetworkStatusService,
    private indexedDb: IndexedDbService,
    private apiService: ApiService
  ) {
    this.initializeSyncMonitoring();
  }

  /**
   * Initialize network monitoring and auto-sync when coming online
   */
  private initializeSyncMonitoring(): void {
    effect(() => {
      const isOnline = this.networkStatus.isOnline();

      if (isOnline && !this.isSyncing) {
        console.log('[OfflineSync] Network online - checking pending operations');
        this.syncPendingOperations();
      }
    });
  }

  /**
   * Manually trigger sync of pending operations
   */
  async syncPendingOperations(): Promise<void> {
    if (this.isSyncing) {
      console.log('[OfflineSync] Sync already in progress');
      return;
    }

    if (this.networkStatus.isOffline) {
      console.log('[OfflineSync] Cannot sync - offline');
      return;
    }

    this.isSyncing = true;
    console.log('[OfflineSync] Starting sync...');

    try {
      const pendingOps = await this.indexedDb.getPendingOperations();

      if (pendingOps.length === 0) {
        console.log('[OfflineSync] No pending operations');
        return;
      }

      console.log(`[OfflineSync] Found ${pendingOps.length} pending operations`);

      // Process operations in order
      for (const op of pendingOps) {
        try {
          await this.processPendingOperation(op);
        } catch (error) {
          console.error('[OfflineSync] Failed to process operation:', op, error);

          // Increment retry count
          if (op.id) {
            await this.indexedDb.incrementRetryCount(op.id);
          }

          // Remove if max retries exceeded
          if (op.retryCount >= this.maxRetries && op.id) {
            console.error(
              '[OfflineSync] Max retries exceeded, removing operation:',
              op.id
            );
            await this.indexedDb.deletePendingOperation(op.id);
          }
        }
      }

      console.log('[OfflineSync] Sync completed');
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a single pending operation
   */
  private async processPendingOperation(op: PendingOperation): Promise<void> {
    console.log(`[OfflineSync] Processing ${op.type} operation:`, op);

    switch (op.type) {
      case 'create':
        await this.syncCreateOperation(op);
        break;
      case 'update':
        await this.syncUpdateOperation(op);
        break;
      case 'delete':
        await this.syncDeleteOperation(op);
        break;
      default:
        console.error('[OfflineSync] Unknown operation type:', op.type);
    }

    // Remove operation after successful sync
    if (op.id) {
      await this.indexedDb.deletePendingOperation(op.id);
      console.log('[OfflineSync] ✓ Operation synced and removed:', op.id);
    }
  }

  /**
   * Sync create operation
   */
  private async syncCreateOperation(op: PendingOperation): Promise<void> {
    if (op.entityType !== 'user') {
      throw new Error(`Unsupported entity type: ${op.entityType}`);
    }

    const apiData = mapUserToApi(op.data);

    return new Promise((resolve, reject) => {
      this.apiService.post<UserApiResponse>('/users', apiData).subscribe({
        next: response => {
          const user = mapUserFromApi(response);
          this.indexedDb.saveUser(user);
          console.log('[OfflineSync] ✓ User created:', user.id);
          resolve();
        },
        error: err => reject(err),
      });
    });
  }

  /**
   * Sync update operation
   */
  private async syncUpdateOperation(op: PendingOperation): Promise<void> {
    if (op.entityType !== 'user' || !op.entityId) {
      throw new Error(`Invalid update operation: ${op.entityType}`);
    }

    const apiData = mapUserToApi(op.data);

    return new Promise((resolve, reject) => {
      this.apiService
        .put<UserApiResponse>(`/users/${op.entityId}`, apiData)
        .subscribe({
          next: response => {
            const user = mapUserFromApi(response);
            this.indexedDb.saveUser(user);
            console.log('[OfflineSync] ✓ User updated:', user.id);
            resolve();
          },
          error: err => reject(err),
        });
    });
  }

  /**
   * Sync delete operation
   */
  private async syncDeleteOperation(op: PendingOperation): Promise<void> {
    if (op.entityType !== 'user' || !op.entityId) {
      throw new Error(`Invalid delete operation: ${op.entityType}`);
    }

    return new Promise((resolve, reject) => {
      this.apiService.delete<void>(`/users/${op.entityId}`).subscribe({
        next: () => {
          this.indexedDb.deleteUser(op.entityId!);
          console.log('[OfflineSync] ✓ User deleted:', op.entityId);
          resolve();
        },
        error: err => {
          // If 404, user already deleted on server - still remove from IndexedDB
          if (err.status === 404) {
            this.indexedDb.deleteUser(op.entityId!);
            console.log(
              '[OfflineSync] ✓ User already deleted (404):',
              op.entityId
            );
            resolve();
          } else {
            reject(err);
          }
        },
      });
    });
  }

  /**
   * Get sync status
   */
  get isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Get pending operations count
   */
  async getPendingOperationsCount(): Promise<number> {
    const ops = await this.indexedDb.getPendingOperations();
    return ops.length;
  }
}
