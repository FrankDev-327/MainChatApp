import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { TaskType, TaskStatus, DeadlineType } from '../task/create.task.dto';
import { MessageType } from '../chat.private.message/create.private.message.dto';

export class SendGroupMessageWithEntryPointDto {
    @ApiProperty({ example: 'sending drivers many message - private' })
    @IsString()
    message: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    room: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    group_id: number;

    @ApiProperty({ example: 162 })
    @IsNumber()
    sender_id: number;

    @ApiProperty({ example: 162 })
    @IsNumber()
    receiver_id: number;

    @ApiPropertyOptional({ example: 3 })
    @IsOptional()
    @IsNumber()
    taskId?: number;

    @ApiPropertyOptional({ example: 144 })
    @IsOptional()
    @IsNumber()
    parentTaskId?: number;

    @ApiProperty({ example: [1, 2], type: [Number] })
    @IsArray()
    @IsNumber({}, { each: true })
    driversIds: number[];

    @ApiPropertyOptional({ example: 'SHIP-20250625-001' })
    @IsOptional()
    @IsString()
    shipmentId?: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    is_urgent: boolean;

    @ApiProperty({ example: MessageType.TEXT, enum: MessageType })
    @IsEnum(MessageType)
    message_type: MessageType;

    @ApiProperty({ example: true })
    @IsBoolean()
    is_notification: boolean;
}