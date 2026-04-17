import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatUser } from '../entities/chat.users.entity';
import { ChatUsersService } from './chat_users.service';
import { ChatUsersController } from './chat_users.controller';
import { LoggerPrint } from '../logger/logger.print';

@Module({
  imports: [TypeOrmModule.forFeature([ChatUser])],
  providers: [
    ChatUsersService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(ChatUsersService.name),
    },
  ],
  exports: [ChatUsersService],
  controllers: [ChatUsersController],
})
export class ChatUsersModule {}
