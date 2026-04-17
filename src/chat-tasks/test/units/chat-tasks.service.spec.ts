import { Test, TestingModule } from '@nestjs/testing';
import { ChatTasksService } from '../../chat-tasks.service';

describe('ChatTasksService', () => {
  let service: ChatTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatTasksService],
    }).compile();

    service = module.get<ChatTasksService>(ChatTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
