import { IsString, IsOptional, IsEnum } from 'class-validator';
import { IsUzbekPhoneNumber } from '../../common/decorators/custom-validators';

/**
 * Create User DTO
 */
export class CreateUserDto {
  @IsString()
  telegramId: string;

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
}
