import { Test, TestingModule } from '@nestjs/testing';
import { ChatQrCodeService } from '../../chat.qr.code.service';

describe('ChatQrCodeService', () => {
  let service: ChatQrCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatQrCodeService],
    }).compile();

    service = module.get<ChatQrCodeService>(ChatQrCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
