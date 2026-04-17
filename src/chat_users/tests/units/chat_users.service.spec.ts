import { Test, TestingModule } from '@nestjs/testing';
import { LoggerPrint } from '../../../logger/logger.print';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../../token/token.service';
import { generateChatUser } from '../generators/chat.user.generator';
import { ChatUsersService } from '../../chat_users.service';
import { ChatUser } from '../../../entities/chat.users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ApiTokenEntity } from '../../../entities/token.entity';
import { Repository } from 'typeorm';

describe('ChatUsersService', () => {
  let repoMock: { query: jest.Mock };
  let chatUsersService: ChatUsersService;
  let chatUserInfo = generateChatUser();

  let chatUserRepository: Repository<ChatUser>;
  const CHAT_USER_REPO = getRepositoryToken(ChatUser)

  beforeEach(async () => {
    repoMock = {
      query: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        JwtService,
        ChatUsersService,
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
        {
          provide: getRepositoryToken(ApiTokenEntity),
          useValue: {},
        },
        {
          provide: CHAT_USER_REPO,
          useValue: {
            query: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn()
          },
        },
      ],
    }).compile();

    chatUsersService = module.get<ChatUsersService>(ChatUsersService);
    chatUserRepository = module.get<Repository<ChatUser>>(CHAT_USER_REPO);
  });

  describe('findByUserName', () => {
    it('should return chat user data for valid user', async () => {
      jest.spyOn(chatUserRepository, 'query').mockResolvedValueOnce([chatUserInfo])
      const chatUser = await chatUsersService.findByUserName(chatUserInfo);
      expect(chatUserRepository.query).toHaveBeenCalledTimes(1);
      expect(chatUser).toEqual(chatUserInfo);
    });

    it('should return null for invalid user', async () => {
      jest.spyOn(chatUserRepository, 'query').mockResolvedValueOnce([])
      const chatUser = await chatUsersService.findByUserName({
        userName: chatUserInfo.userName,
        password: chatUserInfo.password,
        checkTypeAuth: ''
      });
      expect(chatUserRepository.query).toHaveBeenCalledTimes(1);
      expect(chatUser).toBeNull();
    });

    it('should throw BadRequestException when query throws', async () => {
      jest.spyOn(chatUserRepository, 'query').mockRejectedValueOnce(
        new Error('DB error')
      )
      await expect(
        chatUsersService.findByUserName(chatUserInfo),
      ).rejects.toThrow(BadRequestException);
    });

    it('should execute correct query with username and password', async () => {
      jest.spyOn(chatUserRepository, 'query').mockResolvedValueOnce([chatUserInfo])
      const result = await chatUsersService.findByUserName(chatUserInfo);
      expect(chatUserRepository.query).toHaveBeenCalledTimes(1);
      expect(chatUserRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM chat_users u'),
        [chatUserInfo.userName, chatUserInfo.password],
      );

      expect(result).toEqual(chatUserInfo);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
