import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { CacheService } from './cache.service';
import { LoggerService } from '../../logger/logger.service';

/**
 * Firebase Real-Time Synchronization Service
 * Manages real-time listeners and data synchronization with cache
 */
@Injectable()
export class FirebaseSyncService implements OnModuleDestroy {
  private listeners: Map<string, () => void> = new Map();
  private syncCallbacks: Map<string, Set<(data: any) => void>> = new Map();

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService,
  ) {}

  onModuleDestroy(): void {
    this.unsubscribeAll();
  }

  /**
   * Subscribe to real-time updates for a Firebase path
   * @param path Firebase path to listen to
   * @param callback Callback function to invoke on data changes
   * @returns Unsubscribe function
   */
  subscribe(path: string, callback: (data: any) => void): () => void {
    // Register callback
    if (!this.syncCallbacks.has(path)) {
      this.syncCallbacks.set(path, new Set());
    }
    this.syncCallbacks.get(path)!.add(callback);

    // Set up listener if not already listening
    if (!this.listeners.has(path)) {
      const unsubscribe = this.firebaseService.onValueChange(path, (data) => {
        // Update cache
        this.cacheService.set(`firebase:${path}`, data, 3600000);

        // Notify all callbacks
        const callbacks = this.syncCallbacks.get(path);
        if (callbacks) {
          callbacks.forEach((cb) => {
            try {
              cb(data);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              this.logger.error(
                `Error in sync callback for ${path}: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
                'FirebaseSyncService',
              );
            }
          });
        }
      });

      this.listeners.set(path, unsubscribe);
      this.logger.log(`Real-time listener registered: ${path}`, 'FirebaseSyncService');
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.syncCallbacks.get(path);
      if (callbacks) {
        callbacks.delete(callback);

        // If no more callbacks, unsubscribe from Firebase
        if (callbacks.size === 0) {
          const unsubscribe = this.listeners.get(path);
          if (unsubscribe) {
            unsubscribe();
            this.listeners.delete(path);
            this.syncCallbacks.delete(path);
            this.logger.log(`Real-time listener unregistered: ${path}`, 'FirebaseSyncService');
          }
        }
      }
    };
  }

  /**
   * Get cached data for a path
   * @param path Firebase path
   * @returns Cached data or null
   */
  getCached(path: string): any {
    return this.cacheService.get(`firebase:${path}`);
  }

  /**
   * Invalidate cache for a path
   * @param path Firebase path
   */
  invalidateCache(path: string): void {
    this.cacheService.delete(`firebase:${path}`);
    this.logger.debug(`Cache invalidated: ${path}`, 'FirebaseSyncService');
  }

  /**
   * Invalidate cache by pattern
   * @param pattern Pattern to match
   */
  invalidateCachePattern(pattern: string): void {
    this.cacheService.invalidatePattern(`firebase:${pattern}`);
  }

  /**
   * Unsubscribe from all listeners
   */
  unsubscribeAll(): void {
    this.listeners.forEach((unsubscribe, path) => {
      unsubscribe();
      this.logger.log(`Real-time listener unregistered: ${path}`, 'FirebaseSyncService');
    });
    this.listeners.clear();
    this.syncCallbacks.clear();
  }

  /**
   * Get listener statistics
   * @returns Listener statistics
   */
  getStats(): { activeListeners: number; paths: string[] } {
    return {
      activeListeners: this.listeners.size,
      paths: Array.from(this.listeners.keys()),
    };
  }
}
