import { K6testingGuard } from '../k6testing/k6testing.guard';
import { Controller, Delete, UseGuards } from '@nestjs/common';
import { ChatPrivateMessagesService } from './chat-private-messages.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('ChatPrivateMessages')
@Controller('chat-private-messages')
export class ChatPrivateMessagesController {
    constructor(private readonly chatPrivateMessagesService: ChatPrivateMessagesService) { }

    @ApiOperation({ summary: '**NOTE** Do not use this endpoint it has different purpose to be used' })
    @UseGuards(K6testingGuard)
    @Delete()
    async deleteAllMessagesFromTest(): Promise<void> {
        await this.chatPrivateMessagesService.deleteAllMessagesFromTest();
    }
}
