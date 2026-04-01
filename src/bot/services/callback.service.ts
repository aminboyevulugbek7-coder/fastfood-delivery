import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { KeyboardService } from './keyboard.service';
import { FoodService } from '../../food/food.service';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class CallbackService {
  constructor(
    private readonly keyboardService: KeyboardService,
    private readonly foodService: FoodService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Handle category selection callback
   */
  async handleCategorySelection(ctx: Context, categoryId: string): Promise<void> {
    try {
      const message = '📦 Mahsulotni tanlang:';
      const keyboard = await this.keyboardService.generateProductKeyboard(categoryId, 0);

      await ctx.editMessageText(message, {
        reply_markup: keyboard,
      });

      // Store selected category in session
      if (ctx.from) {
        (ctx as any).session = (ctx as any).session || {};
        ((ctx as any).session as any).selectedCategory = categoryId;
        ((ctx as any).session as any).currentPage = 0;
      }

      this.logger.log(
        `Category selected: ${categoryId} by user ${ctx.from?.id}`,
        'CallbackService',
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to handle category selection: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'CallbackService',
      );
      await ctx.answerCbQuery('Xatolik yuz berdi');
    }
  }

  /**
   * Handle product selection callback
   */
  async handleProductSelection(ctx: Context, foodId: string): Promise<void> {
    try {
      const food = await this.foodService.getFood(foodId);

      if (!food) {
        await ctx.answerCbQuery('Mahsulot topilmadi');
        return;
      }

      const message = `🛒 Miqdorni kiriting

Mahsulot: ${food.name}
Narxi: ${food.price.toLocaleString()} so'm

Miqdor (1-99):`;

      await ctx.editMessageText(message);

      // Store selected product in session
      if (ctx.from) {
        (ctx as any).session = (ctx as any).session || {};
        ((ctx as any).session as any).selectedFood = {
          id: food.id,
          name: food.name,
          price: food.price,
        };
        ((ctx as any).session as any).awaitingQuantity = true;
      }

      this.logger.log(
        `Product selected: ${foodId} by user ${ctx.from?.id}`,
        'CallbackService',
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to handle product selection: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'CallbackService',
      );
      await ctx.answerCbQuery('Xatolik yuz berdi');
    }
  }

  /**
   * Handle pagination callback
   */
  async handlePagination(
    ctx: Context,
    categoryId: string,
    page: number,
  ): Promise<void> {
    try {
      const message = '📦 Mahsulotni tanlang:';
      const keyboard = await this.keyboardService.generateProductKeyboard(categoryId, page);

      await ctx.editMessageText(message, {
        reply_markup: keyboard,
      });

      // Update current page in session
      if (ctx.from) {
        (ctx as any).session = (ctx as any).session || {};
        ((ctx as any).session as any).currentPage = page;
      }

      this.logger.log(
        `Pagination: category ${categoryId}, page ${page} by user ${ctx.from?.id}`,
        'CallbackService',
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to handle pagination: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'CallbackService',
      );
      await ctx.answerCbQuery('Xatolik yuz berdi');
    }
  }

  /**
   * Handle back to categories callback
   */
  async handleBackToCategories(ctx: Context): Promise<void> {
    try {
      const message = '📋 Kategoriyani tanlang:';
      const keyboard = await this.keyboardService.generateCategoryKeyboard();

      await ctx.editMessageText(message, {
        reply_markup: keyboard,
      });

      // Clear product selection from session
      if (ctx.from) {
        (ctx as any).session = (ctx as any).session || {};
        ((ctx as any).session as any).selectedFood = null;
        ((ctx as any).session as any).currentPage = 0;
      }

      this.logger.log(`Back to categories by user ${ctx.from?.id}`, 'CallbackService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to handle back to categories: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'CallbackService',
      );
      await ctx.answerCbQuery('Xatolik yuz berdi');
    }
  }

  /**
   * Handle confirmation callback
   */
  async handleConfirmation(ctx: Context): Promise<void> {
    try {
      if (ctx.from) {
        (ctx as any).session = (ctx as any).session || {};
        ((ctx as any).session as any).orderConfirmed = true;
      }

      await ctx.answerCbQuery('✅ Buyurtma tasdiqlandi!');
      this.logger.log(`Order confirmed by user ${ctx.from?.id}`, 'CallbackService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to handle confirmation: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'CallbackService',
      );
      await ctx.answerCbQuery('Xatolik yuz berdi');
    }
  }

  /**
   * Handle cancellation callback
   */
  async handleCancellation(ctx: Context): Promise<void> {
    try {
      // Clear session data
      if (ctx.from) {
        (ctx as any).session = (ctx as any).session || {};
        ((ctx as any).session as any).selectedCategory = null;
        ((ctx as any).session as any).selectedFood = null;
        ((ctx as any).session as any).awaitingQuantity = false;
        ((ctx as any).session as any).awaitingAddress = false;
        ((ctx as any).session as any).awaitingPhone = false;
        ((ctx as any).session as any).orderConfirmed = false;
        ((ctx as any).session as any).currentPage = 0;
      }

      const message = `Assalomu alaykum! 👋

FastFood Bagat ga xush kelibsiz! 🍔

Buyurtma berish uchun /menu buyrug'ini bosing!`;

      const keyboard = this.keyboardService.generateMainMenuKeyboard();

      await ctx.editMessageText(message, {
        reply_markup: keyboard,
      });

      await ctx.answerCbQuery('Buyurtma bekor qilindi');
      this.logger.log(`Order cancelled by user ${ctx.from?.id}`, 'CallbackService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to handle cancellation: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'CallbackService',
      );
      await ctx.answerCbQuery('Xatolik yuz berdi');
    }
  }
}
