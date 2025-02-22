import { IsString } from 'class-validator';

export class DeleteUrlDto {
  @IsString({ message: 'shortUrl must be a string' })
  shortUrl: string;
}
