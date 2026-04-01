import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { ImageRepository } from './image.repository';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [ImageService, ImageRepository],
  controllers: [ImageController],
  exports: [ImageService, ImageRepository],
})
export class ImageModule {}
