import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { OrderService } from '../../order/order.service';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class OrdersCommand {
  constructor(
    private readonly orderService: OrderService,
    private readonly logger: LoggerService,
  ) {}

  async execute(ctx: Context): Promise<void> {
    try {
      if (!ctx.from) {
        await ctx.reply('Foydalanuvchi ma\'lumoti topilmadi.');
        return;
      }

      const telegramId = ctx.from.id.toString();
      const ordersResponse = await this.orderService.getAllOrders();
      const userOrders = ordersResponse.data.filter((order: any) => order.telegramId === telegramId);

      if (userOrders.length === 0) {
        await ctx.reply('📋 Sizda hali buyurtma yo\'q.\n\nBuyurtma berish uchun /menu buyrug\'ini bosing!');
        return;
      }

      let message = '📋 Mening buyurtmalarim:\n\n';
      userOrders.forEach((order: any, index: number) => {
        const date = new Date(order.createdAt).toLocaleDateString('uz-UZ');
        const status = this.getStatusEmoji(order.status);
        message += `${index + 1}. ${status} Buyurtma #${order.id.slice(0, 8)}\n`;
        message += `   Sana: ${date}\n`;
        message += `   Summa: ${order.totalPrice.toLocaleString()} so'm\n`;
        message += `   Status: ${this.getStatusText(order.status)}\n\n`;
      });

      await ctx.reply(message);
      this.logger.log(`Orders command executed for user ${ctx.from.id}`, 'OrdersCommand');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Orders command error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'OrdersCommand',
      );
      await ctx.reply('Buyurtmalarni yuklashda xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.');
    }
  }

  private getStatusEmoji(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: '⏳',
      preparing: '👨‍🍳',
      ready: '✅',
      delivered: '🚚',
      cancelled: '❌',
    };
    return statusMap[status] || '❓';
  }

  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Kutilmoqda',
      preparing: 'Tayyorlanmoqda',
      ready: 'Tayyor',
      delivered: 'Yetkazildi',
      cancelled: 'Bekor qilindi',
    };
    return statusMap[status] || 'Noma\'lum';
  }
}
