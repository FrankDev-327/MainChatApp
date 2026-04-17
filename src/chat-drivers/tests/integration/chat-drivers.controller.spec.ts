import { Test, TestingModule } from '@nestjs/testing';
import { ChatDriversController } from './chat-drivers.controller';

describe('ChatDriversController', () => {
  let controller: ChatDriversController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatDriversController],
    }).compile();

    controller = module.get<ChatDriversController>(ChatDriversController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
