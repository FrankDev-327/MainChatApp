import { Repository } from 'typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginUserDto } from '../dto/auth/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserDto } from '../dto/users/create.user.dto';
import { totalUserCreatedGauge } from '../prometheus-chatapp/prometheus-chatapp.exporters';

@Injectable()
export class ChatUsersService {
  constructor(
    private loggerPrint: LoggerPrint,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
  ) { }

  async create(dto: UserDto): Promise<UserEntity> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: {
          email: dto.email
        }
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      const user = this.userRepository.create(dto);
      const savedUser = await this.userRepository.save(user);
      totalUserCreatedGauge.inc();
      return savedUser;
    } catch (error) {
      this.loggerPrint.error('Error creating user:', error);
      throw new BadRequestException('Error creating user');
    }
  }

  async findByUserName(dto: LoginUserDto): Promise<UserEntity> {
    try {
      return await this.userRepository.findOne({ where: { email: dto.email }, relations: ['dbGroup'] });
    } catch (error) {      
      this.loggerPrint.error('Error finding user by email:', error);
      throw new BadRequestException('Error finding user by email');
    }
  }

  async deleteUser(email: string): Promise<void> {

  }
}
