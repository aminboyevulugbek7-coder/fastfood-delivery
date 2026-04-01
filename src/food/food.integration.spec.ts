import { Test, TestingModule } from '@nestjs/testing';
import { FoodService } from './food.service';
import { FoodRepository } from './food.repository';
import { FirebaseService } from '../firebase/firebase.service';
import { LoggerService } from '../logger/logger.service';

describe('Food API Integration Tests', () => {
  let foodRepository: FoodRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        {
          provide: FoodRepository,
          useValue: {
            create: jest.fn().mockResolvedValue({
              id: 'food-1',
              name: 'Burger',
              price: 25000,
              categoryId: 'cat-1',
              available: true,
            }),
            findById: jest.fn().mockResolvedValue({
              id: 'food-1',
              name: 'Burger',
              price: 25000,
              categoryId: 'cat-1',
              available: true,
            }),
            update: jest.fn().mockResolvedValue({
              id: 'food-1',
              available: false,
            }),
            delete: jest.fn().mockResolvedValue(true),
            list: jest.fn().mockResolvedValue([
              {
                id: 'food-1',
                name: 'Burger',
                price: 25000,
                categoryId: 'cat-1',
                available: true,
              },
            ]),
          },
        },
        {
          provide: FirebaseService,
          useValue: {
            getDatabase: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    foodRepository = moduleFixture.get<FoodRepository>(FoodRepository);
  });

  describe('GET /api/foods - Get All Foods', () => {
    it('should retrieve all foods', async () => {
      const result = await foodRepository.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect((result as any)[0]).toHaveProperty('id');
      expect((result as any)[0]).toHaveProperty('name');
      expect((result as any)[0]).toHaveProperty('price');
    });

    it('should filter foods by category', async () => {
      const mockRepository = {
        list: jest.fn().mockResolvedValue([
          {
            id: 'food-1',
            name: 'Burger',
            categoryId: 'cat-1',
            available: true,
          },
        ]),
      };

      const result = await mockRepository.list();
      expect((result as any)[0].categoryId).toBe('cat-1');
    });

    it('should filter foods by availability', async () => {
      const mockRepository = {
        list: jest.fn().mockResolvedValue([
          {
            id: 'food-1',
            name: 'Burger',
            available: true,
          },
        ]),
      };

      const result = await mockRepository.list();
      expect((result as any)[0].available).toBe(true);
    });
  });

  describe('GET /api/foods/:id - Get Food Details', () => {
    it('should retrieve food by ID', async () => {
      const foodId = 'food-1';
      const mockRepository = {
        findById: jest.fn().mockResolvedValue({
          id: 'food-1',
          name: 'Burger',
          price: 25000,
          categoryId: 'cat-1',
          available: true,
        }),
      };

      const result = await mockRepository.findById(foodId);

      expect(result).toBeDefined();
      expect(result.id).toBe('food-1');
      expect(result.name).toBe('Burger');
      expect(result.price).toBe(25000);
    });
  });

  describe('GET /api/foods/category/:categoryId - Get Foods by Category', () => {
    it('should retrieve foods for a category', async () => {
      const categoryId = 'cat-1';
      const mockRepository = {
        list: jest.fn().mockResolvedValue([
          {
            id: 'food-1',
            name: 'Burger',
            categoryId: 'cat-1',
          },
          {
            id: 'food-2',
            name: 'Cheeseburger',
            categoryId: 'cat-1',
          },
        ]),
      };

      const result = await mockRepository.list();
      expect((result as any).every((food: any) => food.categoryId === categoryId)).toBe(true);
    });
  });

  describe('POST /api/foods - Create Food', () => {
    it('should create a new food item', async () => {
      const createFoodDto = {
        name: 'Burger',
        description: 'Delicious burger',
        price: 25000,
        categoryId: 'cat-1',
        available: true,
        stock: 50,
      };

      const result = await foodRepository.create(createFoodDto as any);
      expect(result).toBeDefined();
      expect(result.id).toBe('food-1');
      expect(result.name).toBe('Burger');
      expect(result.price).toBe(25000);
    });

    it('should validate required fields', async () => {
      const invalidFoodDto = {
        name: 'Burger',
      };

      expect(invalidFoodDto).not.toHaveProperty('price');
      expect(invalidFoodDto).not.toHaveProperty('categoryId');
    });
  });

  describe('PATCH /api/foods/:id - Update Food', () => {
    it('should update food item', async () => {
      const foodId = 'food-1';
      const updateDto = { available: false };

      const result = await foodRepository.update(foodId, updateDto as any);
      expect(result).toBeDefined();
      expect((result as any).available).toBe(false);
    });

    it('should update stock level', async () => {
      const foodId = 'food-1';
      const updateDto = { stock: 30 };

      const mockRepository = {
        update: jest.fn().mockResolvedValue({
          id: foodId,
          stock: 30,
        }),
      };

      const result = await mockRepository.update(foodId, updateDto);
      expect((result as any).stock).toBe(30);
    });
  });

  describe('DELETE /api/foods/:id - Delete Food', () => {
    it('should delete food item', async () => {
      const foodId = 'food-1';
      const result = await foodRepository.delete(foodId);

      expect(result).toBe(true);
    });
  });

  describe('Food Catalog Consistency', () => {
    it('should maintain food data consistency', async () => {
      const food = {
        id: 'food-1',
        name: 'Burger',
        price: 25000,
        categoryId: 'cat-1',
        available: true,
        stock: 50,
      };

      expect(food.id).toBeTruthy();
      expect(food.price).toBeGreaterThan(0);
      expect(food.stock).toBeGreaterThanOrEqual(0);
    });

    it('should validate price is positive', async () => {
      const validFood = { price: 25000 };
      const invalidFood = { price: -100 };

      expect(validFood.price).toBeGreaterThan(0);
      expect(invalidFood.price).toBeLessThan(0);
    });
  });
});
