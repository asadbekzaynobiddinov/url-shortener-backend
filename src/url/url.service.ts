import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  // 1. Create Short URL
  async createShortUrl(createUrlDto: CreateUrlDto): Promise<Url> {
    const { originalUrl, expiresAt, alias } = createUrlDto;
    const shortUrl = alias || this.generateShortUrl();

    const url = this.urlRepository.create({
      originalUrl,
      shortUrl,
      expiresAt,
    });

    return this.urlRepository.save(url);
  }

  // 2. Redirect to Original URL
  async redirectUrl(shortUrl: string): Promise<string> {
    const url = await this.urlRepository.findOne({ where: { shortUrl } });
    if (!url) {
      throw new NotFoundException('Short URL not found');
    }

    // Check if expired
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      throw new NotFoundException('Short URL has expired');
    }

    url.clickCount++;
    await this.urlRepository.save(url);

    return url.originalUrl;
  }

  // 3. Get URL Info
  async getUrlInfo(shortUrl: string): Promise<Url> {
    const url = await this.urlRepository.findOne({ where: { shortUrl } });
    if (!url) {
      throw new NotFoundException('Short URL not found');
    }
    return url;
  }

  // 4. Delete Short URL
  async deleteShortUrl(shortUrl: string): Promise<any> {
    const result = await this.urlRepository.delete({ shortUrl });
    if (result.affected === 0) {
      throw new NotFoundException('Short URL not found');
    }
    return result;
  }

  // Helper method: Generate random short URL
  private generateShortUrl(): string {
    const characters =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let shortUrl = '';
    for (let i = 0; i < 6; i++) {
      shortUrl += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return shortUrl;
  }
}
