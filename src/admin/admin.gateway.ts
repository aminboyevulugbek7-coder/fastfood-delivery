import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { FirebaseService } from '../firebase/firebase.service';

/**
 * WebSocket Gateway for real-time admin panel updates
 * Handles real-time order and food catalog updates
 */
@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.ADMIN_PANEL_URL : '*',
    credentials: true,
  },
  namespace: '/admin',
})
@Injectable()
export class AdminGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private orderListeners: Map<string, () => void> = new Map();
  private foodListeners: Map<string, () => void> = new Map();
  private categoryListeners: Map<string, () => void> = new Map();

  constructor(
    private readonly logger: LoggerService,
    private readonly firebaseService: FirebaseService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Admin client connected: ${client.id}`, 'AdminGateway');
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Admin client disconnected: ${client.id}`, 'AdminGateway');
    // Clean up listeners for this client
    this.orderListeners.delete(client.id);
    this.foodListeners.delete(client.id);
    this.categoryListeners.delete(client.id);
  }

  /**
   * Subscribe to real-time order updates
   */
  @SubscribeMessage('subscribe:orders')
  async handleOrderSubscription(client: Socket): Promise<void> {
    try {
      this.logger.log(`Client ${client.id} subscribed to orders`, 'AdminGateway');

      // Set up real-time listener for orders
      const unsubscribe = this.firebaseService.onOrdersChange((orders) => {
        client.emit('orders:updated', {
          timestamp: Date.now(),
          data: orders,
        });
      });

      this.orderListeners.set(client.id, unsubscribe);

      // Send initial data
      const initialOrders = await this.firebaseService.getAllOrders();
      client.emit('orders:initial', {
        timestamp: Date.now(),
        data: initialOrders,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Order subscription error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'AdminGateway',
      );
      client.emit('error', { message: 'Buyurtmalarni yuklashda xatolik' });
    }
  }

  /**
   * Subscribe to real-time food catalog updates
   */
  @SubscribeMessage('subscribe:foods')
  async handleFoodSubscription(client: Socket): Promise<void> {
    try {
      this.logger.log(`Client ${client.id} subscribed to foods`, 'AdminGateway');

      // Set up real-time listener for foods
      const unsubscribe = this.firebaseService.onFoodsChange((foods) => {
        client.emit('foods:updated', {
          timestamp: Date.now(),
          data: foods,
        });
      });

      this.foodListeners.set(client.id, unsubscribe);

      // Send initial data
      const initialFoods = await this.firebaseService.getAllFoods();
      client.emit('foods:initial', {
        timestamp: Date.now(),
        data: initialFoods,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Food subscription error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'AdminGateway',
      );
      client.emit('error', { message: 'Mahsulotlarni yuklashda xatolik' });
    }
  }

  /**
   * Subscribe to real-time category updates
   */
  @SubscribeMessage('subscribe:categories')
  async handleCategorySubscription(client: Socket): Promise<void> {
    try {
      this.logger.log(`Client ${client.id} subscribed to categories`, 'AdminGateway');

      // Set up real-time listener for categories
      const unsubscribe = this.firebaseService.onCategoriesChange((categories) => {
        client.emit('categories:updated', {
          timestamp: Date.now(),
          data: categories,
        });
      });

      this.categoryListeners.set(client.id, unsubscribe);

      // Send initial data
      const initialCategories = await this.firebaseService.getAllCategories();
      client.emit('categories:initial', {
        timestamp: Date.now(),
        data: initialCategories,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Category subscription error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'AdminGateway',
      );
      client.emit('error', { message: 'Kategoriyalarni yuklashda xatolik' });
    }
  }

  /**
   * Unsubscribe from order updates
   */
  @SubscribeMessage('unsubscribe:orders')
  handleOrderUnsubscription(client: Socket): void {
    const unsubscribe = this.orderListeners.get(client.id);
    if (unsubscribe) {
      unsubscribe();
      this.orderListeners.delete(client.id);
      this.logger.log(`Client ${client.id} unsubscribed from orders`, 'AdminGateway');
    }
  }

  /**
   * Unsubscribe from food updates
   */
  @SubscribeMessage('unsubscribe:foods')
  handleFoodUnsubscription(client: Socket): void {
    const unsubscribe = this.foodListeners.get(client.id);
    if (unsubscribe) {
      unsubscribe();
      this.foodListeners.delete(client.id);
      this.logger.log(`Client ${client.id} unsubscribed from foods`, 'AdminGateway');
    }
  }

  /**
   * Unsubscribe from category updates
   */
  @SubscribeMessage('unsubscribe:categories')
  handleCategoryUnsubscription(client: Socket): void {
    const unsubscribe = this.categoryListeners.get(client.id);
    if (unsubscribe) {
      unsubscribe();
      this.categoryListeners.delete(client.id);
      this.logger.log(`Client ${client.id} unsubscribed from categories`, 'AdminGateway');
    }
  }

  /**
   * Broadcast order update to all connected admin clients
   */
  broadcastOrderUpdate(order: any): void {
    this.server.emit('order:updated', {
      timestamp: Date.now(),
      data: order,
    });
  }

  /**
   * Broadcast food update to all connected admin clients
   */
  broadcastFoodUpdate(food: any): void {
    this.server.emit('food:updated', {
      timestamp: Date.now(),
      data: food,
    });
  }

  /**
   * Broadcast category update to all connected admin clients
   */
  broadcastCategoryUpdate(category: any): void {
    this.server.emit('category:updated', {
      timestamp: Date.now(),
      data: category,
    });
  }
}
