import { Test, TestingModule } from '@nestjs/testing';
import { ChatDeviceService } from './chat.device.service';

describe('ChatDeviceService', () => {
  let service: ChatDeviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatDeviceService],
    }).compile();

    service = module.get<ChatDeviceService>(ChatDeviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
