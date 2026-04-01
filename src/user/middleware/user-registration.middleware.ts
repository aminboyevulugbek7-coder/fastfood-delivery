import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { UserService } from '../user.service';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class UserRegistrationMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Register or update user on bot interaction
   */
  async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
    try {
      if (!ctx.from) {
        return next();
      }

      const telegramId = ctx.from.id.toString();
      const existingUser = await this.userService.getUser(telegramId);

      if (!existingUser) {
        // Create new user
        await this.userService.createUser({
          telegramId,
          username: ctx.from.username || '',
          firstName: ctx.from.first_name || '',
          lastName: ctx.from.last_name || '',
          phoneNumber: '',
          createdAt: Date.now(),
          lastActive: Date.now(),
          orderHistory: [],
          preferences: {
            language: 'uz',
            notifications: true,
          },
        });

        this.logger.log(
          `New user registered: ${telegramId} (${ctx.from.first_name})`,
          'UserRegistrationMiddleware',
        );
      } else {
        // Update last active timestamp
        await this.userService.updateUser(telegramId, {
          lastActive: Date.now(),
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `User registration middleware error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'UserRegistrationMiddleware',
      );
      // Continue even if registration fails
    }

    return next();
  }
}
