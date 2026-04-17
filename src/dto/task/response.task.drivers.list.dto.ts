import { ApiProperty } from '@nestjs/swagger';
import { TaskType, TaskStatus, DeadlineType } from './create.task.dto';

export class ChatTaskListResponseDto {
    @ApiProperty({ example: 1 })
    chatTasks_taskId: number;

    @ApiProperty({ example: 'title test task from nestjs' })
    chatTasks_title: string;

    @ApiProperty({ example: 0 })
    chatTasks_parentTaskId: number;

    @ApiProperty({ example: 162 })
    chatTasks_creatorId: number;

    @ApiProperty({ example: 162 })
    chatTasks_receiverId: number;

    @ApiProperty({ example: 5, nullable: true })
    chatTasks_vehicleId: number | null;

    @ApiProperty({ example: 'SHIP-20250625-001', nullable: true })
    chatTasks_shipmentId: string | null;

    @ApiProperty({ example: 'Deliver documents to client' })
    chatTasks_description: string;

    @ApiProperty({ example: TaskType.SIMPLE, enum: TaskType })
    chatTasks_taskType: TaskType;

    @ApiProperty({ example: TaskStatus.ASSIGNED, enum: TaskStatus })
    chatTasks_status: TaskStatus;

    @ApiProperty({ example: DeadlineType.BY_DATETIME, enum: DeadlineType })
    chatTasks_deadlineType: DeadlineType;

    @ApiProperty({ example: '2026-02-09T09:00:00.000Z', nullable: true })
    chatTasks_deadlineStart: string | null;

    @ApiProperty({ example: '2025-06-26T17:00:00.000Z', nullable: true })
    chatTasks_deadlineEnd: string | null;

    @ApiProperty({ example: '', nullable: true })
    chatTasks_location: string | null;

    @ApiProperty({ example: null, nullable: true })
    chatTasks_requiredConfirmations: number | null;

    @ApiProperty({ example: '2026-01-05T09:20:53.000Z' })
    chatTasks_createdAt: string;

    @ApiProperty({ example: null, nullable: true })
    chatTasks_storedAt: string | null;

    @ApiProperty({ example: null, nullable: true })
    chatTasks_receivedAt: string | null;

    @ApiProperty({ example: null, nullable: true })
    chatTasks_readAt: string | null;

    @ApiProperty({ example: null, nullable: true })
    chatTasks_rejectedAt: string | null;

    @ApiProperty({ example: null, nullable: true })
    chatTasks_rejectedReason: string | null;

    @ApiProperty({ example: null, nullable: true })
    chatTasks_archivedAt: string | null;

    @ApiProperty({ example: 2, description: 'Number of subtasks' })
    subtaskCount: number;
}