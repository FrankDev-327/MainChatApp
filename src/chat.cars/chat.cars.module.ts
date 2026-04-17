import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatCarsService } from './chat.cars.service';
import { LoggerPrint } from '../logger/logger.print';
import { ChatCarEntity } from '../entities/chat.cars.entity';
import { CarsEntity } from '../entities/cars.entity';

@Module({
  providers: [
    ChatCarsService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(ChatCarsService.name),
    },
  ],
  exports: [ChatCarsService],
  imports: [TypeOrmModule.forFeature([ChatCarEntity, CarsEntity])],
})
export class ChatCarsModule {}
