import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  // 1. Create short Url
  @Post('shorten')
  async createShortUrl(@Body() createUrlDto: CreateUrlDto) {
    return await this.urlService.createShortUrl(createUrlDto);
  }

  // 2. Redirect
  @Get(':shortUrl')
  async redirectUrl(@Param('shortUrl') shortUrl: string) {
    const url = await this.urlService.redirectUrl(shortUrl);
    if (!url) {
      throw new NotFoundException('Short URL not found');
    }
    return url;
  }

  // 3. Get Info
  @Get('info/:shortUrl')
  async getUrlInfo(@Param('shortUrl') shortUrl: string) {
    const info = await this.urlService.getUrlInfo(shortUrl);
    if (!info) {
      throw new NotFoundException('Short URL info not found');
    }
    return info;
  }

  // 4. Delete
  @Delete('delete/:shortUrl')
  async deleteShortUrl(@Param('shortUrl') shortUrl: string) {
    const deleted = await this.urlService.deleteShortUrl(shortUrl);
    if (!deleted) {
      throw new NotFoundException('Short URL not found');
    }
    return {
      message: 'Short URL deleted successfully',
    };
  }
}
