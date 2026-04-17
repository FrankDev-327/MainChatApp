import { Test, TestingModule } from '@nestjs/testing';
import { ChatUserRightsController } from './chat-user-rights.controller';

describe('ChatUserRightsController', () => {
  let controller: ChatUserRightsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatUserRightsController],
    }).compile();

    controller = module.get<ChatUserRightsController>(ChatUserRightsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
