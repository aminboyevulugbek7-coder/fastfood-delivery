import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../logger/logger.module';

@Global()
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
