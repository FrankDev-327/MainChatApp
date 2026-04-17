import { Module } from '@nestjs/common';
import { LoggerPrint } from '../logger/logger.print'; 
import { UploadfilesService } from './uploadfiles.service';
import { UploadfilesController } from './uploadfiles.controller';
import { ChatPrivateMessagesModule } from '../chat-private-messages/chat-private-messages.module';

@Module({
  imports: [ChatPrivateMessagesModule],
  providers: [
    UploadfilesService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(UploadfilesService.name),
    },
  ],
  exports: [UploadfilesService],
  controllers: [UploadfilesController],
})
export class UploadfilesModule {}
