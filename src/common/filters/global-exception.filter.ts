import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '../../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

interface ErrorResponse {
  statusCode: number;
  message: string;
  errorId: string;
  timestamp: string;
  path?: string;
  errors?: Record<string, string[]>;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const errorId = uuidv4();
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Tizimda xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      const exceptionResponse = exception.getResponse() as any;
      message = 'Kiritilgan ma\'lumot noto\'g\'ri. Iltimos, qayta urinib ko\'ring.';
      if (exceptionResponse.message) {
        errors = this.formatValidationErrors(exceptionResponse.message);
      }
    } else if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = 'Izlangan resurs topilmadi.';
    } else if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Ruxsat berilmagan. Iltimos, qayta kirish urinib ko\'ring.';
    } else if (exception instanceof ForbiddenException) {
      status = HttpStatus.FORBIDDEN;
      message = 'Bu operatsiyani bajarishga ruxsat yo\'q.';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message || message;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Tizimda xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.';
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
        'GlobalExceptionFilter',
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      errorId,
      timestamp,
      path: request.url,
      ...(errors && { errors }),
    };

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - Error ID: ${errorId}`,
      exception instanceof Error ? exception.stack : String(exception),
      'GlobalExceptionFilter',
    );

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(
    messages: string | string[],
  ): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    if (Array.isArray(messages)) {
      messages.forEach((msg) => {
        const match = msg.match(/^(\w+)\s+(.+)$/);
        if (match && match[1] && match[2]) {
          const field: string = match[1];
          const error: string = match[2];
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field]!.push(error);
        }
      });
    }

    return errors;
  }
}
