import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from '../../token.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiTokenEntity } from '../../../entities/token.entity';
import {
  generateTokenUnitTest,
  generateFakeToken,
} from '../generators/token.generator';
import { LoggerPrint } from '../../../logger/logger.print';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('TokenService', () => {
  let tokenService: TokenService;
  let token = generateTokenUnitTest();
  const TOKEN_GENERATED = generateFakeToken();
  let tokenRepository: Repository<ApiTokenEntity>;
  const TOKEN_REPO_TOKEN = getRepositoryToken(ApiTokenEntity);
  const mockLoggerPrint = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    verbose: jest.fn(),
    fatal: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: TOKEN_REPO_TOKEN,
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: LoggerPrint,
          useValue: mockLoggerPrint
        }
      ],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);
    tokenRepository = module.get<Repository<ApiTokenEntity>>(TOKEN_REPO_TOKEN);
  });

  describe('createToken', () => {
    it('should create a token', async () => {
      jest
        .spyOn(tokenRepository, 'save')
        .mockResolvedValueOnce(new ApiTokenEntity());
      await expect(tokenService.createToken(token)).resolves.not.toThrow();
      expect(tokenRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return bad request exception for creating token', async () => {
      jest.spyOn(tokenRepository, 'save').mockRejectedValueOnce(new Error(''));
      await expect(tokenService.createToken(token)).rejects.toThrow(
        BadRequestException,
      );
      expect(tokenRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTokenByUserId', () => {
    it('should return token data for valid user id', async () => {
      jest
        .spyOn(tokenRepository, 'findOne')
        .mockResolvedValueOnce(new ApiTokenEntity());
      const tokenData = await tokenService.getTokenByUserId(TOKEN_GENERATED);
      expect(tokenRepository.findOne).toHaveBeenCalledTimes(1);
      expect(tokenData).toBeInstanceOf(ApiTokenEntity);
    });

    it('should return null for invalid user id', async () => {
      jest.spyOn(tokenRepository, 'findOne').mockResolvedValueOnce(null);

      const tokenData = await tokenService.getTokenByUserId('');
      expect(tokenRepository.findOne).toHaveBeenCalledTimes(1);
      expect(tokenData).toBeNull();
    });

    it('should return bad request exception for invalid user id', async () => {
      jest
        .spyOn(tokenRepository, 'findOne')
        .mockRejectedValueOnce(new Error('Query failed'));

      await expect(
        tokenService.getTokenByUserId('invalid_token'),
      ).rejects.toThrow(BadRequestException);
      expect(tokenRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
