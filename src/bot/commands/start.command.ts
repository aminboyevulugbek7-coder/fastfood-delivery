import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class StartCommand {
  constructor(private readonly logger: LoggerService) {}

  async execute(ctx: Context): Promise<void> {
    try {
      const welcomeMessage = `Assalomu alaykum! 👋

FastFood Bagat ga xush kelibsiz! 🍔

Quyidagi buyruqlardan foydalanishingiz mumkin:
/menu - Menyu ko'rish
/orders - Mening buyurtmalarim
/help - Yordam
/contact - Aloqa ma'lumotlari

Buyurtma berish uchun /menu buyrug'ini bosing yoki Mini App ni oching!`;

      const keyboard = {
        inline_keyboard: [
          [{ text: '🛒 Mini App ochish', url: 'https://t.me/your_bot_name/app' }],
          [{ text: '🍔 Menyu', callback_data: 'menu' }],
          [{ text: '📋 Mening buyurtmalarim', callback_data: 'orders' }],
          [{ text: '❓ Yordam', callback_data: 'help' }],
          [{ text: '📞 Aloqa', callback_data: 'contact' }],
        ],
      };

      await ctx.reply(welcomeMessage, { reply_markup: keyboard });
      this.logger.log(`Start command executed for user ${ctx.from?.id}`, 'StartCommand');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Start command error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'StartCommand',
      );
      await ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.');
    }
  }
}
