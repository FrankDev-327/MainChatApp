import { Test, TestingModule } from '@nestjs/testing';
import { ChatMessageEntity } from '../../../entities/chatt.private.messages.entity';
import { LoggerPrint } from '../../../logger/logger.print';
import { generateFakeChatMessage } from '../generators/chat-private-messages.generator';
import { ChatPrivateMessagesService } from '../../chat-private-messages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmiterSubscribersService } from '../../../emiter-subscribers/emiter-subscribers.service';

describe('ChatPrivateMessagesService', () => {
  let chatMessageService: ChatPrivateMessagesService;
  const mockEventEmiter2 = {
    emittingEventToBeSubscribed: jest.fn(),
  }
  const mockChatMessageRepository = {
    create: jest.fn(),
    save: jest.fn()
  }
  let charMessageRepository: Repository<ChatMessageEntity>;
  const CHAT_MESSAGE_REPOSITORY = getRepositoryToken(ChatMessageEntity);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatPrivateMessagesService,
        {
          provide: EmiterSubscribersService,
          useValue: mockEventEmiter2
        },
        {
          provide: CHAT_MESSAGE_REPOSITORY,
          useValue: mockChatMessageRepository
        },
        {
          provide: LoggerPrint,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
            verbose: jest.fn(),
            fatal: jest.fn(),
          },
        },
      ],
    }).compile();

    chatMessageService = module.get<ChatPrivateMessagesService>(ChatPrivateMessagesService);
    charMessageRepository = module.get<Repository<ChatMessageEntity>>(CHAT_MESSAGE_REPOSITORY);
  });

  describe('createNewPrivateMessage', () => {
    it('should insert data into the database', async () => {
      jest.spyOn(mockEventEmiter2, 'emittingEventToBeSubscribed').mockResolvedValueOnce(undefined);
      const messageDto = generateFakeChatMessage();
      await expect(chatMessageService.createNewPrivateMessage(messageDto)).resolves.not.toThrow();
      expect(mockChatMessageRepository.create).toHaveBeenCalledTimes(1)
      expect(mockChatMessageRepository.save).toHaveBeenCalledTimes(1)
      expect(mockEventEmiter2.emittingEventToBeSubscribed).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    jest.resetAllMocks()
  })
});
