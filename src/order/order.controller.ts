import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Order } from './entities/order.entity';

@Controller('api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Create a new order
   * POST /api/orders
   * @param createOrderDto Order data
   * @returns Created order
   */
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }

  /**
   * Get order by ID
   * GET /api/orders/:id
   * @param id Order ID
   * @returns Order details
   */
  @Get(':id')
  async getOrder(@Param('id') id: string): Promise<Order> {
    return this.orderService.getOrder(id);
  }

  /**
   * Get user's orders by Telegram ID
   * GET /api/orders/user/:telegramId
   * @param telegramId User's Telegram ID
   * @returns Array of user's orders
   */
  @Get('user/:telegramId')
  async getUserOrders(@Param('telegramId') telegramId: string): Promise<Order[]> {
    return this.orderService.getUserOrders(telegramId);
  }

  /**
   * Get all orders (paginated, admin only)
   * GET /api/orders?page=1&limit=10&status=pending
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @param status Filter by status (optional)
   * @returns Paginated orders
   */
  @Get()
  @UseGuards(AdminGuard)
  async getAllOrders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    return this.orderService.getAllOrders(pageNum, limitNum, status);
  }

  /**
   * Update order status (admin only)
   * PATCH /api/orders/:id/status
   * @param id Order ID
   * @param updateOrderStatusDto New status
   * @returns Success response
   */
  @Patch(':id/status')
  @UseGuards(AdminGuard)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.orderService.updateOrderStatus(id, updateOrderStatusDto);
    return {
      success: true,
      message: 'Buyurtma holati yangilandi',
    };
  }

  /**
   * Cancel order (admin only)
   * DELETE /api/orders/:id
   * @param id Order ID
   * @returns Success response
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteOrder(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.orderService.deleteOrder(id);
    return {
      success: true,
      message: 'Buyurtma bekor qilindi',
    };
  }
}
