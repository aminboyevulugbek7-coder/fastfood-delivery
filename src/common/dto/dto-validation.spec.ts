import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateOrderDto, OrderItemDto } from '../../order/dto/create-order.dto';
import { CreateFoodDto } from '../../food/dto/create-food.dto';
import { CreateCategoryDto } from '../../food/dto/create-category.dto';
import { UploadImageDto } from '../../image/dto/upload-image.dto';

describe('DTO Validation', () => {
  describe('CreateOrderDto', () => {
    const validOrderData = {
      telegramId: '123456789',
      customerName: 'John Doe',
      phoneNumber: '+998901234567',
      address: 'Tashkent, Mirabad District, Street 123',
      items: [
        {
          foodId: 'food-1',
          name: 'Burger',
          price: 25000,
          quantity: 2,
          subtotal: 50000,
        },
      ],
      totalPrice: 50000,
      notes: 'No onions',
      estimatedDeliveryTime: 30,
    };

    it('should validate correct order data', async () => {
      const dto = plainToClass(CreateOrderDto, validOrderData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid phone number format', async () => {
      const invalidData = { ...validOrderData, phoneNumber: '1234567890' };
      const dto = plainToClass(CreateOrderDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('phoneNumber');
    });

    it('should accept valid Uzbek phone formats', async () => {
      const validPhones = ['+998901234567', '998901234567'];
      for (const phone of validPhones) {
        const data = { ...validOrderData, phoneNumber: phone };
        const dto = plainToClass(CreateOrderDto, data);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject short address', async () => {
      const invalidData = { ...validOrderData, address: 'Short' };
      const dto = plainToClass(CreateOrderDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('address');
    });

    it('should validate nested order items', async () => {
      const dto = plainToClass(CreateOrderDto, validOrderData);
      const errors = await validate(dto, { skipMissingProperties: false });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid nested items', async () => {
      const invalidData = {
        ...validOrderData,
        items: [
          {
            foodId: 'food-1',
            name: 'Burger',
            price: -100, // Invalid: negative price
            quantity: 2,
            subtotal: 50000,
          },
        ],
      };
      const dto = plainToClass(CreateOrderDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing required fields', async () => {
      const incompleteData = {
        telegramId: '123456789',
        customerName: 'John Doe',
        // Missing phoneNumber, address, items, totalPrice
      };
      const dto = plainToClass(CreateOrderDto, incompleteData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-positive quantity', async () => {
      const invalidData = {
        ...validOrderData,
        items: [
          {
            foodId: 'food-1',
            name: 'Burger',
            price: 25000,
            quantity: 0, // Invalid: zero quantity
            subtotal: 0,
          },
        ],
      };
      const dto = plainToClass(CreateOrderDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow optional notes field', async () => {
      const dataWithoutNotes = { ...validOrderData } as any;
      delete dataWithoutNotes.notes;
      const dto = plainToClass(CreateOrderDto, dataWithoutNotes);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('CreateFoodDto', () => {
    const validFoodData = {
      name: 'Klassik Burger',
      description: 'Mol go\'shti, pomidor, salat',
      price: 25000,
      categoryId: 'cat-1',
      imageUrl: 'https://example.com/burger.jpg',
      available: true,
      stock: 50,
    };

    it('should validate correct food data', async () => {
      const dto = plainToClass(CreateFoodDto, validFoodData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject negative price', async () => {
      const invalidData = { ...validFoodData, price: -100 };
      const dto = plainToClass(CreateFoodDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject negative stock', async () => {
      const invalidData = { ...validFoodData, stock: -10 };
      const dto = plainToClass(CreateFoodDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing required fields', async () => {
      const incompleteData = {
        name: 'Burger',
        // Missing description, price, categoryId
      };
      const dto = plainToClass(CreateFoodDto, incompleteData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate string fields', async () => {
      const invalidData = { ...validFoodData, name: 123 }; // Invalid: number instead of string
      const dto = plainToClass(CreateFoodDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('CreateCategoryDto', () => {
    const validCategoryData = {
      name: 'Burgerlar',
      description: 'Mazali burgerlar',
      order: 1,
      active: true,
    };

    it('should validate correct category data', async () => {
      const dto = plainToClass(CreateCategoryDto, validCategoryData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject missing required fields', async () => {
      const incompleteData = {
        name: 'Burgerlar',
        // Missing description, order
      };
      const dto = plainToClass(CreateCategoryDto, incompleteData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate boolean fields', async () => {
      const invalidData = { ...validCategoryData, active: 'yes' }; // Invalid: string instead of boolean
      const dto = plainToClass(CreateCategoryDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UploadImageDto', () => {
    const validImageData = {
      filename: 'burger.jpg',
      mimeType: 'image/jpeg',
      size: 102400,
    };

    it('should validate correct image data', async () => {
      const dto = plainToClass(UploadImageDto, validImageData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid MIME type', async () => {
      const invalidData = { ...validImageData, mimeType: 'application/pdf' };
      const dto = plainToClass(UploadImageDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept valid image MIME types', async () => {
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      for (const mimeType of validMimeTypes) {
        const data = { ...validImageData, mimeType };
        const dto = plainToClass(UploadImageDto, data);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject file size exceeding 5MB', async () => {
      const invalidData = { ...validImageData, size: 6 * 1024 * 1024 }; // 6MB
      const dto = plainToClass(UploadImageDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject zero file size', async () => {
      const invalidData = { ...validImageData, size: 0 };
      const dto = plainToClass(UploadImageDto, invalidData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing required fields', async () => {
      const incompleteData = {
        filename: 'burger.jpg',
        // Missing mimeType, size
      };
      const dto = plainToClass(UploadImageDto, incompleteData);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Validators', () => {
    it('should validate Uzbek phone numbers correctly', async () => {
      const validPhones = ['+998901234567', '998901234567'];
      const invalidPhones = ['1234567890', '+9989012345', 'abc'];

      for (const phone of validPhones) {
        const data = {
          telegramId: '123',
          customerName: 'Test',
          phoneNumber: phone,
          address: 'Valid Address 123',
          items: [],
          totalPrice: 0,
        };
        const dto = plainToClass(CreateOrderDto, data);
        const errors = await validate(dto);
        const phoneErrors = errors.filter((e) => e.property === 'phoneNumber');
        expect(phoneErrors).toHaveLength(0);
      }

      for (const phone of invalidPhones) {
        const data = {
          telegramId: '123',
          customerName: 'Test',
          phoneNumber: phone,
          address: 'Valid Address 123',
          items: [],
          totalPrice: 0,
        };
        const dto = plainToClass(CreateOrderDto, data);
        const errors = await validate(dto);
        const phoneErrors = errors.filter((e) => e.property === 'phoneNumber');
        expect(phoneErrors.length).toBeGreaterThan(0);
      }
    });

    it('should validate addresses correctly', async () => {
      const validAddresses = [
        'Tashkent, Mirabad District',
        'Samarkand, Registan Street 123',
        'Bukhara, Old City 456',
      ];
      const invalidAddresses = ['Short', 'A', '123'];

      for (const address of validAddresses) {
        const data = {
          telegramId: '123',
          customerName: 'Test',
          phoneNumber: '+998901234567',
          address,
          items: [],
          totalPrice: 0,
        };
        const dto = plainToClass(CreateOrderDto, data);
        const errors = await validate(dto);
        const addressErrors = errors.filter((e) => e.property === 'address');
        expect(addressErrors).toHaveLength(0);
      }

      for (const address of invalidAddresses) {
        const data = {
          telegramId: '123',
          customerName: 'Test',
          phoneNumber: '+998901234567',
          address,
          items: [],
          totalPrice: 0,
        };
        const dto = plainToClass(CreateOrderDto, data);
        const errors = await validate(dto);
        const addressErrors = errors.filter((e) => e.property === 'address');
        expect(addressErrors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('DTO Transformation', () => {
    it('should transform plain object to DTO instance', async () => {
      const plainData = {
        telegramId: '123456789',
        customerName: 'John Doe',
        phoneNumber: '+998901234567',
        address: 'Tashkent, Mirabad District',
        items: [
          {
            foodId: 'food-1',
            name: 'Burger',
            price: 25000,
            quantity: 2,
            subtotal: 50000,
          },
        ],
        totalPrice: 50000,
      };

      const dto = plainToClass(CreateOrderDto, plainData);

      expect(dto).toBeInstanceOf(CreateOrderDto);
      expect(dto.telegramId).toBe('123456789');
      expect(dto.items).toHaveLength(1);
      expect(dto.items[0]).toBeInstanceOf(OrderItemDto);
    });

    it('should handle nested object transformation', async () => {
      const plainData = {
        telegramId: '123456789',
        customerName: 'John Doe',
        phoneNumber: '+998901234567',
        address: 'Tashkent, Mirabad District',
        items: [
          {
            foodId: 'food-1',
            name: 'Burger',
            price: 25000,
            quantity: 2,
            subtotal: 50000,
          },
          {
            foodId: 'food-2',
            name: 'Pizza',
            price: 35000,
            quantity: 1,
            subtotal: 35000,
          },
        ],
        totalPrice: 85000,
      };

      const dto = plainToClass(CreateOrderDto, plainData);

      expect(dto.items).toHaveLength(2);
      expect(dto.items[0]?.name).toBe('Burger');
      expect(dto.items[1]?.name).toBe('Pizza');
      expect(dto.items.every((item) => item instanceof OrderItemDto)).toBe(true);
    });
  });
});
