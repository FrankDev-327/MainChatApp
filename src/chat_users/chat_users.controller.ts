import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ChatUsersService } from './chat_users.service';

@Controller('chat-users')
export class ChatUsersController {
  constructor(private chatUsersService: ChatUsersService) { }

}
