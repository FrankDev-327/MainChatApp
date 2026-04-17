import Redis from 'ioredis';
import { Module } from '@nestjs/common';
import { LoggerPrint } from '../logger/logger.print';
import { RedisUtilsService } from './redis-utils.service';

@Module({
  imports: [],
  exports: [RedisUtilsService],
  providers: [
    RedisUtilsService,
    {
      provide: Redis,
      useFactory: () => {
        return new Redis({
          port: Number(process.env.REDIS_PORT) || 6379,
          host: process.env.REDIS_HOST,
        });
      },
    },
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(RedisUtilsService.name),
    }
  ],
})
export class RedisUtilsModule { }
