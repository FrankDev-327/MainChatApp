import { Controller, Get } from '@nestjs/common';
import { ChatMessengerGateway } from './chat-messenger.gateway';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('chat-messenger')
@Controller('chat-messenger')
export class ChatMessengerController {
  constructor(private readonly chatMessengerGateway: ChatMessengerGateway) {}

  @ApiOperation({
    summary:
      '**NOTE** Do not use this endpoint it has different purpose to be used',
  })
  @Get('online')
  async usersOnOffline() {
    return await this.chatMessengerGateway.handleOnlineUsers();
  }
}
