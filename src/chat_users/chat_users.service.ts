import { Repository } from 'typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginUserDto } from '../dto/auth/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUser } from '../entities/chat.users.entity';
import { CreateChatUserDto } from '../dto/users/create.user.dto';
import { UpdateChatUserDto } from '../dto/users/update.user.dto';
import { totalUserCreatedGauge } from '../prometheus-chatapp/prometheus-chatapp.exporters';

@Injectable()
export class ChatUsersService {
  constructor(
    @InjectRepository(ChatUser)
    private chatUsersRepository: Repository<ChatUser>,
    private loggerPrint: LoggerPrint,
  ) { }

  async create(createChatUserDto: CreateChatUserDto): Promise<ChatUser> {
    try {
      const newUser = this.chatUsersRepository.create(createChatUserDto);
      const savedUser = await this.chatUsersRepository.save(newUser);
      totalUserCreatedGauge.inc({ user_created: 'yes' });
      return savedUser;
    } catch (error) {
      this.loggerPrint.error(`Error creating chat user: ${error}`);
      throw new BadRequestException(error);
    }
  }

  async update(userId: number, updateChatUserDto: UpdateChatUserDto): Promise<ChatUser> {
    try {
      await this.chatUsersRepository.update(userId, updateChatUserDto);
      return await this.chatUsersRepository.findOneBy({ UserID: userId });
    } catch (error) {
      this.loggerPrint.error(`Error updating chat user: ${error}`);
      throw new BadRequestException(error);
    }
  }

  async findByUserName(dto: LoginUserDto): Promise<ChatUser | any | null> {
    try {
      const user = await this.chatUsersRepository.findOneBy({ UserName: dto.userName });
      return user;
    } catch (error) {
      this.loggerPrint.error(`Error fetching chat user by username: ${error}`);
      throw new BadRequestException(error);
    }
  }

  async delete(userName: string): Promise<void> {
    try {
      await this.chatUsersRepository.delete({ UserName: userName });
    } catch (error) {
      this.loggerPrint.error(`Error deleting chat user: ${error}`);
      throw new BadRequestException(error);
    }
  }
}
