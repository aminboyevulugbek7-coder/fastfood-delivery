import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Food } from './entities/food.entity';

@Controller('api/foods')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  /**
   * Get all foods with optional filters
   * GET /api/foods?category=category_id&available=true
   * @param category Filter by category ID (optional)
   * @param available Filter by availability (optional)
   * @returns Array of foods
   */
  @Get()
  async getAllFoods(
    @Query('category') category?: string,
    @Query('available') available?: string,
  ): Promise<Food[]> {
    return this.foodService.getAllFoods(category, available === 'true');
  }

  /**
   * Get food by ID
   * GET /api/foods/:id
   * @param id Food ID
   * @returns Food details
   */
  @Get(':id')
  async getFood(@Param('id') id: string): Promise<Food> {
    return this.foodService.getFood(id);
  }

  /**
   * Get foods by category
   * GET /api/foods/category/:categoryId
   * @param categoryId Category ID
   * @returns Array of foods in category
   */
  @Get('category/:categoryId')
  async getFoodsByCategory(@Param('categoryId') categoryId: string): Promise<Food[]> {
    return this.foodService.getFoodsByCategory(categoryId);
  }

  /**
   * Create food item (admin only)
   * POST /api/foods
   * @param createFoodDto Food data
   * @returns Created food
   */
  @Post()
  @UseGuards(AdminGuard)
  async createFood(@Body() createFoodDto: CreateFoodDto): Promise<Food> {
    return this.foodService.createFood(createFoodDto);
  }

  /**
   * Update food item (admin only)
   * PATCH /api/foods/:id
   * @param id Food ID
   * @param updateFoodDto Updated food data
   * @returns Success response
   */
  @Patch(':id')
  @UseGuards(AdminGuard)
  async updateFood(
    @Param('id') id: string,
    @Body() updateFoodDto: UpdateFoodDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.foodService.updateFood(id, updateFoodDto);
    return {
      success: true,
      message: 'Mahsulot yangilandi',
    };
  }

  /**
   * Delete food item (admin only)
   * DELETE /api/foods/:id
   * @param id Food ID
   * @returns Success response
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteFood(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.foodService.deleteFood(id);
    return {
      success: true,
      message: 'Mahsulot o\'chirildi',
    };
  }
}
