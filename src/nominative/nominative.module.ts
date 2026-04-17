import { Module } from '@nestjs/common';
import { NominativeService } from './nominative.service';
import { ChatPrivateMessagesModule } from '../chat-private-messages/chat-private-messages.module';
import { LoggerPrint } from '../logger/logger.print';
import { NominativeController } from './nominative.controller';

@Module({
  imports: [ChatPrivateMessagesModule],
  providers: [
    NominativeService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(NominativeService.name),
    },
  ],
  exports: [NominativeService],
  //controllers: [NominativeController],
})
export class NominativeModule {}
