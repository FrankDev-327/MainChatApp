import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

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



@ObjectType()
@Entity('chatTasks')
export class ChatTaskEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ name: 'taskId' })
  taskId: number;

  @Field(() => String)
  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Field(() => Number)
  @Column({ name: 'parentTaskId', type: 'int' })
  parentTaskId?: number;

  @Field(() => Number)
  @Column({ name: 'creatorId', type: 'int', nullable: true })
  createdBy: number;

  @Field(() => Number) @Column({ name: 'assigneeId', type: 'int', nullable: true })
  @Column({ name: 'assigneeId', type: 'int' })
  assigneeId?: number;

  @Field(() => Number) @Column({ name: 'assignerId', type: 'int', nullable: true })
  @Column({ name: 'receiverId', type: 'int' })
  receiverId: number;

  @Field(() => Number)
  @Column({ name: 'carId', type: 'int', nullable: true })
  carId?: number;

  @Field(() => Number)
  @Column({ name: 'require_photo', type: 'int', default: false })
  requirePhoto: number;

  @Field(() => Number)
  @Column({ name: 'require_location', type: 'int', default: false })
  requireLocation: number;

  @Field(() => Number)
  @Column({ name: 'is_root', type: 'int', default: 0 })
  isRoot: number;

  @Field(() => String)
  @Field(() => String)
  @Column({ name: 'location_lat', type: 'varchar', length: 255 })
  locationLat?: string;

  @Field(() => String)
  @Column({ name: 'location_lng', type: 'varchar', length: 255 })
  locationLong?: string;

  @Field(() => String)
  @Column({ name: 'description', type: 'varchar', length: 100 })
  description: string;

  @Field(() => String)
  @Column({
    name: 'taskType',
    type: 'enum',
    enum: ['simple', 'multitask'],
    default: 'simple',
  })
  taskType: 'simple' | 'multitask';

  @Field(() => String)
  @Column({
    name: 'status',
    type: 'enum',
    enum: ['assigned', 'in_progress', 'completed', 'rejected', 'failed'],
    default: 'assigned',
  })
  status: 'assigned' | 'in_progress' | 'completed' | 'rejected' | 'failed';

  @Field(() => String)
  @Column({
    name: 'deadlineType',
    type: 'enum',
    enum: ['ASAP', 'BY_DATETIME', 'BETWEEN', 'ANYTIME'],
    nullable: true,
  })
  deadlineType?: 'ASAP' | 'BY_DATETIME' | 'BETWEEN' | 'ANYTIME';

  @Field(() => String)
  @Column({ name: 'deadlineStart', type: 'timestamp', nullable: true })
  deadlineStart?: Date | null;

  @Field(() => String)
  @Column({ name: 'deadlineEnd', type: 'timestamp', nullable: true })
  deadlineEnd?: Date | null;

  @Column({ name: 'location', type: 'json', nullable: true })
  location?: Object | null;

  @Field(() => String)
  @Column({ name: 'requiredConfirmations', type: 'text', nullable: true })
  requiredConfirmations?: string;

  @Field(() => String)
  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Field(() => String)
  @Column({ name: 'rejectedAt', type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Field(() => String)
  @Column({
    name: 'rejectedReason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  rejectedReason?: string;

  @Field(() => String)
  @Column({ name: 'archivedAt', type: 'timestamp', nullable: true })
  archivedAt?: Date;

  @ManyToOne(() => UserEntity, (user) => user.tasks, { onDelete: 'SET NULL' })
  user: UserEntity;
}
