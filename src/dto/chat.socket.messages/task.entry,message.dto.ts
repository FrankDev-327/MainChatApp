import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { TaskType, TaskStatus, DeadlineType } from '../task/create.task.dto';
import { MessageType } from '../chat.private.message/create.private.message.dto';

export class SendPrivateTaskMessageDto {
    @ApiProperty({ example: 'testing task to be inserted into the db' })
    @IsString()
    message: string;

    @ApiProperty({ example: 162 })
    @IsNumber()
    sender_id: number;

    @ApiProperty({ example: 162 })
    @IsNumber()
    receiver_id: number;

    @ApiPropertyOptional({ example: 144 })
    @IsOptional()
    @IsNumber()
    parentTaskId?: number;

    @ApiPropertyOptional({ example: TaskStatus.ASSIGNED, enum: TaskStatus })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ApiPropertyOptional({ example: 'SHIP-20250625-001' })
    @IsOptional()
    @IsString()
    shipmentId?: string;

    @ApiPropertyOptional({ example: TaskType.SIMPLE, enum: TaskType })
    @IsOptional()
    @IsEnum(TaskType)
    taskType?: TaskType;

    @ApiProperty({ example: 0, description: '0 = false, 1 = true' })
    @IsNumber()
    is_urgent: number;

    @ApiProperty({ example: MessageType.TEXT, enum: MessageType })
    @IsEnum(MessageType)
    message_type: MessageType;

    @ApiProperty({ example: 0, description: '0 = false, 1 = true' })
    @IsNumber()
    is_notification: number;

    @ApiPropertyOptional({ example: '13.0708017' })
    @IsOptional()
    @IsString()
    lon?: string;

    @ApiPropertyOptional({ example: '47.7698326' })
    @IsOptional()
    @IsString()
    lat?: string;

    @ApiPropertyOptional({ example: '13.0708017' })
    @IsOptional()
    @IsString()
    lonCoodinate?: string;

    @ApiPropertyOptional({ example: '47.7698326' })
    @IsOptional()
    @IsString()
    latCoodinate?: string;
}