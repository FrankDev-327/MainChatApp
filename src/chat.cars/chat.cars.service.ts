import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatCarEntity } from '../entities/chat.cars.entity';
import { CarsEntity } from '../entities/cars.entity';

@Injectable()
export class ChatCarsService {
  constructor(
    @InjectRepository(ChatCarEntity)
    private chatCarRepository: Repository<ChatCarEntity>,
    @InjectRepository(CarsEntity)
    private carsRepository: Repository<CarsEntity>,
    private loggerPrint: LoggerPrint,
  ) {}
}
