import { Module } from '@nestjs/common';
import { ChatDbGroupsService } from './chat.db.groups.service';
import { LoggerPrint } from 'src/logger/logger.print';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatDbGroupEntity } from 'src/entities/chat.db.groups.entity';
import { DbGroupEntity } from 'src/entities/db.groups.entity';

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
