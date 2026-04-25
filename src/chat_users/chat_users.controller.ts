import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ChatUsersService } from './chat_users.service';
import { CreateChatUserDto } from '../dto/users/create.user.dto';

@Controller('chat-users')
export class ChatUsersController {
  constructor(private chatUsersService: ChatUsersService) { }

  @Post()
  async create(@Body() createChatUserDto: CreateChatUserDto) {
    return await this.chatUsersService.create(createChatUserDto);
  }

  @Put(':id')
  async update(@Body() updateChatUserDto: CreateChatUserDto, @Param('id') id: number) {
    return await this.chatUsersService.update(id, updateChatUserDto);
  }
}
