import { Module } from '@nestjs/common';
import { ChatDbGroupsService } from './chat.db.groups.service';
import { LoggerPrint } from '../logger/logger.print';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatDbGroupEntity } from '../entities/chat.db.groups.entity';
import { DbGroupEntity } from '../entities/db.groups.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatDbGroupEntity, DbGroupEntity])],
  providers: [
    ChatDbGroupsService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(ChatDbGroupsService.name),
    },
  ],
  exports: [ChatDbGroupsService],
})
export class ChatDbGroupsModule {}
