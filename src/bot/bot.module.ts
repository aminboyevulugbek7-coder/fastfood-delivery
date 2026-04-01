import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { OrderModule } from '../order/order.module';
import { FoodModule } from '../food/food.module';
import { UserModule } from '../user/user.module';
import { LoggerModule } from '../logger/logger.module';
import { ConfigModule } from '../config/config.module';
import { CommonModule } from '../common/common.module';
import { StartCommand } from './commands/start.command';
import { MenuCommand } from './commands/menu.command';
import { OrdersCommand } from './commands/orders.command';
import { HelpCommand } from './commands/help.command';
import { ContactCommand } from './commands/contact.command';
import { AdminCommand } from './commands/admin.command';
import { OrderWizardScene } from './scenes/order-wizard.scene';
import { KeyboardService } from './services/keyboard.service';
import { CallbackService } from './services/callback.service';

@Module({
  imports: [OrderModule, FoodModule, UserModule, LoggerModule, ConfigModule, CommonModule],
  providers: [
    BotService,
    StartCommand,
    MenuCommand,
    OrdersCommand,
    HelpCommand,
    ContactCommand,
    AdminCommand,
    OrderWizardScene,
    KeyboardService,
    CallbackService,
  ],
  controllers: [BotController],
  exports: [BotService, OrderWizardScene],
})
export class BotModule {}
