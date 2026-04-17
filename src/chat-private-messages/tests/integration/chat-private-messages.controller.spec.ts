import { Test, TestingModule } from '@nestjs/testing';
import { ChatPrivateMessagesController } from '../../chat-private-messages.controller';

describe('ChatPrivateMessagesController', () => {
  let controller: ChatPrivateMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatPrivateMessagesController],
    }).compile();

    controller = module.get<ChatPrivateMessagesController>(ChatPrivateMessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
