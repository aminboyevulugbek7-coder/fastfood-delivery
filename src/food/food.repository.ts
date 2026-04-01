import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { FirebaseService } from '../firebase/firebase.service';
import { Food } from './entities/food.entity';

@Injectable()
export class FoodRepository extends BaseRepository<Food> {
  protected basePath = 'foods';

  constructor(firebaseService: FirebaseService) {
    super(firebaseService);
  }

  /**
   * Find foods by category ID
   * @param categoryId Category ID
   * @returns Array of foods in the category
   */
  async findByCategory(categoryId: string): Promise<Food[]> {
    return this.findByField('categoryId', categoryId);
  }

  /**
   * Find available foods
   * @returns Array of available foods
   */
  async findAvailable(): Promise<Food[]> {
    const allFoods = await this.list();
    return allFoods.filter((food: any) => food.available === true);
  }

  /**
   * Find foods by availability status
   * @param available Availability status
   * @returns Array of foods with specified availability
   */
  async findByAvailability(available: boolean): Promise<Food[]> {
    return this.findByField('available', available);
  }
}
