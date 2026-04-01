import { Controller, Post, Body } from '@nestjs/common';
import { BotService } from './bot.service';
import { LoggerService } from '../logger/logger.service';

@Controller('bot')
export class BotController {
  constructor(
    private readonly botService: BotService,
    private readonly logger: LoggerService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any): Promise<{ ok: boolean }> {
    try {
      this.logger.debug(`Webhook received: ${JSON.stringify(update)}`, 'BotController');
      await this.botService.handleUpdate(update);
      return { ok: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Webhook handling error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'BotController',
      );
      return { ok: false };
    }
  }
}
