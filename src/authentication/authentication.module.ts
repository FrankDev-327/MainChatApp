import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from '../token/token.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { ChatUsersModule } from '../chat_users/chat_users.module';
import { ChatUser } from '../entities/chat.users.entity';
import { LoggerPrint } from '../logger/logger.print';

@Module({
  imports: [
    TokenModule,
    ChatUsersModule,
    TypeOrmModule.forFeature([ChatUser]),
    JwtModule.register({
      global: true,
      secret: process.env.KEY_SECRET,
      signOptions: {
        expiresIn: '15d',
      },
    }),
  ],
  providers: [
    AuthenticationService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(AuthenticationService.name),
    },
  ],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
