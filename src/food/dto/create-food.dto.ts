import { IsString, IsNumber, IsOptional, IsBoolean, IsPositive, Min } from 'class-validator';

/**
 * Create Food DTO
 */
export class CreateFoodDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsBoolean()
  available: boolean = true;

  @IsNumber()
  @Min(0)
  stock: number = 0;
}
