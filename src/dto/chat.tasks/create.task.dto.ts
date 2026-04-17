import { IsInt, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class CreateChatTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  parentTaskId?: number;

  @IsInt()
  creatorId: number;

  @IsInt()
  receiverId: number;

  @IsOptional()
  @IsInt()
  vehicleId?: number;

  @IsOptional()
  @IsString()
  shipmentId?: string;

  @IsString()
  description: string;

  @IsEnum(['simple', 'multitask'])
  taskType: 'simple' | 'multitask';

  @IsEnum(['assigned', 'in_progress', 'completed', 'rejected', 'failed'])
  status: 'assigned' | 'in_progress' | 'completed' | 'rejected' | 'failed';

  @IsOptional()
  @IsDateString()
  deadlineStart?: string;

  @IsOptional()
  @IsDateString()
  deadlineEnd?: string;

  @IsOptional()
  @IsEnum(['ASAP', 'BY_DATETIME', 'BETWEEN', 'ANYTIME'])
  deadlineType?: 'ASAP' | 'BY_DATETIME' | 'BETWEEN' | 'ANYTIME';

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
