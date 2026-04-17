import { Test, TestingModule } from '@nestjs/testing';
import { ChatUsersController } from '../../chat_users.controller';

describe('ChatUsersController', () => {
  let controller: ChatUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatUsersController],
    }).compile();

    controller = module.get<ChatUsersController>(ChatUsersController);
  });

});
