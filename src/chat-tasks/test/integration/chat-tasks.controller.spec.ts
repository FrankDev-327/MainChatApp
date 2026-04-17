import { Test, TestingModule } from '@nestjs/testing';
import { ChatTasksController } from './chat-tasks.controller';

describe('ChatTasksController', () => {
  let controller: ChatTasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatTasksController],
    }).compile();

    controller = module.get<ChatTasksController>(ChatTasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
