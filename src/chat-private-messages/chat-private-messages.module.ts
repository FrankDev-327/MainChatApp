import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessageEntity } from '../entities/chatt.private.messages.entity';
import { ChatPrivateMessagesService } from './chat-private-messages.service';
import { ChatPrivateMessagesController } from './chat-private-messages.controller';
import { LoggerPrint } from '../logger/logger.print';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessageEntity])],
  providers: [
    ChatPrivateMessagesService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(ChatPrivateMessagesService.name),
    },
  ],
  exports: [ChatPrivateMessagesService],
  controllers: [ChatPrivateMessagesController],
})
export class ChatPrivateMessagesModule {}
