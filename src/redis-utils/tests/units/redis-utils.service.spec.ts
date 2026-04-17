import Redis from 'ioredis';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerPrint } from '../../../logger/logger.print';
import { RedisUtilsService } from '../../redis-utils.service';

describe('RedisUtilsService', () => {
  const mockRedis = {
    set: jest.fn(),
    get: jest.fn(),
    setex: jest.fn(),
    hset: jest.fn(),
  };
  const mockLoggerPrint = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    verbose: jest.fn(),
    fatal: jest.fn(),
  };
  let redisService: RedisUtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisUtilsService,
        {
          provide: Redis,
          useValue: mockRedis,
        },
        {
          provide: LoggerPrint,
          useValue: mockLoggerPrint,
        },
      ],
    }).compile();

    redisService = module.get<RedisUtilsService>(RedisUtilsService);
  });

  describe('set redis service', () => {
    it('should call setex because checkTll defaults to false', async () => {
      jest.spyOn(mockRedis, 'set').mockResolvedValue(undefined);
      const payload = { id: 1, name: 'test_user' };
      await redisService.setHashExpireTimeOrNot('key', payload);
      expect(mockRedis.setex).toHaveBeenCalledTimes(1);
    });

    it('should call set when checkTll is true', async () => {
      jest.spyOn(mockRedis, 'setex').mockResolvedValue(undefined);
      const payload = { id: 1 };
      await redisService.setHashExpireTimeOrNot('key', payload, 400, true);
      expect(mockRedis.set).toHaveBeenCalledTimes(1);
    });
  });
});
