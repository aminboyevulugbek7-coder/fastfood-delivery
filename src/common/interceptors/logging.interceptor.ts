import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        // Sanitize body to avoid logging sensitive data
        const sanitizedBody = this.sanitizeBody(body);

        this.logger.log(
          `${method} ${url} - ${statusCode} - ${duration}ms${
            sanitizedBody ? ` - Body: ${JSON.stringify(sanitizedBody)}` : ''
          }`,
          'HTTP',
        );
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'privateKey',
      'clientSecret',
    ];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
