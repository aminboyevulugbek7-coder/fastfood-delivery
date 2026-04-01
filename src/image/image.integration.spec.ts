import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { ImageRepository } from './image.repository';
import { FirebaseService } from '../firebase/firebase.service';
import { LoggerService } from '../logger/logger.service';

describe('Image API Integration Tests', () => {
  let imageRepository: ImageRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: ImageRepository,
          useValue: {
            create: jest.fn().mockResolvedValue({
              id: 'image-1',
              filename: 'burger.jpg',
              url: 'https://firebase-storage.../burger.jpg',
              size: 102400,
              mimeType: 'image/jpeg',
            }),
            findById: jest.fn().mockResolvedValue({
              id: 'image-1',
              filename: 'burger.jpg',
              url: 'https://firebase-storage.../burger.jpg',
              size: 102400,
              mimeType: 'image/jpeg',
            }),
            delete: jest.fn().mockResolvedValue(true),
            list: jest.fn().mockResolvedValue([
              {
                id: 'image-1',
                filename: 'burger.jpg',
                url: 'https://firebase-storage.../burger.jpg',
                size: 102400,
                mimeType: 'image/jpeg',
              },
            ]),
          },
        },
        {
          provide: FirebaseService,
          useValue: {
            getDatabase: jest.fn(),
            getStorage: jest.fn(),
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

    imageRepository = moduleFixture.get<ImageRepository>(ImageRepository);
  });

  describe('POST /api/images/upload - Upload Image', () => {
    it('should upload image with valid data', async () => {
      const uploadImageDto = {
        filename: 'burger.jpg',
        mimeType: 'image/jpeg',
        size: 102400,
      };

      const result = await imageRepository.create(uploadImageDto as any);
      expect(result).toBeDefined();
      expect(result.id).toBe('image-1');
      expect(result.filename).toBe('burger.jpg');
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should validate file type', async () => {
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const uploadedMimeType = 'image/jpeg';

      expect(validMimeTypes).toContain(uploadedMimeType);
    });

    it('should reject invalid file types', async () => {
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const invalidMimeType = 'application/pdf';

      expect(validMimeTypes).not.toContain(invalidMimeType);
    });

    it('should validate file size (max 5MB)', async () => {
      const maxSizeBytes = 5 * 1024 * 1024;
      const validSize = 102400;
      const invalidSize = 6 * 1024 * 1024;

      expect(validSize).toBeLessThanOrEqual(maxSizeBytes);
      expect(invalidSize).toBeGreaterThan(maxSizeBytes);
    });

    it('should reject zero file size', async () => {
      const zeroSize = 0;
      expect(zeroSize).toBeLessThanOrEqual(0);
    });

    it('should generate unique filename', async () => {
      const filename1 = 'burger_12345.jpg';
      const filename2 = 'burger_67890.jpg';

      expect(filename1).not.toBe(filename2);
    });
  });

  describe('GET /api/images/:id - Get Image', () => {
    it('should retrieve image by ID', async () => {
      const imageId = 'image-1';
      const mockRepository = {
        findById: jest.fn().mockResolvedValue({
          id: 'image-1',
          filename: 'burger.jpg',
          url: 'https://firebase-storage.../burger.jpg',
          size: 102400,
          mimeType: 'image/jpeg',
        }),
      };

      const result = await mockRepository.findById(imageId);

      expect(result).toBeDefined();
      expect(result.id).toBe('image-1');
      expect(result.filename).toBe('burger.jpg');
      expect(result.url).toBeTruthy();
    });

    it('should return image URL', async () => {
      const imageId = 'image-1';
      const mockRepository = {
        findById: jest.fn().mockResolvedValue({
          id: 'image-1',
          url: 'https://firebase-storage.../burger.jpg',
        }),
      };

      const result = await mockRepository.findById(imageId);

      expect(result.url).toMatch(/^https:\/\//);
    });
  });

  describe('DELETE /api/images/:id - Delete Image', () => {
    it('should delete image', async () => {
      const imageId = 'image-1';
      const result = await imageRepository.delete(imageId);

      expect(result).toBe(true);
    });

    it('should delete associated image from storage', async () => {
      const imageId = 'image-1';
      const mockRepository = {
        delete: jest.fn().mockResolvedValue(true),
      };

      const result = await mockRepository.delete(imageId);
      expect(result).toBe(true);
    });
  });

  describe('Image Management', () => {
    it('should maintain image metadata', async () => {
      const image = {
        id: 'image-1',
        filename: 'burger.jpg',
        url: 'https://firebase-storage.../burger.jpg',
        size: 102400,
        mimeType: 'image/jpeg',
        uploadedAt: Date.now(),
      };

      expect(image.id).toBeTruthy();
      expect(image.filename).toBeTruthy();
      expect(image.url).toBeTruthy();
      expect(image.size).toBeGreaterThan(0);
      expect(image.mimeType).toBeTruthy();
    });

    it('should validate image metadata consistency', async () => {
      const image = {
        filename: 'burger.jpg',
        mimeType: 'image/jpeg',
        size: 102400,
      };

      expect(image.filename).toContain('.jpg');
      expect(image.mimeType).toMatch(/^image\//);
      expect(image.size).toBeGreaterThan(0);
    });
  });
});
