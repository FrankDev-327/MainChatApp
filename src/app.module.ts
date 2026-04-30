import { Module } from '@nestjs/common';
import { dbdatasource } from '../orm';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from './authentication/authentication.module';
import { ChatMessengerModule } from './chat-messenger/chat-messenger.module';
import { NominativeModule } from './nominative/nominative.module';
import { RedisUtilsModule } from './redis-utils/redis-utils.module';
import { ChatUsersModule } from './chat_users/chat_users.module';
import { ChatTasksModule } from './chat-tasks/chat-tasks.module';
import { ChatPrivateMessagesModule } from './chat-private-messages/chat-private-messages.module';
import { TokenModule } from './token/token.module';
import { LoggerModule } from './logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health/health.controller';
import { TaskModule } from './task/task.module';
//import { RabbitTaskModule } from './rabbit.task/rabbit.task.module';
import { UploadfilesModule } from './uploadfiles/uploadfiles.module';
import { PrometheusChatappModule } from './prometheus-chatapp/prometheus-chatapp.module';
import { EmiterSubscribersModule } from './emiter-subscribers/emiter-subscribers.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dbdatasource),
    AuthenticationModule,
    ChatMessengerModule,
    NominativeModule,
    RedisUtilsModule,
    ChatUsersModule,
    ChatTasksModule,
    ChatPrivateMessagesModule,
    TokenModule,
    LoggerModule,
    TaskModule,
    //RabbitTaskModule,
    UploadfilesModule,
    PrometheusChatappModule,
    EmiterSubscribersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
