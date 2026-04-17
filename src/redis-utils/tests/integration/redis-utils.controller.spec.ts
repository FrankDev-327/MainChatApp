import { Test, TestingModule } from '@nestjs/testing';
import { RedisUtilsController } from './redis-utils.controller';

describe('RedisUtilsController', () => {
  let controller: RedisUtilsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedisUtilsController],
    }).compile();

    controller = module.get<RedisUtilsController>(RedisUtilsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
