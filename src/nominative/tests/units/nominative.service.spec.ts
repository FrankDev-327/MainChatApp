import { Test, TestingModule } from '@nestjs/testing';
import { NominativeService } from '../../nominative.service';
import { LoggerPrint } from '../../../logger/logger.print';
import { CreateMessageTaskDto } from '../../../dto/chat.private.message/create.private.message.dto';
import { generateReceiveLocationDto } from '../generators/nominative.generator';
import { ChatPrivateMessagesService } from '../../../chat-private-messages/chat-private-messages.service';

describe('NominativeService', () => {
  let service: NominativeService;
  let chatPrivateMessagesService: ChatPrivateMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NominativeService,
        {
          provide: LoggerPrint,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: ChatPrivateMessagesService,
          useValue: {
            createNewPrivateMessage: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<NominativeService>(NominativeService);
    chatPrivateMessagesService = module.get<ChatPrivateMessagesService>(
      ChatPrivateMessagesService,
    );
  });

  describe('getNominativeData', () => {
    test('should call getNominativeData method', async () => {
      const localtionDto = generateReceiveLocationDto();
      await expect(
        service.getNominativeData(localtionDto),
      ).resolves.not.toThrow();

      expect(
        chatPrivateMessagesService.createNewPrivateMessage,
      ).toHaveBeenCalledWith(
        expect.objectContaining(new CreateMessageTaskDto()),
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
