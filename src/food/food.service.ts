import { Injectable, NotFoundException } from '@nestjs/common';
import { FoodRepository } from './food.repository';
import { LoggerService } from '../logger/logger.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { Food } from './entities/food.entity';

@Injectable()
export class FoodService {
  constructor(
    private readonly foodRepository: FoodRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Create food item
   * @param createFoodDto Food data
   * @returns Created food
   */
  async createFood(createFoodDto: CreateFoodDto): Promise<Food> {
    try {
      const food = await this.foodRepository.create(createFoodDto);
      this.logger.log(`Food created: ${food.id}`, 'FoodService');
      return food;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create food: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FoodService',
      );
      throw error;
    }
  }

  /**
   * Get food by ID
   * @param id Food ID
   * @returns Food details
   */
  async getFood(id: string): Promise<Food> {
    try {
      const food = await this.foodRepository.read(id);
      if (!food) {
        throw new NotFoundException('Mahsulot topilmadi');
      }
      return food;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get food: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FoodService',
      );
      throw error;
    }
  }

  /**
   * Get all foods with optional filtering
   * @param categoryId Optional category filter
   * @param available Optional availability filter
   * @returns Array of foods
   */
  async getAllFoods(categoryId?: string, available?: boolean): Promise<Food[]> {
    try {
      let foods = await this.foodRepository.list();

      // Filter by category if provided
      if (categoryId) {
        foods = foods.filter((food) => food.categoryId === categoryId);
      }

      // Filter by availability if provided
      if (available !== undefined) {
        foods = foods.filter((food) => food.available === available);
      }

      return foods;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get all foods: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FoodService',
      );
      throw error;
    }
  }

  /**
   * Get foods by category
   * @param categoryId Category ID
   * @returns Array of foods in category
   */
  async getFoodsByCategory(categoryId: string): Promise<Food[]> {
    try {
      const foods = await this.foodRepository.findByCategory(categoryId);
      return foods;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get foods by category: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FoodService',
      );
      throw error;
    }
  }

  /**
   * Update food item
   * @param id Food ID
   * @param updateFoodDto Updated food data
   */
  async updateFood(id: string, updateFoodDto: UpdateFoodDto): Promise<void> {
    try {
      const food = await this.foodRepository.read(id);
      if (!food) {
        throw new NotFoundException('Mahsulot topilmadi');
      }

      await this.foodRepository.update(id, updateFoodDto);
      this.logger.log(`Food updated: ${id}`, 'FoodService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to update food: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FoodService',
      );
      throw error;
    }
  }

  /**
   * Delete food item
   * @param id Food ID
   */
  async deleteFood(id: string): Promise<void> {
    try {
      const food = await this.foodRepository.read(id);
      if (!food) {
        throw new NotFoundException('Mahsulot topilmadi');
      }

      await this.foodRepository.delete(id);
      this.logger.log(`Food deleted: ${id}`, 'FoodService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to delete food: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'FoodService',
      );
      throw error;
    }
  }
}
