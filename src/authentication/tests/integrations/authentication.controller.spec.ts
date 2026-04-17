import { Test, TestingModule } from '@nestjs/testing';
import { ChatUser } from '../../../entities/chat.users.entity';
import { ApiTokenEntity } from '../../../entities/token.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoggerPrint } from '../../..//logger/logger.print';
import { generateTokenData, useIntegrationAndE2EUserLogin } from '../generators/auth.generator';
import { AuthenticationController } from '../../authentication.controller';
import { AuthenticationService } from '../../../authentication/authentication.service';
import { ChatUsersService } from '../../../chat_users/chat_users.service';
import { TokenService } from '../../../token/token.service';

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

describe('AuthenticationController', () => {
  const tokenData = generateTokenData();
  let jwtService: JwtService;
  let tokenService: TokenService;
  let authController: AuthenticationController;
  let chatUsersService: ChatUsersService;
  let authService: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        JwtService,
        ChatUsersService,
        TokenService,
        AuthenticationService,
        {
          provide: LoggerPrint,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
            verbose: jest.fn(),
            fatal: jest.fn(),
          }
        },
        {
          provide: getRepositoryToken(ChatUser),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ApiTokenEntity),
          useValue: {},
        },
      ]
    }).compile();

    authController = module.get<AuthenticationController>(AuthenticationController);
    chatUsersService = module.get<ChatUsersService>(ChatUsersService);
    tokenService = module.get<TokenService>(TokenService);
    authService = module.get<AuthenticationService>(AuthenticationService);
    jwtService = module.get<JwtService>(JwtService);

  });

  describe('login', () => {
    test('should login user with correct data', async () => {
      const mockUser = { UserID: 1, UserName: 'testUser', UserGroupID: 1 };
      const payload = useIntegrationAndE2EUserLogin();
      const preToken = { token: tokenData.token, userId: 1 };

      jest.spyOn(chatUsersService, 'findByUserName').mockResolvedValueOnce(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue(tokenData.token);
      jest.spyOn(tokenService, 'createToken').mockResolvedValueOnce(null);

      const auth = await authController.login(payload);
      expect(auth).toEqual(tokenData);
      expect(chatUsersService.findByUserName).toHaveBeenCalledWith(payload);
      expect(tokenService.createToken).toHaveBeenCalledWith(preToken);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
