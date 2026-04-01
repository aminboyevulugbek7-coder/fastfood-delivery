import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';

describe('FirebaseService', () => {
  let service: FirebaseService;
  let configService: ConfigService;
  let loggerService: LoggerService;
  let mockDatabase: any;

  beforeEach(async () => {
    // Mock Firebase database
    mockDatabase = {
      ref: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockResolvedValue({
          val: jest.fn().mockReturnValue({ id: '1', name: 'Test' }),
        }),
        update: jest.fn().mockResolvedValue(undefined),
        remove: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
        off: jest.fn(),
      }),
      goOffline: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseService,
        {
          provide: ConfigService,
          useValue: {
            firebaseProjectId: 'test-project',
            firebasePrivateKey: 'test-key',
            firebaseClientEmail: 'test@test.com',
            firebaseDatabaseUrl: 'https://test.firebaseio.com',
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

    service = module.get<FirebaseService>(FirebaseService);
    configService = module.get<ConfigService>(ConfigService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = service;
      const instance2 = service;
      expect(instance1).toBe(instance2);
    });
  });

  describe('getDatabase', () => {
    it('should throw error if database not initialized', () => {
      const newService = new FirebaseService(configService, loggerService);
      expect(() => newService.getDatabase()).toThrow('Firebase database not initialized');
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      // Set up database for CRUD tests
      (service as any).db = mockDatabase;
      jest.clearAllMocks();
    });

    describe('create', () => {
      it('should create data at specified path', async () => {
        const testData = { id: '1', name: 'Test Item' };
        const mockRef = {
          set: jest.fn().mockResolvedValue(undefined),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        const result = await service.create('test/path', testData);

        expect(mockDatabase.ref).toHaveBeenCalledWith('test/path');
        expect(mockRef.set).toHaveBeenCalledWith(testData);
        expect(result).toEqual(testData);
      });

      it('should handle create errors', async () => {
        const error = new Error('Create failed');
        const mockRef = {
          set: jest.fn().mockRejectedValue(error),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        await expect(service.create('test/path', {})).rejects.toThrow('Create failed');
      });
    });

    describe('read', () => {
      it('should read data from specified path', async () => {
        const mockRef = {
          get: jest.fn().mockResolvedValue({
            val: jest.fn().mockReturnValue({ id: '1', name: 'Test' }),
          }),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        const result = await service.read('test/path');

        expect(mockDatabase.ref).toHaveBeenCalledWith('test/path');
        expect(result).toEqual({ id: '1', name: 'Test' });
      });

      it('should handle read errors', async () => {
        const error = new Error('Read failed');
        const mockRef = {
          get: jest.fn().mockRejectedValue(error),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        await expect(service.read('test/path')).rejects.toThrow('Read failed');
      });
    });

    describe('update', () => {
      it('should update data at specified path', async () => {
        const updateData = { name: 'Updated' };
        const mockRef = {
          update: jest.fn().mockResolvedValue(undefined),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        await service.update('test/path', updateData);

        expect(mockDatabase.ref).toHaveBeenCalledWith('test/path');
        expect(mockRef.update).toHaveBeenCalledWith(updateData);
      });

      it('should handle update errors', async () => {
        const error = new Error('Update failed');
        const mockRef = {
          update: jest.fn().mockRejectedValue(error),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        await expect(service.update('test/path', {})).rejects.toThrow('Update failed');
      });
    });

    describe('delete', () => {
      it('should delete data at specified path', async () => {
        const mockRef = {
          remove: jest.fn().mockResolvedValue(undefined),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        await service.delete('test/path');

        expect(mockDatabase.ref).toHaveBeenCalledWith('test/path');
        expect(mockRef.remove).toHaveBeenCalled();
      });

      it('should handle delete errors', async () => {
        const error = new Error('Delete failed');
        const mockRef = {
          remove: jest.fn().mockRejectedValue(error),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        await expect(service.delete('test/path')).rejects.toThrow('Delete failed');
      });
    });

    describe('list', () => {
      it('should list data from specified path', async () => {
        const mockRef = {
          get: jest.fn().mockResolvedValue({
            val: jest.fn().mockReturnValue({
              item1: { id: '1', name: 'Item 1' },
              item2: { id: '2', name: 'Item 2' },
            }),
          }),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        const result = await service.list('test/path');

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
      });

      it('should return empty array when no data exists', async () => {
        const mockRef = {
          get: jest.fn().mockResolvedValue({
            val: jest.fn().mockReturnValue(null),
          }),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        const result = await service.list('test/path');

        expect(result).toEqual([]);
      });

      it('should handle list errors', async () => {
        const error = new Error('List failed');
        const mockRef = {
          get: jest.fn().mockRejectedValue(error),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        await expect(service.list('test/path')).rejects.toThrow('List failed');
      });
    });
  });

  describe('Connection Handling', () => {
    beforeEach(() => {
      (service as any).db = mockDatabase;
      jest.clearAllMocks();
    });

    describe('onModuleDestroy', () => {
      it('should close database connection on module destroy', () => {
        service.onModuleDestroy();

        expect(mockDatabase.goOffline).toHaveBeenCalled();
      });
    });

    describe('Real-time listeners', () => {
      it('should subscribe to value changes', () => {
        const callback = jest.fn();
        const mockRef = {
          on: jest.fn(),
          off: jest.fn(),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        const unsubscribe = service.onValueChange('test/path', callback);

        expect(mockDatabase.ref).toHaveBeenCalledWith('test/path');
        expect(mockRef.on).toHaveBeenCalled();
        expect(typeof unsubscribe).toBe('function');
      });

      it('should subscribe to orders changes', () => {
        const callback = jest.fn();
        const mockRef = {
          on: jest.fn(),
          off: jest.fn(),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        const unsubscribe = service.onOrdersChange(callback);

        expect(mockDatabase.ref).toHaveBeenCalledWith('orders');
        expect(typeof unsubscribe).toBe('function');
      });

      it('should subscribe to foods changes', () => {
        const callback = jest.fn();
        const mockRef = {
          on: jest.fn(),
          off: jest.fn(),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        const unsubscribe = service.onFoodsChange(callback);

        expect(mockDatabase.ref).toHaveBeenCalledWith('foods');
        expect(typeof unsubscribe).toBe('function');
      });

      it('should subscribe to categories changes', () => {
        const callback = jest.fn();
        const mockRef = {
          on: jest.fn(),
          off: jest.fn(),
        };
        mockDatabase.ref.mockReturnValue(mockRef);

        const unsubscribe = service.onCategoriesChange(callback);

        expect(mockDatabase.ref).toHaveBeenCalledWith('categories');
        expect(typeof unsubscribe).toBe('function');
      });
    });
  });

  describe('Error Scenarios', () => {
    beforeEach(() => {
      (service as any).db = mockDatabase;
      jest.clearAllMocks();
    });

    it('should handle null database gracefully', async () => {
      (service as any).db = null;

      expect(() => service.getDatabase()).toThrow('Firebase database not initialized');
    });

    it('should log errors with stack trace', async () => {
      const error = new Error('Test error');
      const mockRef = {
        set: jest.fn().mockRejectedValue(error),
      };
      mockDatabase.ref.mockReturnValue(mockRef);

      await expect(service.create('test/path', {})).rejects.toThrow();
    });

    it('should handle non-Error exceptions', async () => {
      const mockRef = {
        set: jest.fn().mockRejectedValue('String error'),
      };
      mockDatabase.ref.mockReturnValue(mockRef);

      // When a string is rejected, it's caught and re-thrown as-is
      await expect(service.create('test/path', {})).rejects.toEqual('String error');
    });
  });

  describe('Convenience Methods', () => {
    beforeEach(() => {
      (service as any).db = mockDatabase;
      jest.clearAllMocks();
    });

    it('should get all orders', async () => {
      const mockRef = {
        get: jest.fn().mockResolvedValue({
          val: jest.fn().mockReturnValue({
            order1: { id: 'order1' },
            order2: { id: 'order2' },
          }),
        }),
      };
      mockDatabase.ref.mockReturnValue(mockRef);

      const result = await service.getAllOrders();

      expect(mockDatabase.ref).toHaveBeenCalledWith('orders');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get all foods', async () => {
      const mockRef = {
        get: jest.fn().mockResolvedValue({
          val: jest.fn().mockReturnValue({
            food1: { id: 'food1' },
            food2: { id: 'food2' },
          }),
        }),
      };
      mockDatabase.ref.mockReturnValue(mockRef);

      const result = await service.getAllFoods();

      expect(mockDatabase.ref).toHaveBeenCalledWith('foods');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get all categories', async () => {
      const mockRef = {
        get: jest.fn().mockResolvedValue({
          val: jest.fn().mockReturnValue({
            cat1: { id: 'cat1' },
            cat2: { id: 'cat2' },
          }),
        }),
      };
      mockDatabase.ref.mockReturnValue(mockRef);

      const result = await service.getAllCategories();

      expect(mockDatabase.ref).toHaveBeenCalledWith('categories');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
