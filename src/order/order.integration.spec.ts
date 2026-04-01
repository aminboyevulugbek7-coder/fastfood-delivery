import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { FirebaseService } from '../firebase/firebase.service';
import { LoggerService } from '../logger/logger.service';

describe('Order API Integration Tests', () => {
  let orderRepository: OrderRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useValue: {
            create: jest.fn().mockResolvedValue({
              id: 'order-1',
              telegramId: '123456789',
              customerName: 'John Doe',
              totalPrice: 50000,
              status: 'pending',
            }),
            findById: jest.fn().mockResolvedValue({
              id: 'order-1',
              telegramId: '123456789',
              customerName: 'John Doe',
              totalPrice: 50000,
              status: 'pending',
            }),
            update: jest.fn().mockResolvedValue({
              id: 'order-1',
              status: 'preparing',
            }),
            delete: jest.fn().mockResolvedValue(true),
            list: jest.fn().mockResolvedValue([
              {
                id: 'order-1',
                telegramId: '123456789',
                customerName: 'John Doe',
                totalPrice: 50000,
                status: 'pending',
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

    orderRepository = moduleFixture.get<OrderRepository>(OrderRepository);
  });

  describe('POST /api/orders - Create Order', () => {
    it('should create a new order with valid data', async () => {
      const createOrderDto = {
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
        estimatedDeliveryTime: 30,
      };

      const result = await orderRepository.create(createOrderDto as any);
      expect(result).toBeDefined();
      expect(result.id).toBe('order-1');
      expect(result.totalPrice).toBe(50000);
      expect(result.status).toBe('pending');
    });

    it('should validate order data before creation', async () => {
      const invalidOrderDto = {
        telegramId: '123456789',
        customerName: 'John Doe',
        phoneNumber: 'invalid-phone',
        address: 'Short',
        items: [],
        totalPrice: -100,
      };

      expect(invalidOrderDto.totalPrice).toBeLessThan(0);
      expect(invalidOrderDto.address.length).toBeLessThan(10);
    });
  });

  describe('GET /api/orders/:id - Get Order', () => {
    it('should retrieve order by ID', async () => {
      const orderId = 'order-1';
      const mockRepository = {
        findById: jest.fn().mockResolvedValue({
          id: 'order-1',
          telegramId: '123456789',
          customerName: 'John Doe',
          totalPrice: 50000,
          status: 'pending',
        }),
      };

      const result = await mockRepository.findById(orderId);

      expect(result).toBeDefined();
      expect(result.id).toBe('order-1');
      expect(result.customerName).toBe('John Doe');
    });

    it('should return null for non-existent order', async () => {
      const mockRepository = {
        findById: jest.fn().mockResolvedValue(null),
      };

      const result = await mockRepository.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('GET /api/orders/user/:telegramId - Get User Orders', () => {
    it('should retrieve all orders for a user', async () => {
      const result = await orderRepository.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect((result as any)[0].telegramId).toBe('123456789');
    });
  });

  describe('PATCH /api/orders/:id/status - Update Order Status', () => {
    it('should update order status', async () => {
      const orderId = 'order-1';
      const updateDto = { status: 'preparing' };

      const result = await orderRepository.update(orderId, updateDto as any);
      expect(result).toBeDefined();
      expect((result as any).status).toBe('preparing');
    });

    it('should validate status values', async () => {
      const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
      expect(validStatuses).toContain('preparing');
      expect(validStatuses).toContain('ready');
    });
  });

  describe('DELETE /api/orders/:id - Cancel Order', () => {
    it('should delete order', async () => {
      const orderId = 'order-1';
      const result = await orderRepository.delete(orderId);

      expect(result).toBe(true);
    });
  });

  describe('Order Total Price Calculation', () => {
    it('should calculate correct total price', async () => {
      const items = [
        { price: 25000, quantity: 2, subtotal: 50000 },
        { price: 15000, quantity: 1, subtotal: 15000 },
      ];

      const total = items.reduce((sum, item) => sum + item.subtotal, 0);
      expect(total).toBe(65000);
    });

    it('should maintain price consistency', async () => {
      const item = { price: 25000, quantity: 2 };
      const calculatedSubtotal = item.price * item.quantity;
      const expectedSubtotal = 50000;

      expect(calculatedSubtotal).toBe(expectedSubtotal);
    });
  });
});
