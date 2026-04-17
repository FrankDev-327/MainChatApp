import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoggerPrint } from '../logger/logger.print';

@Injectable()
export class EmiterSubscribersService {
  constructor(
    private loggerPrint: LoggerPrint,
    private eventEmitter: EventEmitter2,
  ) {}

  async emittingEventToBeSubscribed(
    channel: string,
    dataToBeEmitted: any,
  ): Promise<void> {
    try {
      this.eventEmitter.emit(channel, dataToBeEmitted);
    } catch (error) {
      this.loggerPrint.error(error.message);
    }
  }
}
