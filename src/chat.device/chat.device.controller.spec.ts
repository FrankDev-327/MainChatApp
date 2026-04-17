import { Test, TestingModule } from '@nestjs/testing';
import { ChatDeviceController } from './chat.device.controller';

describe('ChatDeviceController', () => {
  let controller: ChatDeviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatDeviceController],
    }).compile();

    controller = module.get<ChatDeviceController>(ChatDeviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
