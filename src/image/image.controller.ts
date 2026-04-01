import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { ImageService } from './image.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Image } from './entities/image.entity';

@Controller('api/images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * Upload image (admin only)
   * POST /api/images/upload
   * @param file Image file
   * @returns Uploaded image details
   */
  @Post('upload')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: any): Promise<Image> {
    return this.imageService.uploadImage(file);
  }

  /**
   * Delete image (admin only)
   * DELETE /api/images/:id
   * @param id Image ID
   * @returns Success response
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteImage(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.imageService.deleteImage(id);
    return {
      success: true,
      message: 'Rasm o\'chirildi',
    };
  }
}

