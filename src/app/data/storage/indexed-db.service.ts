import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { User } from '../../domain/entities/user.model';

/**
 * Pending operation for offline sync
 */
export interface PendingOperation {
  id?: number;
  type: 'create' | 'update' | 'delete';
  entityType: 'user';
  entityId?: string;
  data?: any;
  timestamp: Date;
  retryCount: number;
}

/**
 * IndexedDB Service using Dexie.js
 * Provides offline-first storage for the application
 */
@Injectable({
  providedIn: 'root',
})
export class IndexedDbService extends Dexie {
  // Tables
  users!: Table<User, string>;
  pendingOperations!: Table<PendingOperation, number>;

  constructor() {
    super('ArcanaDatabase');

    // Define database schema
    this.version(1).stores({
      users: 'id, email, firstName, lastName, createdAt, updatedAt',
      pendingOperations: '++id, type, entityType, entityId, timestamp',
    });

    console.log('[IndexedDB] Database initialized');
  }

  /**
   * Clear all data (for testing or logout)
   */
  async clearAll(): Promise<void> {
    await this.users.clear();
    await this.pendingOperations.clear();
    console.log('[IndexedDB] All data cleared');
  }

  /**
   * Get all users from IndexedDB
   */
  async getAllUsers(): Promise<User[]> {
    return await this.users.toArray();
  }

  /**
   * Get user by ID from IndexedDB
   */
  async getUserById(id: string): Promise<User | undefined> {
    return await this.users.get(id);
  }

  /**
   * Save user to IndexedDB
   */
  async saveUser(user: User): Promise<string> {
    await this.users.put(user);
    console.log('[IndexedDB] User saved:', user.id);
    return user.id;
  }

  /**
   * Save multiple users to IndexedDB
   */
  async saveUsers(users: User[]): Promise<void> {
    await this.users.bulkPut(users);
    console.log('[IndexedDB] Users saved:', users.length);
  }

  /**
   * Delete user from IndexedDB
   */
  async deleteUser(id: string): Promise<void> {
    await this.users.delete(id);
    console.log('[IndexedDB] User deleted:', id);
  }

  /**
   * Search users in IndexedDB
   */
  async searchUsers(query: string): Promise<User[]> {
    const lowerQuery = query.toLowerCase();
    return await this.users
      .filter(
        user =>
          user.firstName.toLowerCase().includes(lowerQuery) ||
          user.lastName.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }

  /**
   * Add a pending operation for sync
   */
  async addPendingOperation(operation: Omit<PendingOperation, 'id'>): Promise<number> {
    const id = await this.pendingOperations.add(operation as PendingOperation);
    console.log('[IndexedDB] Pending operation added:', id, operation.type);
    return id;
  }

  /**
   * Get all pending operations
   */
  async getPendingOperations(): Promise<PendingOperation[]> {
    return await this.pendingOperations.toArray();
  }

  /**
   * Delete pending operation after successful sync
   */
  async deletePendingOperation(id: number): Promise<void> {
    await this.pendingOperations.delete(id);
    console.log('[IndexedDB] Pending operation deleted:', id);
  }

  /**
   * Increment retry count for pending operation
   */
  async incrementRetryCount(id: number): Promise<void> {
    const operation = await this.pendingOperations.get(id);
    if (operation) {
      await this.pendingOperations.update(id, {
        retryCount: operation.retryCount + 1,
      });
    }
  }

  /**
   * Get user count
   */
  async getUserCount(): Promise<number> {
    return await this.users.count();
  }

  /**
   * Check if database is empty
   */
  async isEmpty(): Promise<boolean> {
    const count = await this.getUserCount();
    return count === 0;
  }
}
