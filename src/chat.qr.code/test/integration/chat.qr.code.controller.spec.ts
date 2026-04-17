import { Test, TestingModule } from '@nestjs/testing';
import { ChatQrCodeController } from './chat.qr.code.controller';

describe('ChatQrCodeController', () => {
  let controller: ChatQrCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatQrCodeController],
    }).compile();

    controller = module.get<ChatQrCodeController>(ChatQrCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
