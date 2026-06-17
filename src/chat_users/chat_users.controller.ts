import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ChatUsersService } from './chat_users.service';
import { UserDto } from '../dto/users/create.user.dto';
import { LoginUserDto } from '../dto/auth/login.dto';

@Controller('chat-users')
export class ChatUsersController {
  constructor(private chatUsersService: ChatUsersService) { }

  @Post()
  async create(@Body() dto: UserDto) {
    return this.chatUsersService.create(dto);
  }

  @Put(':userName')
  async findByUserName(@Param('userName') userName: string, @Body() dto: LoginUserDto) {
    return this.chatUsersService.findByUserName(dto);
  }

}
