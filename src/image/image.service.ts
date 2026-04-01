import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ImageRepository } from './image.repository';
import { LoggerService } from '../logger/logger.service';
import { Image } from './entities/image.entity';

@Injectable()
export class ImageService {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Upload image
   * @param file Image file
   * @returns Uploaded image details
   */
  async uploadImage(file: any): Promise<Image> {
    try {
      if (!file) {
        throw new BadRequestException('Fayl talab qilinadi');
      }

      // Validate file type
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Faqat JPEG, PNG, GIF, WebP formatidagi rasmlar qabul qilinadi',
        );
      }

      // Validate file size
      if (file.size > this.maxFileSize) {
        throw new BadRequestException('Fayl hajmi 5MB dan oshmasligi kerak');
      }

      const image = await this.imageRepository.create(file);
      this.logger.log(`Image uploaded: ${image.id}`, 'ImageService');
      return image;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to upload image: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'ImageService',
      );
      throw error;
    }
  }

  /**
   * Delete image
   * @param id Image ID
   */
  async deleteImage(id: string): Promise<void> {
    try {
      const image = await this.imageRepository.read(id);
      if (!image) {
        throw new NotFoundException('Rasm topilmadi');
      }

      await this.imageRepository.delete(id);
      this.logger.log(`Image deleted: ${id}`, 'ImageService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to delete image: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'ImageService',
      );
      throw error;
    }
  }

  /**
   * Get image by ID
   * @param id Image ID
   * @returns Image details
   */
  async getImage(id: string): Promise<Image> {
    try {
      const image = await this.imageRepository.read(id);
      if (!image) {
        throw new NotFoundException('Rasm topilmadi');
      }
      return image;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get image: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'ImageService',
      );
      throw error;
    }
  }
}
