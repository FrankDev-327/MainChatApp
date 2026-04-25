import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatDriversModule } from '../chat-drivers/chat-drivers.module';
import { ChatDeviceRegistratonController } from './chat.device.registraton.controller';
import { ChatDeviceRegistratonService } from './chat.device.registraton.service';
import { ChaskDeviceRegistrationEntity } from '../entities/chat.device.registration.entity';
import { LoggerPrint } from '../logger/logger.print';

@Module({
  imports: [
    ChatDriversModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY_TOKEN,
      signOptions: {
        expiresIn: '15d',
      },
    }),
    TypeOrmModule.forFeature([ChaskDeviceRegistrationEntity]),
  ],
  //controllers: [ChatDeviceRegistratonController],
  providers: [
    ChatDeviceRegistratonService,
    {
      provide: LoggerPrint,
      useValue: new LoggerPrint(ChatDeviceRegistratonService.name),
    },
  ],
  exports: [ChatDeviceRegistratonService],
})
export class ChatDeviceRegistratonModule {}
