import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../chat.private.message/create.private.message.dto';

class ChatUserIdsDto {
    @ApiProperty({ example: 162 })
    senderId: number;

    @ApiProperty({ example: 162 })
    receiverId: number;
}

export class SendGroupMessageResponseDto {
    @ApiProperty({ example: 162 })
    senderId: number;

    @ApiProperty({ example: 162 })
    receiverId: number;

    @ApiProperty({ example: 0 })
    groupId: number;

    @ApiProperty({ example: 3 })
    taskId: number;

    @ApiProperty({ example: 'testing task to be inserted into the db' })
    content: string;

    @ApiProperty({ example: '' })
    fileUrl: string;

    @ApiProperty({ example: MessageType.TEXT, enum: MessageType })
    messageType: MessageType;

    @ApiProperty({ example: 0 })
    isUrgent: number;

    @ApiProperty({ example: 0 })
    isNotification: number;

    @ApiProperty({ example: '2026-02-26T06:00:29.545Z' })
    storedAt: string;

    @ApiProperty({ example: {} })
    position: Record<string, any>;

    @ApiPropertyOptional({ example: null, nullable: true })
    parentTaskId: number | null;

    @ApiProperty({ example: 2138 })
    messageId: number;

    @ApiProperty({ example: '2026-02-26T07:00:29.000Z' })
    createdAt: string;

    @ApiProperty({ example: 'PRIVATE' })
    typeSendCoordinates: string;

    @ApiProperty({ type: () => ChatUserIdsDto })
    chatUserIds: ChatUserIdsDto;
}