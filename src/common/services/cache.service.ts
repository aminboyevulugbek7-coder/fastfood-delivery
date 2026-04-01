import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';

/**
 * Cache Service - manages in-memory caching of frequently accessed data
 * with TTL (Time To Live) support and automatic invalidation
 */
@Injectable()
export class CacheService {
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(private readonly logger: LoggerService) {}

  /**
   * Set a value in cache with optional TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttlMs Time to live in milliseconds (default: 1 hour)
   */
  set(key: string, data: any, ttlMs: number = 3600000): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { data, expiresAt });
    this.logger.debug(`Cache set: ${key} (expires in ${ttlMs}ms)`, 'CacheService');
    this.notifyListeners(key, data);
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  get(key: string): any {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired: ${key}`, 'CacheService');
      return null;
    }

    return entry.data;
  }

  /**
   * Check if a key exists in cache and is not expired
   * @param key Cache key
   * @returns True if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.logger.debug(`Cache deleted: ${key}`, 'CacheService');
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared', 'CacheService');
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Subscribe to cache changes for a specific key
   * @param key Cache key
   * @param callback Callback function to invoke on changes
   * @returns Unsubscribe function
   */
  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(callback);
    this.logger.debug(`Cache listener added: ${key}`, 'CacheService');

    return () => {
      this.listeners.get(key)?.delete(callback);
      this.logger.debug(`Cache listener removed: ${key}`, 'CacheService');
    };
  }

  /**
   * Notify all listeners of a cache change
   * @param key Cache key
   * @param data New data
   */
  private notifyListeners(key: string, data: any): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Error in cache listener for ${key}: ${errorMessage}`,
            error instanceof Error ? error.stack : undefined,
            'CacheService',
          );
        }
      });
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern Pattern to match (supports wildcards)
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.delete(key));
    this.logger.debug(
      `Cache invalidated by pattern: ${pattern} (${keysToDelete.length} entries)`,
      'CacheService',
    );
  }
}
