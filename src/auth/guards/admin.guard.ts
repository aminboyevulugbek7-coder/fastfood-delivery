import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoggerService } from '../../logger/logger.service';

/**
 * Admin Guard - Validates admin token from request headers
 * Protects admin-only endpoints
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('Admin access attempt without token', 'AdminGuard');
      throw new UnauthorizedException('Ruxsat berilmagan. Admin tokeni talab qilinadi.');
    }

    const isValid = this.authService.validateAdminToken(token);
    if (!isValid) {
      this.logger.warn(`Admin access attempt with invalid token: ${token}`, 'AdminGuard');
      throw new ForbiddenException('Ruxsat berilmagan. Admin tokeni noto\'g\'ri.');
    }

    this.logger.log('Admin access granted', 'AdminGuard');
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return undefined;
    }

    return parts[1];
  }
}
