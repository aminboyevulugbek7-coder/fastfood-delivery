import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { FirebaseService } from '../firebase/firebase.service';
import { Image } from './entities/image.entity';

@Injectable()
export class ImageRepository extends BaseRepository<Image> {
  protected basePath = 'images';

  constructor(firebaseService: FirebaseService) {
    super(firebaseService);
  }

  /**
   * Create a new image record
   * @param file Uploaded file
   * @returns Created image record
   */
  override async create(file: any): Promise<Image> {
    const id = this.generateId();
    const image = {
      id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: Date.now(),
    } as Image;

    await this.firebaseService.create(`${this.basePath}/${id}`, image);
    return image;
  }

  /**
   * Find images by MIME type
   * @param mimeType MIME type to search
   * @returns Array of images with specified MIME type
   */
  async findByMimeType(mimeType: string): Promise<Image[]> {
    return this.findByField('mimeType', mimeType);
  }
}
