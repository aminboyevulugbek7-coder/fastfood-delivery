import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'ADMIN_TOKEN',
  ];

  constructor() {
    this.validateRequiredEnvVars();
  }

  private validateRequiredEnvVars(): void {
    const missingVars = this.requiredEnvVars.filter(
      (varName) => !process.env[varName],
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}. ` +
        `Please check your .env file or environment configuration.`,
      );
    }
  }

  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  get port(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  get logLevel(): string {
    return process.env.LOG_LEVEL || 'info';
  }

  get telegramBotToken(): string {
    return process.env.TELEGRAM_BOT_TOKEN || '';
  }

  get firebaseProjectId(): string {
    return process.env.FIREBASE_PROJECT_ID || '';
  }

  get firebasePrivateKey(): string {
    return process.env.FIREBASE_PRIVATE_KEY || '';
  }

  get firebaseClientEmail(): string {
    return process.env.FIREBASE_CLIENT_EMAIL || '';
  }

  get firebaseDatabaseUrl(): string {
    return process.env.FIREBASE_DATABASE_URL || '';
  }

  get adminToken(): string {
    return process.env.ADMIN_TOKEN || '';
  }

  get botWebhookUrl(): string {
    return process.env.BOT_WEBHOOK_URL || '';
  }

  get adminPanelUrl(): string {
    return process.env.ADMIN_PANEL_URL || '';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isStaging(): boolean {
    return this.nodeEnv === 'staging';
  }
}
