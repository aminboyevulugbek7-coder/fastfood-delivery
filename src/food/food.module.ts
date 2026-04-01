import { Module } from '@nestjs/common';
import { FoodService } from './food.service';
import { FoodController } from './food.controller';
import { FoodRepository } from './food.repository';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from './category.repository';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [FoodService, FoodRepository, CategoryService, CategoryRepository],
  controllers: [FoodController, CategoryController],
  exports: [FoodService, FoodRepository, CategoryService, CategoryRepository],
})
export class FoodModule {}
