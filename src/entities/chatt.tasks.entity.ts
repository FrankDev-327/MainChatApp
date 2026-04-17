import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('chatTasks')
export class ChatTaskEntity {
  @PrimaryGeneratedColumn({ name: 'taskId' })
  taskId: number;

  @Column({ name: 'parentTaskId', type: 'int'})
  parentTaskId?: number;

  @Column({ name: 'creatorId', type: 'int' })
  creatorId: number;

  @Column({ name: 'receiverId', type: 'int' })
  receiverId: number;

  @Column({ name: 'vehicleId', type: 'int', nullable: true })
  vehicleId?: number;

  @Column({ name: 'shipmentId', type: 'varchar', length: 64, nullable: true })
  shipmentId?: string;

  @Column({ name: 'require_photo', type: 'int', default: false })
  requirePhoto: number;

  @Column({ name: 'require_signature', type: 'int', default: false })
  requireSignature: number;

  @Column({ name: 'require_location', type: 'int', default: false })
  requireLocation: number;

  @Column({ name: 'require_barcode', type: 'int', default: false })
  requireBarcode: number;

  @Column({ name: 'require_start', type: 'int', default: false })
  requireStart: number;

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

  @Column({ name: 'deadlineStart', type: 'datetime', nullable: true })
  deadlineStart?: Date | null;

  @Column({ name: 'deadlineEnd', type: 'datetime', nullable: true })
  deadlineEnd?: Date | null;

  @Column({ name: 'location', type: 'text', nullable: true })
  location?: string;

  @Column({ name: 'requiredConfirmations', type: 'text', nullable: true })
  requiredConfirmations?: string;

  @Column({
    name: 'createdAt',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'storedAt', type: 'datetime', nullable: true })
  storedAt?: Date;

  @Column({ name: 'receivedAt', type: 'datetime', nullable: true })
  receivedAt?: Date;

  @Column({ name: 'readAt', type: 'datetime', nullable: true })
  readAt?: Date;

  @Column({ name: 'rejectedAt', type: 'datetime', nullable: true })
  rejectedAt?: Date;

  @Column({
    name: 'rejectedReason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  rejectedReason?: string;

  @Column({ name: 'archivedAt', type: 'datetime', nullable: true })
  archivedAt?: Date;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title?: string;
}
