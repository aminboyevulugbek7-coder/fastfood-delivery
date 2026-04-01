import { IsString, IsNumber, IsOptional, IsBoolean, IsPositive, Min } from 'class-validator';

/**
 * Update Food DTO
 */
export class UpdateFoodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
