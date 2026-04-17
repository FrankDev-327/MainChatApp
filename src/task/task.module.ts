import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { RabbitTaskModule } from '../rabbit.task/rabbit.task.module';
import { ChatTaskEntity } from '../entities/chat.task.entity';
import { LoggerPrint } from '../logger/logger.print';

@Module({
  imports: [TypeOrmModule.forFeature([ChatTaskEntity])],
  providers: [
    TaskService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(TaskService.name),
    },
  ],
  exports: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
