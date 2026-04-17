import { Module } from '@nestjs/common';
import { ChatButtonService } from './chat.button.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatButtonEntity } from '../entities/chat.button.entity';
import { ButtonEntity } from '../entities/button.entity';
import { LoggerPrint } from '../logger/logger.print';

@Module({
  imports: [TypeOrmModule.forFeature([ChatButtonEntity, ButtonEntity])],
  providers: [
    ChatButtonService,
    {
      provide: LoggerPrint,
      useFactory: () => new LoggerPrint(ChatButtonModule.name),
    },
  ],
  exports: [ChatButtonService],
})
export class ChatButtonModule {}
