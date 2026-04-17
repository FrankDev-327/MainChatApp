import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatUserRightsService } from './chat-user-rights.service';
import { ChatUserGroupRightEntity } from '../entities/chat.user.rights.entity';
import { ChatUserRightsController } from './chat-user-rights.controller';
import { LoggerPrint } from '../logger/logger.print';

@Module({
  imports: [TypeOrmModule.forFeature([ChatUserGroupRightEntity])],
  providers: [
    ChatUserRightsService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(ChatUserRightsService.name),
    },
  ],
  exports: [ChatUserRightsService],
  //controllers: [ChatUserRightsController],
})
export class ChatUserRightsModule {}
