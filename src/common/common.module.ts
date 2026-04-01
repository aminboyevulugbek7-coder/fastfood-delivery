import { Module } from '@nestjs/common';
import { CacheService } from './services/cache.service';
import { FirebaseSyncService } from './services/firebase-sync.service';
import { LocalizationService } from './services/localization.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [FirebaseModule, LoggerModule],
  providers: [CacheService, FirebaseSyncService, LocalizationService],
  exports: [CacheService, FirebaseSyncService, LocalizationService],
})
export class CommonModule {}
