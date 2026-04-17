import { Module } from '@nestjs/common';
import { ChatTasksService } from './chat-tasks.service';
import { ChatTasksController } from './chat-tasks.controller';
import { ChatTaskEntity } from '../entities/chatt.tasks.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerPrint } from '../logger/logger.print';

@Module({
  imports: [TypeOrmModule.forFeature([ChatTaskEntity])],
  providers: [
    ChatTasksService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(ChatTasksService.name),
    },
  ],
  exports: [ChatTasksService],
  controllers: [ChatTasksController],
})
export class ChatTasksModule {}
