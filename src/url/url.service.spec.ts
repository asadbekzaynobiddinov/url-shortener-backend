import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UrlService', () => {
  let service: UrlService;
  let repository: Repository<Url>;

  const mockUrl = {
    originalUrl: 'https://example.com',
    shortUrl: 'example',
    clickCount: 0,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getRepositoryToken(Url),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            create: jest.fn().mockReturnValue(mockUrl),
          },
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    repository = module.get<Repository<Url>>(getRepositoryToken(Url));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 1. Create Short URL
  describe('createShortUrl', () => {
    it('should create a new short URL', async () => {
      repository.save = jest.fn().mockResolvedValue({
        ...mockUrl,
        clickCount: 0,
        createdAt: expect.any(Date),
        id: expect.any(String),
      });

      const result = await service.createShortUrl({
        originalUrl: mockUrl.originalUrl,
        alias: mockUrl.shortUrl,
        expiresAt: mockUrl.expiresAt.toISOString(),
      });

      expect(result.shortUrl).toBe(mockUrl.shortUrl);
      expect(result.originalUrl).toBe(mockUrl.originalUrl);
      expect(result.clickCount).toBe(0);
      expect(repository.save).toHaveBeenCalledWith({
        originalUrl: mockUrl.originalUrl,
        shortUrl: mockUrl.shortUrl,
        expiresAt: mockUrl.expiresAt,
        clickCount: 0,
        createdAt: expect.any(Date),
      });
    });
  });

  // 2. Redirect to Original URL
  describe('redirectUrl', () => {
    it('should redirect to original URL', async () => {
      repository.findOne = jest.fn().mockResolvedValue({
        ...mockUrl,
        clickCount: 0,
      });
      repository.save = jest.fn().mockResolvedValue({
        ...mockUrl,
        clickCount: 1,
      });

      const result = await service.redirectUrl(mockUrl.shortUrl);

      expect(result).toBe(mockUrl.originalUrl);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { shortUrl: mockUrl.shortUrl },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockUrl,
        clickCount: 1,
      });
    });
  });

  // 3. Get URL Info
  describe('getUrlInfo', () => {
    it('should return URL info', async () => {
      repository.findOne = jest.fn().mockResolvedValue(mockUrl);

      const result = await service.getUrlInfo(mockUrl.shortUrl);

      expect(result.originalUrl).toBe(mockUrl.originalUrl);
      expect(result.clickCount).toBe(mockUrl.clickCount);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { shortUrl: mockUrl.shortUrl },
      });
    });

    it('should throw NotFoundException if short URL not found', async () => {
      repository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.getUrlInfo('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // 4. Delete Short URL
  describe('deleteShortUrl', () => {
    it('should delete the URL', async () => {
      repository.delete = jest.fn().mockResolvedValue({ affected: 1 });

      const result = await service.deleteShortUrl(mockUrl.shortUrl);

      expect(result.affected).toBe(1);
      expect(repository.delete).toHaveBeenCalledWith({
        shortUrl: mockUrl.shortUrl,
      });
    });

    it('should throw NotFoundException if URL not found', async () => {
      repository.delete = jest.fn().mockResolvedValue({ affected: 0 });

      await expect(service.deleteShortUrl('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
