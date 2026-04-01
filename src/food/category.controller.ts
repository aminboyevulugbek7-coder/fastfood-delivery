import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Category } from './entities/category.entity';

@Controller('api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Get all categories
   * GET /api/categories
   * @returns Array of categories
   */
  @Get()
  async getAllCategories(): Promise<Category[]> {
    return this.categoryService.getAllCategories();
  }

  /**
   * Get category by ID
   * GET /api/categories/:id
   * @param id Category ID
   * @returns Category details
   */
  @Get(':id')
  async getCategory(@Param('id') id: string): Promise<Category> {
    return this.categoryService.getCategory(id);
  }

  /**
   * Create category (admin only)
   * POST /api/categories
   * @param createCategoryDto Category data
   * @returns Created category
   */
  @Post()
  @UseGuards(AdminGuard)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.createCategory(createCategoryDto);
  }

  /**
   * Update category (admin only)
   * PATCH /api/categories/:id
   * @param id Category ID
   * @param updateCategoryDto Updated category data
   * @returns Success response
   */
  @Patch(':id')
  @UseGuards(AdminGuard)
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.categoryService.updateCategory(id, updateCategoryDto);
    return {
      success: true,
      message: 'Kategoriya yangilandi',
    };
  }

  /**
   * Delete category (admin only)
   * DELETE /api/categories/:id
   * @param id Category ID
   * @returns Success response
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteCategory(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.categoryService.deleteCategory(id);
    return {
      success: true,
      message: 'Kategoriya o\'chirildi',
    };
  }
}
