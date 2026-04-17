import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { ChatMessengerGateway } from '../../chat-messenger.gateway';
import { TokenService } from '../../../token/token.service';
import { RedisUtilsService } from '../../../redis-utils/redis-utils.service';
import { ChatPrivateMessagesService } from '../../../chat-private-messages/chat-private-messages.service';
import { LoggerPrint } from '../../../logger/logger.print';

describe('ChatMessengerGateway', () => {
  let gateway: ChatMessengerGateway;
  let jwtService: JwtService;
  let tokenService: TokenService;
  let redisService: RedisUtilsService;
  let chatPrivateMessagesService: ChatPrivateMessagesService;

  // 1. Mock the Socket Client
  const mockSocket = {
    id: 'socket_123',
    handshake: { headers: { token: 'valid_token' } },
    join: jest.fn(),
    emit: jest.fn(),
  };

  // 2. Mock the Socket Server
  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    socketsLeave: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatMessengerGateway,
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
        {
          provide: TokenService,
          useValue: { getTokenByUserId: jest.fn() },
        },
        {
          provide: RedisUtilsService,
          useValue: { setHashExpireTimeOrNot: jest.fn(), getListHash: jest.fn(), deleteSetDataByKeyName: jest.fn(), addMembers: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: ChatPrivateMessagesService,
          useValue: { createNewPrivateMessage: jest.fn() },
        },
        {
          provide: LoggerPrint,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
      ],
    }).compile();

    gateway = module.get<ChatMessengerGateway>(ChatMessengerGateway);
    jwtService = module.get<JwtService>(JwtService);
    tokenService = module.get<TokenService>(TokenService);
    redisService = module.get<RedisUtilsService>(RedisUtilsService);
    chatPrivateMessagesService = module.get<ChatPrivateMessagesService>(ChatPrivateMessagesService);

    gateway.server = mockServer as any;
  });

  describe('handleConnection', () => {
    it('should connect successfully with a valid token', async () => {
      const payload = { userId: 1, userGroupId: 10, userName: 'TestUser' };

      jest.spyOn(tokenService, 'getTokenByUserId').mockResolvedValue({ some: 'data' } as any);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      await gateway.handleConnection(mockSocket as any);

      expect(mockSocket.join).toHaveBeenCalledWith('group-room-10');
      expect(redisService.setHashExpireTimeOrNot).toHaveBeenCalledTimes(3);
      expect(redisService.addMembers).toHaveBeenCalled();
    });

    it('should throw WsException if token is missing', async () => {
      const socketNoToken = { id: '1', handshake: { headers: {} } };

      await expect(gateway.handleConnection(socketNoToken as any))
        .rejects.toThrow(WsException);
    });

    it('should throw WsException if token does not exist in database', async () => {
      jest.spyOn(tokenService, 'getTokenByUserId').mockResolvedValue(null);

      await expect(gateway.handleConnection(mockSocket as any))
        .rejects.toThrow(WsException);
    });
  });

  describe('handleMessage', () => {
    it('should call private message service and return true', async () => {
      const payload = { message: 'hello' };
      const result = await gateway.handleMessage(mockSocket as any, payload);

      expect(result).toBe(true);
      expect(chatPrivateMessagesService.createNewPrivateMessage).toHaveBeenCalledWith(payload);
    });
  });
});