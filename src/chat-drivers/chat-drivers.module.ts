import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatDriversService } from './chat-drivers.service';
import { ChatDriverEntity } from '../entities/chat.drivers.entity';
import { ChatDriversController } from './chat-drivers.controller';
import { LoggerPrint } from '../logger/logger.print';

@Module({
  controllers: [ChatDriversController],
  imports: [TypeOrmModule.forFeature([ChatDriverEntity])],
  providers: [
    ChatDriversService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(ChatDriversService.name),
    },
  ],
  exports: [ChatDriversService],
})
export class ChatDriversModule {}
