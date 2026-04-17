import { Module } from '@nestjs/common';
import { PrometheusChatappService } from './prometheus-chatapp.service';
import { PrometheusChatappController } from './prometheus-chatapp.controller';

@Module({
  exports: [PrometheusChatappService],
  providers: [PrometheusChatappService],
  controllers: [PrometheusChatappController]
})
export class PrometheusChatappModule {}
