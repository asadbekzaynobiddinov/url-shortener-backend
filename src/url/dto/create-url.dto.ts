import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateUrlDto {
  @IsUrl({}, { message: 'originalUrl must be a valid URL' })
  originalUrl: string;

  @IsOptional()
  @IsDateString({}, { message: 'expiresAt must be a valid date string' })
  expiresAt?: string;

  @IsOptional()
  @IsString({ message: 'alias must be a string' })
  @MaxLength(20, { message: 'alias must not exceed 20 characters' })
  alias?: string;
}
