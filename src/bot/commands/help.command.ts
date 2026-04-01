import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class HelpCommand {
  constructor(private readonly logger: LoggerService) {}

  async execute(ctx: Context): Promise<void> {
    try {
      const helpMessage = `❓ Yordam

FastFood Bagat botidan foydalanish:

📋 Buyurtma berish:
1. /menu buyrug'ini bosing
2. Kategoriyani tanlang
3. Mahsulotni tanlang
4. Miqdorni kiriting
5. Manzil va telefon raqamini kiriting
6. Buyurtmani tasdiqlang

📞 Mening buyurtmalarim:
/orders buyrug'ini bosing va o'zingizning buyurtmalaringizni ko'ring

📞 Aloqa:
/contact buyrug'ini bosing va restoran aloqa ma'lumotlarini oling

🆘 Muammo yuz bersa:
Bizga murojaat qiling: +998 (90) 123-45-67

Boshqa savollar bo'lsa, /start buyrug'ini bosing!`;

      await ctx.reply(helpMessage);
      this.logger.log(`Help command executed for user ${ctx.from?.id}`, 'HelpCommand');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Help command error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'HelpCommand',
      );
      await ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.');
    }
  }
}
