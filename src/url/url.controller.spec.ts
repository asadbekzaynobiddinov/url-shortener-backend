import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  const mockUrl = {
    originalUrl: 'https://example.com',
    shortUrl: 'example',
    createdAt: new Date(),
    clickCount: 0,
  };

  const mockUrlService = {
    createShortUrl: jest.fn(),
    getOriginalUrl: jest.fn(),
    getUrlInfo: jest.fn(),
    deleteShortUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createShortUrl', () => {
    it('should create a new short URL', async () => {
      mockUrlService.createShortUrl.mockResolvedValue(mockUrl);

      const result = await controller.createShortUrl({
        originalUrl: mockUrl.originalUrl,
        alias: mockUrl.shortUrl,
      });

      expect(result).toBe(mockUrl);
      expect(mockUrlService.createShortUrl).toHaveBeenCalledWith({
        originalUrl: mockUrl.originalUrl,
        alias: mockUrl.shortUrl,
      });
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL', async () => {
      const shortUrl = 'example';
      const mockUrlInfo = {
        id: 'uuid-mock-value',
        originalUrl: 'https://example.com',
        shortUrl: 'example',
        clickCount: 0,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        createdAt: new Date(),
      };

      (service.getUrlInfo as jest.Mock).mockResolvedValue(mockUrlInfo);

      const result = await controller.getUrlInfo(shortUrl);

      expect(result).toEqual(mockUrlInfo);
      expect(service.getUrlInfo).toHaveBeenCalledWith(shortUrl);
    });
  });

  describe('getUrlInfo', () => {
    it('should return URL info', async () => {
      mockUrlService.getUrlInfo.mockResolvedValue(mockUrl);

      const result = await controller.getUrlInfo(mockUrl.shortUrl);

      expect(result).toBe(mockUrl);
      expect(mockUrlService.getUrlInfo).toHaveBeenCalledWith(mockUrl.shortUrl);
    });
  });

  describe('deleteShortUrl', () => {
    it('should delete the URL', async () => {
      const shortUrl = 'example';

      (service.deleteShortUrl as jest.Mock).mockResolvedValue(true);

      const result = await controller.deleteShortUrl(shortUrl);

      expect(result).toEqual({ message: 'Short URL deleted successfully' });
      expect(service.deleteShortUrl).toHaveBeenCalledWith(shortUrl);
    });
  });
});
