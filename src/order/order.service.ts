import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { LoggerService } from '../logger/logger.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Create a new order
   * @param createOrderDto Order data
   * @returns Created order
   */
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // Validate total price calculation
      const calculatedTotal = createOrderDto.items.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );

      if (calculatedTotal !== createOrderDto.totalPrice) {
        throw new BadRequestException(
          'Jami narx hisoblangan narxga mos kelmadi',
        );
      }

      const order = await this.orderRepository.create(createOrderDto);
      this.logger.log(`Order created: ${order.id}`, 'OrderService');
      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create order: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'OrderService',
      );
      throw error;
    }
  }

  /**
   * Get order by ID
   * @param id Order ID
   * @returns Order details
   */
  async getOrder(id: string): Promise<Order> {
    try {
      const order = await this.orderRepository.read(id);
      if (!order) {
        throw new NotFoundException('Buyurtma topilmadi');
      }
      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get order: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'OrderService',
      );
      throw error;
    }
  }

  /**
   * Get user's orders by Telegram ID
   * @param telegramId User's Telegram ID
   * @returns Array of user's orders
   */
  async getUserOrders(telegramId: string): Promise<Order[]> {
    try {
      const orders = await this.orderRepository.findByTelegramId(telegramId);
      return orders;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get user orders: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'OrderService',
      );
      throw error;
    }
  }

  /**
   * Get all orders with pagination and optional filtering
   * @param page Page number
   * @param limit Items per page
   * @param status Optional status filter
   * @returns Paginated orders
   */
  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    try {
      let orders = await this.orderRepository.list();

      // Filter by status if provided
      if (status) {
        orders = orders.filter((order) => order.status === status);
      }

      // Sort by creation time (newest first)
      orders.sort((a, b) => b.createdAt - a.createdAt);

      const total = orders.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = orders.slice(startIndex, endIndex);

      return {
        data: paginatedOrders,
        total,
        page,
        limit,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get all orders: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'OrderService',
      );
      throw error;
    }
  }

  /**
   * Update order status
   * @param id Order ID
   * @param updateOrderStatusDto New status
   */
  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<void> {
    try {
      const order = await this.orderRepository.read(id);
      if (!order) {
        throw new NotFoundException('Buyurtma topilmadi');
      }

      await this.orderRepository.update(id, {
        status: updateOrderStatusDto.status,
        ...(updateOrderStatusDto.notes && { notes: updateOrderStatusDto.notes }),
      });

      this.logger.log(
        `Order status updated: ${id} -> ${updateOrderStatusDto.status}`,
        'OrderService',
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to update order status: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'OrderService',
      );
      throw error;
    }
  }

  /**
   * Delete/cancel order
   * @param id Order ID
   */
  async deleteOrder(id: string): Promise<void> {
    try {
      const order = await this.orderRepository.read(id);
      if (!order) {
        throw new NotFoundException('Buyurtma topilmadi');
      }

      await this.orderRepository.delete(id);
      this.logger.log(`Order deleted: ${id}`, 'OrderService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to delete order: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'OrderService',
      );
      throw error;
    }
  }
}
