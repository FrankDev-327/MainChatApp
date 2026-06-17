import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('chat_messages')
export class ChatMessageEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', })
  id: number;

  @Column({ name: 'sender_id', type: 'int' })
  senderId: number;

  @Column({ name: 'receiver_id', type: 'int', nullable: true })
  receiverId: number;

  @Column({ name: 'group_id', type: 'int', nullable: true })
  groupId?: number;

  @Column({ name: 'task_id', type: 'int', nullable: true })
  taskId: number | null;

  @Column({ name: 'parentTaskId', type: 'int', nullable: true })
  parentTaskId: number | null;

  @Column({ name: 'content', type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl?: string;

  @Column({
    name: 'message_type',
    type: 'enum',
    enum: ['TEXT', 'IMAGE', 'COORDINATES', 'TEMPLATE', 'DOCUMENT'],
  })
  messageType: 'TEXT' | 'IMAGE' | 'COORDINATES' | 'TEMPLATE' | 'DOCUMENT';

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: string | null;

  @Column({ name: 'position', type: 'text', nullable: true })
  position?: string | {};
}
