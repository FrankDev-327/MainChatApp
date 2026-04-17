import { Module } from '@nestjs/common';
import { ChatQrCodeController } from './chat.qr.code.controller';

@Module({
  controllers: [ChatQrCodeController]
})
export class ChatQrCodeModule {}
