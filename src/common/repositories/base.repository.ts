import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

/**
 * Abstract base repository class implementing generic CRUD operations
 * for Firebase Realtime Database. All repositories should extend this class.
 */
@Injectable()
export abstract class BaseRepository<T> {
  protected abstract basePath: string;

  constructor(protected readonly firebaseService: FirebaseService) {}

  /**
   * Create a new entity in Firebase
   * @param data Entity data to create
   * @returns Created entity with ID and timestamps
   */
  async create(data: Partial<T>): Promise<T> {
    const id = this.generateId();
    const entity = {
      id,
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as T;

    await this.firebaseService.create(`${this.basePath}/${id}`, entity);
    return entity;
  }

  /**
   * Read a single entity by ID
   * @param id Entity ID
   * @returns Entity data or null if not found
   */
  async read(id: string): Promise<T | null> {
    const data = await this.firebaseService.read(`${this.basePath}/${id}`);
    return data || null;
  }

  /**
   * Update an existing entity
   * @param id Entity ID
   * @param data Partial entity data to update
   */
  async update(id: string, data: Partial<T>): Promise<void> {
    await this.firebaseService.update(`${this.basePath}/${id}`, {
      ...data,
      updatedAt: Date.now(),
    });
  }

  /**
   * Delete an entity by ID
   * @param id Entity ID
   */
  async delete(id: string): Promise<void> {
    await this.firebaseService.delete(`${this.basePath}/${id}`);
  }

  /**
   * List all entities in the collection
   * @returns Array of all entities
   */
  async list(): Promise<T[]> {
    const data = await this.firebaseService.list(this.basePath);
    return Array.isArray(data) ? data : [];
  }

  /**
   * Find entities by a specific field value
   * @param field Field name to search
   * @param value Value to match
   * @returns Array of matching entities
   */
  async findByField(field: string, value: any): Promise<T[]> {
    const allData = await this.list();
    return allData.filter((item: any) => item[field] === value);
  }

  /**
   * Check if an entity exists by ID
   * @param id Entity ID
   * @returns True if entity exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const data = await this.read(id);
    return data !== null;
  }

  /**
   * Generate a unique ID for new entities
   * Override this method in subclasses for custom ID generation
   * @returns Generated ID
   */
  protected generateId(): string {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
  }
}
