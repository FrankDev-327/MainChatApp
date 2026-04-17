import { Test, TestingModule } from '@nestjs/testing';
import { ChatDeviceRegistratonService } from '../../chat.device.registraton.service';

describe('ChatDeviceRegistratonService', () => {
  let service: ChatDeviceRegistratonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatDeviceRegistratonService],
    }).compile();

    service = module.get<ChatDeviceRegistratonService>(ChatDeviceRegistratonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
