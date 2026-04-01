import { Injectable } from '@nestjs/common';
import { FoodService } from '../../food/food.service';
import { CategoryRepository } from '../../food/category.repository';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class KeyboardService {
  private readonly ITEMS_PER_PAGE = 5;

  constructor(
    private readonly foodService: FoodService,
    private readonly categoryRepository: CategoryRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Generate category keyboard from Firebase data
   */
  async generateCategoryKeyboard(): Promise<any> {
    try {
      const categories = await this.categoryRepository.findActive();

      const buttons = categories.map((cat: any) => [
        {
          text: `${this.getCategoryEmoji(cat.name)} ${cat.name}`,
          callback_data: `cat_${cat.id}`,
        },
      ]);

      // Add cancel button
      buttons.push([{ text: '❌ Bekor qilish', callback_data: 'cancel' }]);

      return {
        inline_keyboard: buttons,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to generate category keyboard: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'KeyboardService',
      );
      throw error;
    }
  }

  /**
   * Generate product keyboard for a category with pagination
   */
  async generateProductKeyboard(
    categoryId: string,
    page: number = 0,
  ): Promise<any> {
    try {
      const allFoods = await this.foodService.getAllFoods();
      const categoryFoods = allFoods.filter(
        (food: any) => food.categoryId === categoryId && food.available,
      );

      const totalPages = Math.ceil(categoryFoods.length / this.ITEMS_PER_PAGE);
      const startIdx = page * this.ITEMS_PER_PAGE;
      const endIdx = startIdx + this.ITEMS_PER_PAGE;
      const pageItems = categoryFoods.slice(startIdx, endIdx);

      const buttons = pageItems.map((food: any) => [
        {
          text: `${food.name} - ${food.price.toLocaleString()} so'm`,
          callback_data: `food_${food.id}`,
        },
      ]);

      // Add pagination buttons
      const paginationButtons = [];
      if (page > 0) {
        paginationButtons.push({
          text: '⬅️ Orqaga',
          callback_data: `prod_page_${categoryId}_${page - 1}`,
        });
      }
      if (page < totalPages - 1) {
        paginationButtons.push({
          text: '➡️ Keyingi',
          callback_data: `prod_page_${categoryId}_${page + 1}`,
        });
      }

      if (paginationButtons.length > 0) {
        buttons.push(paginationButtons);
      }

      // Add back button
      buttons.push([
        { text: '🔙 Kategoriyalarga qaytish', callback_data: 'back_to_categories' },
      ]);

      return {
        inline_keyboard: buttons,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to generate product keyboard: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'KeyboardService',
      );
      throw error;
    }
  }

  /**
   * Generate confirmation keyboard
   */
  generateConfirmationKeyboard(): any {
    return {
      inline_keyboard: [
        [
          { text: '✅ Tasdiqlash', callback_data: 'confirm_order' },
          { text: '❌ Bekor qilish', callback_data: 'cancel_order' },
        ],
      ],
    };
  }

  /**
   * Generate main menu keyboard
   */
  generateMainMenuKeyboard(): any {
    return {
      inline_keyboard: [
        [{ text: '🍔 Menyu', callback_data: 'menu' }],
        [{ text: '📋 Mening buyurtmalarim', callback_data: 'orders' }],
        [{ text: '❓ Yordam', callback_data: 'help' }],
        [{ text: '📞 Aloqa', callback_data: 'contact' }],
      ],
    };
  }

  /**
   * Get emoji for category name
   */
  private getCategoryEmoji(categoryName: string): string {
    const emojiMap: { [key: string]: string } = {
      burger: '🍔',
      burgerlar: '🍔',
      pizza: '🍕',
      pizzalar: '🍕',
      drink: '🥤',
      ichimlik: '🥤',
      ichimliklar: '🥤',
      side: '🍟',
      qoshimcha: '🍟',
      qoshimchalar: '🍟',
      salad: '🥗',
      salatlar: '🥗',
      dessert: '🍰',
      dessertlar: '🍰',
    };

    const lowerName = categoryName.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerName.includes(key)) {
        return emoji;
      }
    }

    return '📦'; // Default emoji
  }

  /**
   * Find active categories from Firebase
   */
  async findActiveCategories(): Promise<any[]> {
    try {
      const categories = await this.categoryRepository.findActive();
      return categories;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to find active categories: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'KeyboardService',
      );
      throw error;
    }
  }
}
