import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { MessageType } from "../chat.private.message/create.private.message.dto";

export class ReceiveLocationDto {
    @ApiPropertyOptional({ example: '13.0708017' })
    @IsString()
    lat: string;

    @ApiPropertyOptional({ example: '47.7698326' })
    @IsString()
    lon: string;

    @ApiPropertyOptional({ example: 1  })
    @IsNumber()
    group_id: number;

    @ApiPropertyOptional({ example: 162 })
    @IsNumber()
    sender_id: number;

    @ApiPropertyOptional({ example: 162 })
    @IsNumber()
    receiver_id: number;

    @ApiProperty({ example: MessageType.TEXT, enum: MessageType, })
    @IsEnum(MessageType)
    message_type: MessageType;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    taskId?: number;
}