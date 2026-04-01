import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { LoggerService } from '../logger/logger.service';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  const mockUser = {
    telegramId: '123456',
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+998901234567',
    createdAt: Date.now(),
    lastActive: Date.now(),
    orderHistory: [],
    preferences: {
      language: 'uz' as const,
      notifications: true,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            read: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            list: jest.fn(),
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

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      jest.spyOn(repository, 'create').mockResolvedValue(mockUser);

      const result = await service.createUser(mockUser);

      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith(mockUser);
    });

    it('should prevent duplicate user registration', async () => {
      jest.spyOn(repository, 'create').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'read').mockResolvedValue(mockUser);

      const result = await service.createUser(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  describe('getUser', () => {
    it('should return user by telegram ID', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(mockUser);

      const result = await service.getUser('123456');

      expect(result).toEqual(mockUser);
      expect(repository.read).toHaveBeenCalledWith('123456');
    });

    it('should return null if user not found', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(null);

      const result = await service.getUser('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user last active timestamp', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

      const updateData = { lastActive: Date.now() };
      await service.updateUser('123456', updateData);

      expect(repository.update).toHaveBeenCalledWith('123456', updateData);
    });

    it('should update user preferences', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

      const updateData = {
        preferences: {
          language: 'ru',
          notifications: false,
        },
      };
      await service.updateUser('123456', updateData);

      expect(repository.update).toHaveBeenCalledWith('123456', updateData);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [mockUser, { ...mockUser, telegramId: '789012' }];
      jest.spyOn(repository, 'list').mockResolvedValue(users);

      const result = await service.getAllUsers();

      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no users', async () => {
      jest.spyOn(repository, 'list').mockResolvedValue([]);

      const result = await service.getAllUsers();

      expect(result).toEqual([]);
    });
  });
});
