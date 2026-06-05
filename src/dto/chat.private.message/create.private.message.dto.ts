import {
    IsBoolean,
    IsString,
    IsOptional,
    IsEnum,
    IsArray,
    IsDateString,
    IsNumber,
} from 'class-validator';


export enum TaskStatus {
    assigned = 'assigned',
    in_progress = 'in_progress',
    completed = 'completed',
    rejected = 'rejected',
    failed = 'failed',
}

export enum MessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    COORDINATES = 'COORDINATES',
    TEMPLATE = 'TEMPLATE',
    DOCUMENT = 'DOCUMENT',
}


export class CreateMessageTaskDto {
    @IsOptional()
    @IsString()
    message?: string;

    /*     @IsString()
        action: string; */

    @IsString()
    @IsOptional()
    file?: string;

    @IsNumber()
    group_id: number;

    @IsNumber()
    sender_id: number;

    @IsNumber()
    receiver_id: number;

    @IsOptional()
    @IsNumber()
    taskId?: number; // empty number allowed

    @IsOptional()
    @IsNumber()
    parentTaskId?: number;

    /*     @IsOptional()
        @IsNumber()
        vehicleId?: number; */

    /*     @IsArray()
        driversIds: number[]; */

    /*     @IsString()
        taskTitle: string; */

    /*    @IsEnum(TaskStatus)
       status: TaskStatus; */

    /*    @IsString()
       description: string; */

    /*  @IsEnum(['simple', 'multitask'])
     taskType: 'simple' | 'multitask'; */

    @IsEnum(MessageType)
    message_type: MessageType;

    /*     @IsOptional()
        @IsDateString()
        deadlineStart?: string;
    
        @IsOptional()
        @IsDateString()
        deadlineEnd?: string; */

    /*     @IsOptional()
        @IsEnum(['ASAP', 'BY_DATETIME', 'BETWEEN', 'ANYTIME'])
        deadlineType?: 'ASAP' | 'BY_DATETIME' | 'BETWEEN' | 'ANYTIME'; */

    @IsOptional()
    @IsString()
    lon: string;

    @IsOptional()
    @IsString()
    lonCoodinate?: string;

    @IsOptional()
    @IsString()
    latCoodinate?: string;

    @IsOptional()
    @IsString()
    lat: string;

    @IsString()
    position: string;
}
