import { Test, TestingModule } from '@nestjs/testing';
import { ChatDeviceRegistratonController } from './chat.device.registraton.controller';

describe('ChatDeviceRegistratonController', () => {
  let controller: ChatDeviceRegistratonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatDeviceRegistratonController],
    }).compile();

    controller = module.get<ChatDeviceRegistratonController>(ChatDeviceRegistratonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
