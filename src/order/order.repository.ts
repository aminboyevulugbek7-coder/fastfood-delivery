import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { FirebaseService } from '../firebase/firebase.service';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderRepository extends BaseRepository<Order> {
  protected basePath = 'orders';

  constructor(firebaseService: FirebaseService) {
    super(firebaseService);
  }

  /**
   * Find orders by user's Telegram ID
   * @param telegramId User's Telegram ID
   * @returns Array of user's orders
   */
  async findByTelegramId(telegramId: string): Promise<Order[]> {
    return this.findByField('telegramId', telegramId);
  }

  /**
   * Find orders by status
   * @param status Order status
   * @returns Array of orders with specified status
   */
  async findByStatus(status: string): Promise<Order[]> {
    return this.findByField('status', status);
  }
}
