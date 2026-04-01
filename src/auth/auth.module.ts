import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { AuthService } from './auth.service';
import { AdminGuard } from './guards/admin.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AuthService, AdminGuard],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}
