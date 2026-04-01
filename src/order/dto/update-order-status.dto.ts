import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * Update Order Status DTO
 */
export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'preparing', 'ready', 'delivered', 'cancelled'])
  status!: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

  @IsOptional()
  @IsString()
  notes?: string;
}
