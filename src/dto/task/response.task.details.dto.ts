import { ApiProperty } from '@nestjs/swagger';
import { TaskType, TaskStatus, DeadlineType } from './create.task.dto';

export class TaskDetailsResponseDto {
  @ApiProperty({ example: 100 })
  taskId: number;

  @ApiProperty({ example: 0 })
  parentTaskId: number;

  @ApiProperty({ example: 162 })
  creatorId: number;

  @ApiProperty({ example: 162 })
  receiverId: number;

  @ApiProperty({ example: 5, nullable: true })
  vehicleId: number | null;

  @ApiProperty({ example: 'SHIP-20250625-001', nullable: true })
  shipmentId: string | null;

  @ApiProperty({ example: 'Deliver documents to client' })
  description: string;

  @ApiProperty({ example: TaskType.SIMPLE, enum: TaskType })
  taskType: TaskType;

  @ApiProperty({ example: TaskStatus.ASSIGNED, enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ example: DeadlineType.BY_DATETIME, enum: DeadlineType })
  deadlineType: DeadlineType;

  @ApiProperty({ example: '2025-06-26T09:00:00.000Z', nullable: true })
  deadlineStart: string | null;

  @ApiProperty({ example: '2025-06-26T17:00:00.000Z', nullable: true })
  deadlineEnd: string | null;

  @ApiProperty({ example: '', nullable: true })
  location: string | null;

  @ApiProperty({ example: null, nullable: true })
  requiredConfirmations: number | null;

  @ApiProperty({ example: '2026-02-06T08:58:41.000Z' })
  createdAt: string;

  @ApiProperty({ example: null, nullable: true })
  storedAt: string | null;

  @ApiProperty({ example: null, nullable: true })
  receivedAt: string | null;

  @ApiProperty({ example: null, nullable: true })
  readAt: string | null;

  @ApiProperty({ example: null, nullable: true })
  rejectedAt: string | null;

  @ApiProperty({ example: null, nullable: true })
  rejectedReason: string | null;

  @ApiProperty({ example: null, nullable: true })
  archivedAt: string | null;

  @ApiProperty({ example: 'title test task from nestjs' })
  title: string;

  @ApiProperty({ example: 0 })
  require_photo: number;

  @ApiProperty({ example: 0 })
  require_signature: number;

  @ApiProperty({ example: 0 })
  require_location: number;

  @ApiProperty({ example: 0 })
  require_barcode: number;

  @ApiProperty({ example: 0 })
  require_start: number;

  @ApiProperty({ example: 0 })
  is_root: number;

  @ApiProperty({ example: null, nullable: true })
  location_lat: string | null;

  @ApiProperty({ example: null, nullable: true })
  location_lng: string | null;

  @ApiProperty({ type: [Object], example: [] })
  subtasks: any[];
}