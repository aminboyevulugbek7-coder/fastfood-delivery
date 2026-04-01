import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { LoggerService } from '../logger/logger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

describe('OrderService', () => {
  let service: OrderService;
  let repository: OrderRepository;

  const mockOrder: Order = {
    id: 'order-1',
    telegramId: '123456',
    customerName: 'John Doe',
    phoneNumber: '+998901234567',
    address: 'Tashkent',
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
    status: 'pending' as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    estimatedDeliveryTime: 30,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useValue: {
            create: jest.fn(),
            read: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            list: jest.fn(),
            findByTelegramId: jest.fn(),
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

    service = module.get<OrderService>(OrderService);
    repository = module.get<OrderRepository>(OrderRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create order with valid data', async () => {
      const createOrderDto: CreateOrderDto = {
        telegramId: '123456',
        customerName: 'John Doe',
        phoneNumber: '+998901234567',
        address: 'Tashkent',
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

      jest.spyOn(repository, 'create').mockResolvedValue(mockOrder);

      const result = await service.createOrder(createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(repository.create).toHaveBeenCalledWith(createOrderDto);
    });

    it('should throw error if total price does not match', async () => {
      const createOrderDto: CreateOrderDto = {
        telegramId: '123456',
        customerName: 'John Doe',
        phoneNumber: '+998901234567',
        address: 'Tashkent',
        items: [
          {
            foodId: 'food-1',
            name: 'Burger',
            price: 25000,
            quantity: 2,
            subtotal: 50000,
          },
        ],
        totalPrice: 60000, // Wrong total
        notes: '',
        estimatedDeliveryTime: 30,
      };

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getOrder', () => {
    it('should return order by ID', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(mockOrder);

      const result = await service.getOrder('order-1');

      expect(result).toEqual(mockOrder);
      expect(repository.read).toHaveBeenCalledWith('order-1');
    });

    it('should throw NotFoundException if order not found', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(null);

      await expect(service.getOrder('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserOrders', () => {
    it('should return user orders by telegram ID', async () => {
      jest.spyOn(repository, 'findByTelegramId').mockResolvedValue([mockOrder]);

      const result = await service.getUserOrders('123456');

      expect(result).toEqual([mockOrder]);
      expect(repository.findByTelegramId).toHaveBeenCalledWith('123456');
    });

    it('should return empty array if user has no orders', async () => {
      jest.spyOn(repository, 'findByTelegramId').mockResolvedValue([]);

      const result = await service.getUserOrders('123456');

      expect(result).toEqual([]);
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      const orders = [mockOrder, { ...mockOrder, id: 'order-2' }];
      jest.spyOn(repository, 'list').mockResolvedValue(orders);

      const result = await service.getAllOrders(1, 10);

      expect(result.data).toEqual(orders);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter orders by status', async () => {
      const orders = [
        mockOrder,
        { ...mockOrder, id: 'order-2', status: 'delivered' as const },
      ];
      jest.spyOn(repository, 'list').mockResolvedValue(orders);

      const result = await service.getAllOrders(1, 10, 'pending');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.status).toBe('pending');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(mockOrder);
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

      await service.updateOrderStatus('order-1', { status: 'preparing' });

      expect(repository.update).toHaveBeenCalledWith('order-1', {
        status: 'preparing',
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(null);

      await expect(
        service.updateOrderStatus('non-existent', { status: 'preparing' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(mockOrder);
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

      await service.deleteOrder('order-1');

      expect(repository.delete).toHaveBeenCalledWith('order-1');
    });

    it('should throw NotFoundException if order not found', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(null);

      await expect(service.deleteOrder('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
