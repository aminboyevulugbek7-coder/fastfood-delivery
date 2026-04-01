import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsUzbekPhoneNumber, IsValidAddress } from '../../common/decorators/custom-validators';

/**
 * Order Item DTO for creating orders
 */
export class OrderItemDto {
  @IsString()
  foodId!: string;

  @IsString()
  name!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  subtotal!: number;
}

/**
 * Create Order DTO
 */
export class CreateOrderDto {
  @IsString()
  telegramId!: string;

  @IsString()
  customerName!: string;

  @IsUzbekPhoneNumber()
  phoneNumber!: string;

  @IsValidAddress()
  address!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsNumber()
  @IsPositive()
  totalPrice!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  @Min(0)
  estimatedDeliveryTime: number = 30;
}
