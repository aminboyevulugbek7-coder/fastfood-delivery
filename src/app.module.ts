import { Module } from '@nestjs/common';
import { ConfigModule as LocalConfigModule } from './config/config.module';
import { LoggerModule } from './logger/logger.module';
import { FirebaseModule } from './firebase/firebase.module';
import { CommonModule } from './common/common.module';
import { BotModule } from './bot/bot.module';
import { OrderModule } from './order/order.module';
import { FoodModule } from './food/food.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ImageModule } from './image/image.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    LocalConfigModule,
    LoggerModule,
    FirebaseModule,
    CommonModule,
    BotModule,
    OrderModule,
    FoodModule,
    UserModule,
    AuthModule,
    ImageModule,
    AdminModule,
  ],
})
export class AppModule {}
