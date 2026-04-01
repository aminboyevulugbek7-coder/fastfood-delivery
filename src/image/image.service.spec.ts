import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { ImageRepository } from './image.repository';
import { LoggerService } from '../logger/logger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ImageService', () => {
  let service: ImageService;
  let repository: ImageRepository;

  const mockImage = {
    id: 'image-1',
    filename: 'burger.jpg',
    originalName: 'burger.jpg',
    url: 'https://firebase-storage.../burger.jpg',
    size: 102400,
    mimeType: 'image/jpeg',
    uploadedAt: Date.now(),
    uploadedBy: 'admin',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: ImageRepository,
          useValue: {
            create: jest.fn(),
            read: jest.fn(),
            delete: jest.fn(),
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

    service = module.get<ImageService>(ImageService);
    repository = module.get<ImageRepository>(ImageRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload valid JPEG image', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'burger.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 102400,
        destination: '/uploads',
        filename: 'burger.jpg',
        path: '/uploads/burger.jpg',
        buffer: Buffer.from(''),
      } as any;

      jest.spyOn(repository, 'create').mockResolvedValue(mockImage);

      const result = await service.uploadImage(file);

      expect(result).toEqual(mockImage);
      expect(repository.create).toHaveBeenCalledWith(file);
    });

    it('should upload valid PNG image', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'burger.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 102400,
        destination: '/uploads',
        filename: 'burger.png',
        path: '/uploads/burger.png',
        buffer: Buffer.from(''),
      } as any;

      jest.spyOn(repository, 'create').mockResolvedValue(mockImage);

      const result = await service.uploadImage(file);

      expect(result).toEqual(mockImage);
    });

    it('should reject invalid file type', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 102400,
        destination: '/uploads',
        filename: 'document.pdf',
        path: '/uploads/document.pdf',
        buffer: Buffer.from(''),
      } as any;

      await expect(service.uploadImage(file)).rejects.toThrow(BadRequestException);
    });

    it('should reject file exceeding 5MB', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'large.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024, // 6MB
        destination: '/uploads',
        filename: 'large.jpg',
        path: '/uploads/large.jpg',
        buffer: Buffer.from(''),
      } as any;

      await expect(service.uploadImage(file)).rejects.toThrow(BadRequestException);
    });

    it('should reject if no file provided', async () => {
      await expect(service.uploadImage(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteImage', () => {
    it('should delete image', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(mockImage);
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

      await service.deleteImage('image-1');

      expect(repository.delete).toHaveBeenCalledWith('image-1');
    });

    it('should throw NotFoundException if image not found', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(null);

      await expect(service.deleteImage('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getImage', () => {
    it('should return image by ID', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(mockImage);

      const result = await service.getImage('image-1');

      expect(result).toEqual(mockImage);
      expect(repository.read).toHaveBeenCalledWith('image-1');
    });

    it('should throw NotFoundException if image not found', async () => {
      jest.spyOn(repository, 'read').mockResolvedValue(null);

      await expect(service.getImage('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
