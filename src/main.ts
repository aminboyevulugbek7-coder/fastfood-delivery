import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { LoggerService } from './logger/logger.service';

async function bootstrap(): Promise<void> {
  // Load environment variables from .env file
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  // CORS configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? process.env.ADMIN_PANEL_URL : '*',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
}

bootstrap().catch((error: Error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
