import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';

export enum TaskType {
  SIMPLE = 'simple',
  MULTITASK = 'multitask',
}

export enum TaskStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  FAILED = 'failed',
}

export enum DeadlineType {
  ASAP = 'ASAP',
  BY_DATETIME = 'BY_DATETIME',
  BETWEEN = 'BETWEEN',
  ANYTIME = 'ANYTIME',
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Deliver documents to client' })
  @IsString()
  taskTitle: string;

  @ApiProperty({ example: 12 })
  @IsOptional()
  @IsNumber()
  parentTaskId?: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  sender_id: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  receiver_id: number;

  @ApiProperty({ example: 101 })
  @IsOptional()
  @IsNumber()
  vehicleId?: number | null;

  @ApiProperty({ example: 'SHIP-2026-00045' })
  @IsOptional()
  @IsString()
  shipmentId?: string | null;

  @ApiProperty({ example: 'Pick up the package and confirm delivery with signature.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  requirePhoto: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  requireSignature: number;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  requireLocation: number;

  @IsOptional()
  @IsNumber()
  requireBarcode: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  requireStart: number;

  @IsOptional()
  @IsNumber()
  isRoot: number;

  @ApiProperty({ example: '45.815399' })
  @IsString()
  locationLat?: string;

  @ApiProperty({ example: '15.966568' })
  @IsString()
  locationLong?: string;

  @ApiProperty({ example: TaskType.SIMPLE, enum: TaskType })
  @IsEnum(TaskType)
  taskType: TaskType;

  @ApiProperty({ example: TaskStatus.ASSIGNED, enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus | null;

  @ApiProperty({ example: '2026-03-01T08:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  deadlineStart?: Date | null;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  deadlineEnd?: Date | null;

  @ApiProperty({ example: DeadlineType.BY_DATETIME, enum: DeadlineType })
  @IsOptional()
  @IsEnum(DeadlineType)
  deadlineType?: DeadlineType | null;

  @ApiProperty({ example: '2026-02-25T10:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiProperty({ example: 'Warehouse Zagreb - Dock 3' })
  @IsOptional()
  @IsString()
  location?: string | null;
}
