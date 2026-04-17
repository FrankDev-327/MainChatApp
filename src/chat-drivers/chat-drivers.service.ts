import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatDriverEntity } from '../entities/chat.drivers.entity';

@Injectable()
export class ChatDriversService {
  constructor(
    @InjectRepository(ChatDriverEntity)
    private chatDriverRepository: Repository<ChatDriverEntity>,
    private loggerPrint: LoggerPrint,
  ) {}

  async findDriverDetailsByDriverId(
    driverId: number,
  ): Promise<ChatDriverEntity | null> {
    try {
      const driver = await this.chatDriverRepository.findOne({
        where: {
          driverId,
        },
        select: [
          'driverId',
          'driverName',
          'driverImage',
          'driverGroupId',
          'pin',
        ],
      });

      if (!driver) {
        this.loggerPrint.warn('Driver not found');
        throw new NotFoundException('Driver not found');
      }

      return driver;
    } catch (error) {
      this.loggerPrint.error(
        `Error fetching chat driver details: ${error.message}`,
      );
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new BadGatewayException('Chat driver not found');
    }
  }
}
