import { Test, TestingModule } from '@nestjs/testing';
import { ChatUserRightsService } from '../../chat-user-rights.service';

describe('ChatUserRightsService', () => {
  let service: ChatUserRightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatUserRightsService],
    }).compile();

    service = module.get<ChatUserRightsService>(ChatUserRightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
