import * as Minio from 'minio';
import { LoggerPrint } from '../../../logger/logger.print';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadfilesService } from '../../uploadfiles.service';
import { ChatPrivateMessagesService } from '../../../chat-private-messages/chat-private-messages.service';
import { generateFakeFileMetaData } from '../generators/uploadfiles.service.generator';

describe('UploadfilesService', () => {
  let uploadService: UploadfilesService;
  const mockMinioServivce = {
    presignedUrl: jest.fn(),
    putObject: jest.fn(),
  };
  const mockChatPrivateMessageService = {
    createNewPrivateMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatPrivateMessagesService,
        UploadfilesService,
        {
          provide: Minio.Client,
          useValue: mockMinioServivce,
        },
        {
          provide: ChatPrivateMessagesService,
          useValue: mockChatPrivateMessageService,
        },
        {
          provide: LoggerPrint,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    uploadService = module.get<UploadfilesService>(UploadfilesService);
  });

  describe('uploadBase64', () => {
    it('should upload a file and call private message service', async () => {
      const file = generateFakeFileMetaData();
      const dto = { sender_id: 1, taskId: 123, message_type: 'FILE' };
      const fakeUrl = 'http://minio/file.jpg';

      mockMinioServivce.putObject.mockResolvedValue(undefined);
      mockMinioServivce.presignedUrl.mockResolvedValue(fakeUrl);
      const getFileUrlSpy = jest.spyOn(uploadService, 'getFileUrl');
      await uploadService.uploadBase64(file, dto);

      expect(mockMinioServivce.putObject).toHaveBeenCalledTimes(1);
      expect(getFileUrlSpy).toHaveBeenCalledTimes(1);
      expect(
        mockChatPrivateMessageService.createNewPrivateMessage,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockChatPrivateMessageService.createNewPrivateMessage,
      ).toHaveBeenCalledWith(expect.objectContaining({ file: fakeUrl }));
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
