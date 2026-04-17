import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ChatUserRightsService } from './chat-user-rights.service';
import { CreateUserGroupRightDto } from '../dto/chat.users.rights/create.chat.users.rights.dto';
import { ApiOkResponse, ApiOperation, ApiTags, ApiHideProperty } from '@nestjs/swagger';

//@ApiTags('Chat User Rights')
@Controller('chat-user-rights')
export class ChatUserRightsController {
    constructor(private readonly chatUserRightsService: ChatUserRightsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new task' })
    @ApiOkResponse({ description: 'The task has been successfully created.' })
    async setUserGroupRight(@Body() dto: CreateUserGroupRightDto) {
        return await this.chatUserRightsService.setUserGroupRight(dto);
    }

    @Get()
    async listUserGroupRights() {
        return await this.chatUserRightsService.listUserGroupRights();
    }

    @Get('users/permissions/:userId/:groupId')
    async listingPermissionByUserIdAndGroupId(@Param() dto) {
        return await this.chatUserRightsService.listingPermissionByUserIdAndGroupId(dto);
    }
}
