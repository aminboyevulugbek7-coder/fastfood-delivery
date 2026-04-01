import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class ContactCommand {
  constructor(private readonly logger: LoggerService) {}

  async execute(ctx: Context): Promise<void> {
    try {
      const contactMessage = `📞 FastFood Bagat - Aloqa ma'lumotlari

🏪 Restoran:
📍 Manzil: Tashkent, Mirabad tumani, Amir Temur ko'chasi, 123
📞 Telefon: +998 (90) 123-45-67
📱 Mobil: +998 (91) 234-56-78
⏰ Ish vaqti: 10:00 - 23:00 (Har kuni)

💬 Biz bilan bog'lanish:
📧 Email: info@fastfoodbagat.uz
🌐 Vebsayt: www.fastfoodbagat.uz
📱 Telegram: @fastfoodbagat

🚚 Yetkazib berish:
- Tashkent shahrida: 30-45 daqiqa
- Yetkazib berish narxi: 5,000 so'm

🎁 Aksiyalar:
- Birinchi buyurtmada 10% chegirma
- 100,000 so'mdan yuqori buyurtmada bepul yetkazib berish

Buyurtma berish uchun /menu buyrug'ini bosing!`;

      const keyboard = {
        inline_keyboard: [
          [{ text: '📞 Qo\'ng\'iroq qilish', url: 'tel:+998901234567' }],
          [{ text: '💬 Telegram', url: 'https://t.me/fastfoodbagat' }],
          [{ text: '🍔 Menyu', callback_data: 'menu' }],
        ],
      };

      await ctx.reply(contactMessage, { reply_markup: keyboard });
      this.logger.log(`Contact command executed for user ${ctx.from?.id}`, 'ContactCommand');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Contact command error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'ContactCommand',
      );
      await ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.');
    }
  }
}
