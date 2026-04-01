import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { IsUzbekPhoneNumber } from '../../common/decorators/custom-validators';

/**
 * Update User DTO
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsUzbekPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(['uz', 'ru', 'en'])
  language?: 'uz' | 'ru' | 'en';

  @IsOptional()
  @IsBoolean()
  notifications?: boolean;
}
