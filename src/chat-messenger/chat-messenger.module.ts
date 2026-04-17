import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from '../token/token.module';
import { RedisUtilsModule } from '../redis-utils/redis-utils.module';
import { ChatMessengerGateway } from './chat-messenger.gateway';
import { ChatPrivateMessagesModule } from '../chat-private-messages/chat-private-messages.module';
import { LoggerPrint } from '../logger/logger.print';
import { ChatMessengerController } from './chat-messenger.controller';

@Module({
  imports: [
    TokenModule,
    ChatPrivateMessagesModule,
    RedisUtilsModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY_TOKEN,
      signOptions: {
        expiresIn: '15d',
      },
    }),
  ],
  providers: [
    ChatMessengerGateway,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(ChatMessengerGateway.name),
    },
  ],
  controllers: [ChatMessengerController],
})
export class ChatMessengerModule {}
