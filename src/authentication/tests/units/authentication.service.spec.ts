import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../../authentication.service';
import { ChatUsersService } from '../../../chat_users/chat_users.service';
import { TokenService } from '../../../token/token.service';
import { JwtService } from '@nestjs/jwt';
import {
  generateAuthData,
  generateTokenData,
} from '../generators/auth.generator';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LoggerPrint } from '../../../logger/logger.print';

describe('AuthenticationService', () => {
  const payload = generateAuthData();
  const tokenData = generateTokenData();
  let jwtService: JwtService;
  let authService: AuthenticationService;
  let chatUsersService = {
    findByUserName: jest.fn(),
  };
  let tokenService = {
    createToken: jest.fn().mockResolvedValue(tokenData.token),
    getTokenByUserId: jest.fn().mockResolvedValue(tokenData),
  };

  beforeEach(async () => {
    chatUsersService.findByUserName.mockResolvedValue(payload);
    tokenService.createToken.mockResolvedValue(tokenData);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        AuthenticationService,
        {
          provide: ChatUsersService,
          useValue: chatUsersService,
        },
        {
          provide: TokenService,
          useValue: tokenService,
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

    authService = module.get(AuthenticationService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should generate a token', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(tokenData.token);
      jest.spyOn(tokenService, 'createToken').mockReturnValue(null);
      const result = await authService.validateUser(payload);

      expect(chatUsersService.findByUserName).toHaveBeenCalledWith(payload);

      expect(jwtService.sign).toHaveBeenCalled();

      expect(tokenService.createToken).toHaveBeenCalled();

      expect(result).toEqual(tokenData);
      expect(result.token).toEqual(tokenData.token);
    });

    it('should throw NotFoundException for invalid user', async () => {
      chatUsersService.findByUserName.mockResolvedValue(null);

      await expect(authService.validateUser(payload)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on server error', async () => {
      chatUsersService.findByUserName.mockRejectedValue(
        new Error('DB connection lost'),
      );

      await expect(authService.validateUser(payload)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
