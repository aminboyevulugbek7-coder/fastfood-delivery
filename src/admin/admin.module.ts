import { Module } from '@nestjs/common';
import { AdminGateway } from './admin.gateway';
import { FirebaseModule } from '../firebase/firebase.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [FirebaseModule, LoggerModule],
  providers: [AdminGateway],
  exports: [AdminGateway],
})
export class AdminModule {}
