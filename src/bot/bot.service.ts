import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { Telegraf, Context, Scenes, session } from 'telegraf';
import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';
import { UserService } from '../user/user.service';
import { StartCommand } from './commands/start.command';
import { MenuCommand } from './commands/menu.command';
import { OrdersCommand } from './commands/orders.command';
import { HelpCommand } from './commands/help.command';
import { ContactCommand } from './commands/contact.command';
import { AdminCommand } from './commands/admin.command';
import { OrderWizardScene } from './scenes/order-wizard.scene';

interface BotContext extends Context {
  scene: any;
  session: any;
}

@Injectable()
export class BotService implements OnModuleInit, OnApplicationShutdown {
  private bot: Telegraf<BotContext> | null = null;
  private stage: Scenes.Stage<BotContext> | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly userService: UserService,
    private readonly startCommand: StartCommand,
    private readonly menuCommand: MenuCommand,
    private readonly ordersCommand: OrdersCommand,
    private readonly helpCommand: HelpCommand,
    private readonly contactCommand: ContactCommand,
    private readonly adminCommand: AdminCommand,
    private readonly orderWizardScene: OrderWizardScene,
  ) {}

  onModuleInit(): void {
    this.initializeBot();
    this.setupMiddleware();
    this.registerCommands();
  }

  onApplicationShutdown(): void {
    this.stop();
  }

  private initializeBot(): void {
    try {
      this.bot = new Telegraf(this.configService.telegramBotToken);

      // Setup session middleware
      this.bot.use(session());

      // Setup stage with wizard scene
      this.stage = new Scenes.Stage<BotContext>([this.orderWizardScene.createScene()]);
      this.bot.use(this.stage.middleware());

      this.logger.log('Telegram bot initialized successfully', 'BotService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to initialize Telegram bot: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'BotService',
      );
      throw error;
    }
  }

  private setupMiddleware(): void {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    // User registration middleware
    this.bot.use(async (ctx: BotContext, next: () => Promise<void>) => {
      try {
        if (ctx.from) {
          const existingUser = await this.userService.getUser(ctx.from.id.toString());
          if (!existingUser) {
            await this.userService.createUser({
              telegramId: ctx.from.id.toString(),
              username: ctx.from.username || '',
              firstName: ctx.from.first_name || '',
              lastName: ctx.from.last_name || '',
              createdAt: Date.now(),
              lastActive: Date.now(),
              orderHistory: [],
              preferences: {
                language: 'uz',
                notifications: true,
              },
            });
            this.logger.log(`New user registered: ${ctx.from.id}`, 'BotService');
          } else {
            // Update last active timestamp
            await this.userService.updateUser(ctx.from.id.toString(), {
              lastActive: Date.now(),
            });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Middleware error: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
          'BotService',
        );
      }
      return next();
    });
  }

  private registerCommands(): void {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    // Register /start command
    this.bot.command('start', (ctx: BotContext) => this.startCommand.execute(ctx));

    // Register /menu command - enters order wizard
    this.bot.command('menu', async (ctx: BotContext) => {
      try {
        await ctx.scene.enter(this.orderWizardScene.getSceneId());
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Menu command error: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
          'BotService',
        );
        await this.menuCommand.execute(ctx);
      }
    });

    // Register /orders command
    this.bot.command('orders', (ctx: BotContext) => this.ordersCommand.execute(ctx));

    // Register /help command
    this.bot.command('help', (ctx: BotContext) => this.helpCommand.execute(ctx));

    // Register /contact command
    this.bot.command('contact', (ctx: BotContext) => this.contactCommand.execute(ctx));

    // Register /admin command
    this.bot.command('admin', (ctx: BotContext) => this.adminCommand.execute(ctx));

    // Handle callback queries for main menu
    this.bot.action('menu', async (ctx: BotContext) => {
      try {
        await ctx.scene.enter(this.orderWizardScene.getSceneId());
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Menu callback error: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
          'BotService',
        );
        await ctx.answerCbQuery('Xatolik yuz berdi');
      }
    });

    this.bot.action('orders', (ctx: BotContext) => this.ordersCommand.execute(ctx));
    this.bot.action('help', (ctx: BotContext) => this.helpCommand.execute(ctx));
    this.bot.action('contact', (ctx: BotContext) => this.contactCommand.execute(ctx));

    // Handle admin token validation
    this.bot.on('message', async (ctx: BotContext) => {
      try {
        const session = ctx.session as any;
        if (session?.awaitingAdminToken && ctx.message && 'text' in ctx.message) {
          const token = ctx.message.text.trim();
          const isValid = await this.adminCommand.validateToken(ctx, token);

          if (isValid) {
            session.awaitingAdminToken = false;
            await this.adminCommand.showAdminPanel(ctx);
          } else {
            await ctx.reply('❌ Token noto\'g\'ri. Iltimos, qayta urinib ko\'ring.');
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Admin token validation error: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
          'BotService',
        );
      }
    });

    this.logger.log('All bot commands registered', 'BotService');
  }

  getBot(): Telegraf<BotContext> {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }
    return this.bot;
  }

  async launch(): Promise<void> {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    try {
      await this.bot.launch();
      this.logger.log('Telegram bot launched successfully', 'BotService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to launch Telegram bot: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'BotService',
      );
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.bot) {
      return;
    }

    try {
      await this.bot.stop();
      this.logger.log('Telegram bot stopped', 'BotService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to stop Telegram bot: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'BotService',
      );
    }
  }

  async handleUpdate(update: any): Promise<void> {
    if (!this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    try {
      await this.bot.handleUpdate(update);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to handle update: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'BotService',
      );
      throw error;
    }
  }
}
