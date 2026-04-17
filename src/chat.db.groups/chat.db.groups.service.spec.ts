import { Test, TestingModule } from '@nestjs/testing';
import { ChatDbGroupsService } from './chat.db.groups.service';

describe('ChatDbGroupsService', () => {
  let service: ChatDbGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatDbGroupsService],
    }).compile();

    service = module.get<ChatDbGroupsService>(ChatDbGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
