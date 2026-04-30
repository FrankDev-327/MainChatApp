import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('chatTasks')
export class ChatTaskEntity {
  @PrimaryGeneratedColumn({ name: 'taskId' })
  taskId: number;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ name: 'parentTaskId', type: 'int' })
  parentTaskId?: number;

  @Column({ name: 'creatorId', type: 'int', nullable: true })
  createdBy: number;

  @Column({ name: 'receiverId', type: 'int' })
  receiverId: number;

  @Column({ name: 'carId', type: 'int', nullable: true })
  carId?: number;

  @Column({ name: 'require_photo', type: 'int', default: false })
  requirePhoto: number;

  @Column({ name: 'require_location', type: 'int', default: false })
  requireLocation: number;

  @Column({ name: 'is_root', type: 'int', default: 0 })
  isRoot: number;

  @Column({ name: 'location_lat', type: 'varchar', length: 255 })
  locationLat?: string;

  @Column({ name: 'location_lng', type: 'varchar', length: 255 })
  locationLong?: string;

  @Column({ name: 'description', type: 'varchar', length: 100 })
  description: string;

  @Column({
    name: 'taskType',
    type: 'enum',
    enum: ['simple', 'multitask'],
    default: 'simple',
  })
  taskType: 'simple' | 'multitask';

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['assigned', 'in_progress', 'completed', 'rejected', 'failed'],
    default: 'assigned',
  })
  status: 'assigned' | 'in_progress' | 'completed' | 'rejected' | 'failed';

  @Column({
    name: 'deadlineType',
    type: 'enum',
    enum: ['ASAP', 'BY_DATETIME', 'BETWEEN', 'ANYTIME'],
    nullable: true,
  })
  deadlineType?: 'ASAP' | 'BY_DATETIME' | 'BETWEEN' | 'ANYTIME';

  @Column({ name: 'deadlineStart', type: 'timestamp', nullable: true })
  deadlineStart?: Date | null;

  @Column({ name: 'deadlineEnd', type: 'timestamp', nullable: true })
  deadlineEnd?: Date | null;

  @Column({ name: 'location', type: 'json', nullable: true })
  location?: Object | null;

  @Column({ name: 'requiredConfirmations', type: 'text', nullable: true })
  requiredConfirmations?: string;

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'rejectedAt', type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({
    name: 'rejectedReason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  rejectedReason?: string;

  @Column({ name: 'archivedAt', type: 'timestamp', nullable: true })
  archivedAt?: Date;

  @ManyToOne(() => UserEntity, (user) => user.tasks, { onDelete: 'SET NULL' })
  user: UserEntity;
}
