// device-token.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('chat_device_tokens')
export class ChatDeviceTokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column({ unique: true })
    token: string;

    @Column({ nullable: true })
    platform: string; // android | ios | web

    @CreateDateColumn()
    createdAt: Date;
}
