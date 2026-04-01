import { IsString, IsOptional, IsNumber, IsPositive, Max } from 'class-validator';
import { IsValidFileSize, IsValidImageMimeType } from '../../common/decorators/custom-validators';

/**
 * Upload Image DTO
 */
export class UploadImageDto {
  @IsString()
  filename!: string;

  @IsValidImageMimeType()
  mimeType!: string;

  @IsNumber()
  @IsPositive()
  @Max(5 * 1024 * 1024) // 5MB max
  @IsValidFileSize()
  size!: number;

  @IsOptional()
  @IsString()
  uploadedBy?: string;
}
