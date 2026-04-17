import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum TaskType {
  SIMPLE = 'simple',
  MULTITASK = 'multitask',
}

export enum FilterByDate {
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
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

@Entity('chatTasks')
export class ChatTaskEntity {
  @PrimaryGeneratedColumn({ name: 'taskId' })
  taskId: number;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ name: 'parentTaskId', type: 'int', nullable: true })
  parentTaskId: number;

  @Column({ name: 'creatorId', type: 'int' })
  creatorId: number;

  @Column({ name: 'receiverId', type: 'int' })
  receiverId: number;

  @Column({ name: 'vehicleId', type: 'int', nullable: true })
  vehicleId: number;

  @Column({ name: 'shipmentId', type: 'varchar', length: 64, nullable: true })
  shipmentId?: string | null;

  @Column({ name: 'description', type: 'varchar', length: 100 })
  description: string;

  @Column({
    name: 'taskType',
    type: 'enum',
    enum: TaskType,
    default: TaskType.SIMPLE,
  })
  taskType: TaskType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.ASSIGNED,
  })
  status: TaskStatus;

  @Column({
    name: 'deadlineType',
    type: 'enum',
    enum: DeadlineType,
    nullable: true,
    default: null,
  })
  deadlineType: DeadlineType;

  @Column({ name: 'deadlineStart', type: 'datetime', nullable: true })
  deadlineStart: Date;

  @Column({ name: 'deadlineEnd', type: 'datetime', nullable: true })
  deadlineEnd: Date;

  @Column({ name: 'location', type: 'text', nullable: true })
  location: string;

  @Column({ name: 'requiredConfirmations', type: 'text', nullable: true })
  requiredConfirmations: string;

  @Column({
    name: 'createdAt',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'storedAt', type: 'datetime', nullable: true })
  storedAt: Date;

  @Column({ name: 'receivedAt', type: 'datetime', nullable: true })
  receivedAt: Date;

  @Column({ name: 'readAt', type: 'datetime', nullable: true })
  readAt: Date;

  @Column({ name: 'rejectedAt', type: 'datetime', nullable: true })
  rejectedAt: Date;

  @Column({
    name: 'rejectedReason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  rejectedReason: string;

  @Column({ name: 'archivedAt', type: 'datetime', nullable: true })
  archivedAt: Date | null;
}
