import { Body, Controller, Post } from '@nestjs/common';
import { ChatUsersService } from './chat_users.service';

@Controller('chat-users')
export class ChatUsersController {
  constructor(private chatUsersService: ChatUsersService) { }


}
