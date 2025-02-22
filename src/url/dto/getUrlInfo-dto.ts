import { IsString } from 'class-validator';

export class GetUrlInfoDto {
  @IsString({ message: 'shortUrl must be a string' })
  shortUrl: string;
}
