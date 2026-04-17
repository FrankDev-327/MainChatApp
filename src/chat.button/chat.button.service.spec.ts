import { Test, TestingModule } from '@nestjs/testing';
import { ChatButtonService } from './chat.button.service';

describe('ChatButtonService', () => {
  let service: ChatButtonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatButtonService],
    }).compile();

    service = module.get<ChatButtonService>(ChatButtonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
