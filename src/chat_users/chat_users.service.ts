import { Repository } from 'typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginUserDto } from '../dto/auth/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { totalUserCreatedGauge } from '../prometheus-chatapp/prometheus-chatapp.exporters';

@Injectable()
export class ChatUsersService {
  constructor(
    private loggerPrint: LoggerPrint,
  ) { }

  async findByUserName(dto: LoginUserDto): Promise<UserEntity | any | null> {

  }

  async delete(userName: string): Promise<void> {

  }
}
