import { Global, Module } from '@nestjs/common';
import { LoggerPrint } from '../logger/logger.print';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmiterSubscribersService } from './emiter-subscribers.service';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true,
    }),
  ],
  providers: [
    EmiterSubscribersService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(EmiterSubscribersService.name),
    },
  ],
  exports: [EmiterSubscribersService],
})
export class EmiterSubscribersModule {}
