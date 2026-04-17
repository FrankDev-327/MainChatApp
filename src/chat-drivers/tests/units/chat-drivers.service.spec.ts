import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggerPrint } from '../../../logger/logger.print';
import { ChatDriverEntity } from '../../../entities/chat.drivers.entity';
import { generateChatDriverId } from '../generators/chat.drivers.generator';
import { ChatDriversService } from '../../chat-drivers.service';
import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('ChatDriversService', () => {
  let service: ChatDriversService;
  let driverId = generateChatDriverId();
  let chatDriverRepository: Repository<ChatDriverEntity>;
  const CHAT_DRIVER_REPO = getRepositoryToken(ChatDriverEntity);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatDriversService,
        {
          provide: LoggerPrint,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: CHAT_DRIVER_REPO,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = await module.resolve<ChatDriversService>(ChatDriversService);
    chatDriverRepository = module.get<Repository<ChatDriverEntity>>(CHAT_DRIVER_REPO);
  });

  describe('findDriverDetailsByDriverId', () => {
    it('should return chat driver data for valid driver id', async () => {
      jest.spyOn(chatDriverRepository, 'findOne').mockResolvedValueOnce(new ChatDriverEntity)
      const chatDriver = await service.findDriverDetailsByDriverId(driverId);

      expect(chatDriver).toEqual(new ChatDriverEntity);
      expect(chatDriverRepository.findOne).toHaveBeenCalledTimes(1);
      expect(chatDriverRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { driverId },
          select: [
            'driverId',
            'driverName',
            'driverImage',
            'driverGroupId',
            'pin'
          ],
        }),
      );
    });

    it('should throw NotFoundException when driver is not found', async () => {
      jest.spyOn(chatDriverRepository, 'findOne').mockResolvedValueOnce(null)
      await expect(
        service.findDriverDetailsByDriverId(0)
      ).rejects.toThrow(NotFoundException);

      expect(chatDriverRepository.findOne).toHaveBeenCalledTimes(1);
      expect(chatDriverRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { driverId: 0 },
        }),
      );
    });

    it('should throw BadGatewayException when repository throw', async () => {
      jest.spyOn(chatDriverRepository, 'findOne').mockRejectedValueOnce(new BadGatewayException('Chat driver not found'));
      await expect(
        service.findDriverDetailsByDriverId(0),
      ).rejects.toThrow(BadGatewayException);

      expect(chatDriverRepository.findOne).toHaveBeenCalledTimes(1);
      expect(chatDriverRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { driverId: 0 },
          select: [
            'driverId',
            'driverName',
            'driverImage',
            'driverGroupId',
            'pin'
          ],
        }),
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
