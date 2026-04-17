import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from 'typeorm';

export enum QrRole {
    DRIVER = 'DRIVER',
    SUPERVISOR = 'SUPERVISOR',
    MANAGER = 'MANAGER',
}

@Entity({ name: 'chask_qr_codes' })
export class ChaskQrCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @Column({
        type: 'enum',
        enum: QrRole,
    })
    role: QrRole;

    @Column({ type: 'varchar', length: 10 })
    pin: string;

    @Column({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @Column({ name: 'expires_at', type: 'datetime' })
    expiresAt: Date;

    @Column({ name: 'used_at', type: 'datetime', nullable: true })
    usedAt: Date | null;

    @Column({
        name: 'used_device_uuid',
        type: 'varchar',
        length: 64,
        nullable: true,
    })
    usedDeviceUuid: string | null;

    @Column({
        name: 'is_valid',
        type: 'boolean',
        default: true,
    })
    isValid: boolean;

    @Column({
        name: 'failed_attempts',
        type: 'int',
        default: 0,
    })
    failedAttempts: number;
}
