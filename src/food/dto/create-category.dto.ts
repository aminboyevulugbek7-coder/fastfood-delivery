import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

/**
 * Create Category DTO
 */
export class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  order: number = 0;

  @IsBoolean()
  active: boolean = true;
}
