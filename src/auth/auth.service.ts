import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  validateAdminToken(token: string): boolean {
    const isValid = token === this.configService.adminToken;
    if (!isValid) {
      this.logger.warn('Invalid admin token attempt', 'AuthService');
    }
    return isValid;
  }

  getAdminToken(): string {
    return this.configService.adminToken;
  }
}
