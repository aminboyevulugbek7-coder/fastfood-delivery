import { Test, TestingModule } from '@nestjs/testing';
import { FoodService } from './food.service';
import { FoodRepository } from './food.repository';
import { LoggerService } from '../logger/logger.service';
import { NotFoundException } from '@nestjs/common';
import { CreateFoodDto } from './dto/create-food.dto';

describe('FoodService', () => {
  let service: FoodService;
  let repository: FoodRepository;

  const mockFood = {
    id: 'food-1',
    name: 'Klassik Burger',
    description: 'Mol go\'shti, pomidor, salat',
    price: 25000,
    categoryId: 'cat-1',
    imageUrl: 'https://example.com/burger.jpg',
    available: true,
    stock: 50,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        {
          provide: FoodRepository,
          useValue: {
            create: jest.fn(),
            read: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            list: jest.fn(),
            findByCategory: jest.fn(),
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

    service = module.get<FoodService>(FoodService);
    repository = module.get<FoodRepository>(FoodRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFood', () => {
    it('should create food with valid data', async () => {
      const createFoodDto: CreateFoodDto = {
        name: 'Klassik Burger',
        description: 'Mol go\'shti, pomidor, salat',
        price: 25000,
        categoryId: 'cat-1',
        imageUrl: 'https://example.com/burger.jpg',
        available: true,
        stock: 50,
      };

      jest.spyOn(repository, 'create').mockResolvedValue(mockFood);

      const result = await service.createFood(createFoodDto);

      expect(result).toEqual(mockFood);
      expect(repository.create).toHaveBeenCalledWith(createFoodDto);
    });
  });

  describe('getFood', () => {
    it('should return food by ID', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(mockFood);

      const result = await service.getFood('food-1');

      expect(result).toEqual(mockFood);
      expect(repository.read).toHaveBeenCalledWith('food-1');
    });

    it('should throw NotFoundException if food not found', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(null);

      await expect(service.getFood('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllFoods', () => {
    it('should return all foods', async () => {
      const foods = [mockFood, { ...mockFood, id: 'food-2' }];
      jest.spyOn(repository, 'list').mockResolvedValue(foods);

      const result = await service.getAllFoods();

      expect(result).toEqual(foods);
    });

    it('should filter foods by category', async () => {
      const foods = [mockFood, { ...mockFood, id: 'food-2', categoryId: 'cat-2' }];
      jest.spyOn(repository, 'list').mockResolvedValue(foods);

      const result = await service.getAllFoods('cat-1');

      expect(result).toHaveLength(1);
      expect(result[0]?.categoryId).toBe('cat-1');
    });

    it('should filter foods by availability', async () => {
      const foods = [mockFood, { ...mockFood, id: 'food-2', available: false }];
      jest.spyOn(repository, 'list').mockResolvedValue(foods);

      const result = await service.getAllFoods(undefined, true);

      expect(result).toHaveLength(1);
      expect(result[0]?.available).toBe(true);
    });
  });

  describe('getFoodsByCategory', () => {
    it('should return foods by category', async () => {
      const foods = [mockFood];
      jest.spyOn(repository, 'findByCategory').mockResolvedValue(foods);

      const result = await service.getFoodsByCategory('cat-1');

      expect(result).toEqual(foods);
      expect(repository.findByCategory).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('updateFood', () => {
    it('should update food', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(mockFood);
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

      const updateDto = { price: 30000 };
      await service.updateFood('food-1', updateDto);

      expect(repository.update).toHaveBeenCalledWith('food-1', updateDto);
    });

    it('should throw NotFoundException if food not found', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(null);

      await expect(
        service.updateFood('non-existent', { price: 30000 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFood', () => {
    it('should delete food', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(mockFood);
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

      await service.deleteFood('food-1');

      expect(repository.delete).toHaveBeenCalledWith('food-1');
    });

    it('should throw NotFoundException if food not found', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(null);

      await expect(service.deleteFood('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
