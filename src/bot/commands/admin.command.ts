import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { ConfigService } from '../../config/config.service';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class AdminCommand {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async execute(ctx: Context): Promise<void> {
    try {
      // Ask for admin token
      const message = `🔐 Admin panelga kirish

Iltimos, admin tokenini kiriting:`;

      await ctx.reply(message);
      this.logger.log(`Admin command executed for user ${ctx.from?.id}`, 'AdminCommand');

      // Store state for token validation
      if (ctx.from) {
        (ctx as any).session = (ctx as any).session || {};
        ((ctx as any).session as any).awaitingAdminToken = true;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Admin command error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'AdminCommand',
      );
      await ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.');
    }
  }

  async validateToken(ctx: Context, token: string): Promise<boolean> {
    try {
      const adminToken = this.configService.adminToken;
      if (token === adminToken) {
        this.logger.log(`Admin token validated for user ${ctx.from?.id}`, 'AdminCommand');
        return true;
      }
      this.logger.warn(`Invalid admin token attempt from user ${ctx.from?.id}`, 'AdminCommand');
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Token validation error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'AdminCommand',
      );
      return false;
    }
  }

  async showAdminPanel(ctx: Context): Promise<void> {
    try {
      const adminMessage = `👨‍💼 Admin Panel

Quyidagi amallarni bajarishingiz mumkin:

📊 Statistika
📋 Buyurtmalarni boshqarish
🍔 Menyu boshqarish
📸 Rasmlar yuklash
👥 Foydalanuvchilar

Admin panelga kirish uchun vebsaytni ziyorat qiling:
https://admin.fastfoodbagat.uz`;

      const keyboard = {
        inline_keyboard: [
          [{ text: '📊 Admin Panel', url: 'https://admin.fastfoodbagat.uz' }],
          [{ text: '🏠 Bosh sahifa', callback_data: 'start' }],
        ],
      };

      await ctx.reply(adminMessage, { reply_markup: keyboard });
      this.logger.log(`Admin panel shown to user ${ctx.from?.id}`, 'AdminCommand');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Admin panel error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'AdminCommand',
      );
      await ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.');
    }
  }
}
