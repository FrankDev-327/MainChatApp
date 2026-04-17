import { ApiProperty } from '@nestjs/swagger';
import { FilterByDate, TaskStatus } from '../../entities/chat.task.entity';
import { IsInt, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class ChatTaskListingByDriverDto {
    @ApiProperty({ example: TaskStatus.ASSIGNED, enum: TaskStatus })
    @IsEnum(TaskStatus)
    typeStatus: TaskStatus;

    @ApiProperty({
        example: FilterByDate.THIS_MONTH,
        enum: FilterByDate
    })
    @IsEnum(FilterByDate)
    filterByDate: FilterByDate;
}