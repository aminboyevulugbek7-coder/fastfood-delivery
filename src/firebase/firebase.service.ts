import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';
import { Database } from 'firebase-admin/database';

@Injectable()
export class FirebaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database | null = null;
  private static instance: FirebaseService;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    if (FirebaseService.instance) {
      return FirebaseService.instance;
    }
    FirebaseService.instance = this;
  }

  onModuleInit(): void {
    this.initializeFirebase();
  }

  onModuleDestroy(): void {
    this.closeConnection();
  }

  private initializeFirebase(): void {
    try {
      const privateKey = this.configService.firebasePrivateKey.replace(
        /\\n/g,
        '\n',
      );

      const credential = admin.credential.cert({
        projectId: this.configService.firebaseProjectId,
        privateKey,
        clientEmail: this.configService.firebaseClientEmail,
      });

      if (!admin.apps.length) {
        admin.initializeApp({
          credential,
          databaseURL: this.configService.firebaseDatabaseUrl,
        });
      }

      this.db = admin.database();
      this.logger.log('Firebase initialized successfully', 'FirebaseService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to initialize Firebase: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FirebaseService',
      );
      throw error;
    }
  }

  private closeConnection(): void {
    if (this.db) {
      this.db.goOffline();
      this.logger.log('Firebase connection closed', 'FirebaseService');
    }
  }

  getDatabase(): Database {
    if (!this.db) {
      throw new Error('Firebase database not initialized');
    }
    return this.db;
  }

  async create(path: string, data: any): Promise<any> {
    try {
      const ref = this.db!.ref(path);
      await ref.set(data);
      this.logger.log(`Created data at ${path}`, 'FirebaseService');
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create data at ${path}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FirebaseService',
      );
      throw error;
    }
  }

  async read(path: string): Promise<any> {
    try {
      const ref = this.db!.ref(path);
      const snapshot = await ref.get();
      return snapshot.val();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to read data from ${path}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FirebaseService',
      );
      throw error;
    }
  }

  async update(path: string, data: any): Promise<void> {
    try {
      const ref = this.db!.ref(path);
      await ref.update(data);
      this.logger.log(`Updated data at ${path}`, 'FirebaseService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to update data at ${path}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FirebaseService',
      );
      throw error;
    }
  }

  async delete(path: string): Promise<void> {
    try {
      const ref = this.db!.ref(path);
      await ref.remove();
      this.logger.log(`Deleted data at ${path}`, 'FirebaseService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to delete data at ${path}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FirebaseService',
      );
      throw error;
    }
  }

  async list(path: string): Promise<any[]> {
    try {
      const ref = this.db!.ref(path);
      const snapshot = await ref.get();
      const data = snapshot.val();

      if (!data) {
        return [];
      }

      if (typeof data === 'object' && !Array.isArray(data)) {
        return Object.values(data);
      }

      return Array.isArray(data) ? data : [data];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to list data from ${path}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FirebaseService',
      );
      throw error;
    }
  }

  onValueChange(path: string, callback: (data: any) => void): () => void {
    const ref = this.db!.ref(path);
    const listener = ref.on('value', (snapshot) => {
      callback(snapshot.val());
    });

    return () => {
      ref.off('value', listener);
    };
  }

  /**
   * Subscribe to real-time order updates
   */
  onOrdersChange(callback: (orders: any[]) => void): () => void {
    const ref = this.db!.ref('orders');
    ref.on('value', (snapshot) => {
      const data = snapshot.val();
      const orders = data ? Object.values(data) : [];
      callback(orders);
    });

    return () => {
      ref.off('value');
    };
  }

  /**
   * Subscribe to real-time food updates
   */
  onFoodsChange(callback: (foods: any[]) => void): () => void {
    const ref = this.db!.ref('foods');
    ref.on('value', (snapshot) => {
      const data = snapshot.val();
      const foods = data ? Object.values(data) : [];
      callback(foods);
    });

    return () => {
      ref.off('value');
    };
  }

  /**
   * Subscribe to real-time category updates
   */
  onCategoriesChange(callback: (categories: any[]) => void): () => void {
    const ref = this.db!.ref('categories');
    ref.on('value', (snapshot) => {
      const data = snapshot.val();
      const categories = data ? Object.values(data) : [];
      callback(categories);
    });

    return () => {
      ref.off('value');
    };
  }

  /**
   * Get all orders
   */
  async getAllOrders(): Promise<any[]> {
    return this.list('orders');
  }

  /**
   * Get all foods
   */
  async getAllFoods(): Promise<any[]> {
    return this.list('foods');
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<any[]> {
    return this.list('categories');
  }
}
