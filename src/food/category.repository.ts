import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { FirebaseService } from '../firebase/firebase.service';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
  protected basePath = 'categories';

  constructor(firebaseService: FirebaseService) {
    super(firebaseService);
  }

  /**
   * Find active categories
   * @returns Array of active categories
   */
  async findActive(): Promise<Category[]> {
    const allCategories = await this.list();
    return allCategories
      .filter((cat: any) => cat.active === true)
      .sort((a: any, b: any) => a.order - b.order);
  }

  /**
   * Find categories by active status
   * @param active Active status
   * @returns Array of categories with specified status
   */
  async findByStatus(active: boolean): Promise<Category[]> {
    return this.findByField('active', active);
  }
}
