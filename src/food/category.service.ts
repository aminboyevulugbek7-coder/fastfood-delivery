import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { LoggerService } from '../logger/logger.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Create category
   * @param createCategoryDto Category data
   * @returns Created category
   */
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const category = await this.categoryRepository.create(createCategoryDto);
      this.logger.log(`Category created: ${category.id}`, 'CategoryService');
      return category;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create category: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'CategoryService',
      );
      throw error;
    }
  }

  /**
   * Get category by ID
   * @param id Category ID
   * @returns Category details
   */
  async getCategory(id: string): Promise<Category> {
    try {
      const category = await this.categoryRepository.read(id);
      if (!category) {
        throw new NotFoundException('Kategoriya topilmadi');
      }
      return category;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get category: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'CategoryService',
      );
      throw error;
    }
  }

  /**
   * Get all categories
   * @returns Array of categories
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const categories = await this.categoryRepository.list();
      // Sort by order field
      return categories.sort((a, b) => a.order - b.order);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get all categories: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'CategoryService',
      );
      throw error;
    }
  }

  /**
   * Update category
   * @param id Category ID
   * @param updateCategoryDto Updated category data
   */
  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<void> {
    try {
      const category = await this.categoryRepository.read(id);
      if (!category) {
        throw new NotFoundException('Kategoriya topilmadi');
      }

      await this.categoryRepository.update(id, updateCategoryDto);
      this.logger.log(`Category updated: ${id}`, 'CategoryService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to update category: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'CategoryService',
      );
      throw error;
    }
  }

  /**
   * Delete category
   * @param id Category ID
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const category = await this.categoryRepository.read(id);
      if (!category) {
        throw new NotFoundException('Kategoriya topilmadi');
      }

      await this.categoryRepository.delete(id);
      this.logger.log(`Category deleted: ${id}`, 'CategoryService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to delete category: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'CategoryService',
      );
      throw error;
    }
  }
}
