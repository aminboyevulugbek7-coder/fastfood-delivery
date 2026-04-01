import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class MenuCommand {
  constructor(
    private readonly logger: LoggerService,
  ) {}

  async execute(ctx: Context): Promise<void> {
    try {
      const message = `📋 Menyu

Kategoriyani tanlang:`;

      const keyboard = {
        inline_keyboard: [
          [{ text: '🍔 Burgerlar', callback_data: 'cat_burgers' }],
          [{ text: '🍕 Pizzalar', callback_data: 'cat_pizzas' }],
          [{ text: '🥤 Ichimliklar', callback_data: 'cat_drinks' }],
          [{ text: '🍟 Qo\'shimchalar', callback_data: 'cat_sides' }],
          [{ text: '❌ Bekor qilish', callback_data: 'cancel' }],
        ],
      };

      await ctx.reply(message, { reply_markup: keyboard });
      this.logger.log(`Menu command executed for user ${ctx.from?.id}`, 'MenuCommand');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Menu command error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'MenuCommand',
      );
      await ctx.reply('Menyu yuklashda xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.');
    }
  }
}
