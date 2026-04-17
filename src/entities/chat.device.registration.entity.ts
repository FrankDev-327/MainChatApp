import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from 'typeorm';

export enum DeviceType {
    ANDROID = 'android',
    IOS = 'ios',
    WEB = 'web',
}

@Entity({ name: 'chask_device_registrations' })
export class ChaskDeviceRegistrationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @Column({ name: 'device_uuid', type: 'varchar', length: 64 })
    deviceUuid: string;

    @Column({
        name: 'device_type',
        type: 'enum',
        enum: DeviceType,
    })
    deviceType: DeviceType;

    @Column({
        name: 'device_name',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    deviceName: string | null;

    @Column({
        name: 'app_version',
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    appVersion: string | null;

    @Column({
        name: 'os_version',
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    osVersion: string | null;

    @Column({
        name: 'activated_at',
        type: 'datetime',
    })
    activatedAt: Date;

    @Column({
        name: 'last_connected_at',
        type: 'datetime',
        nullable: true,
    })
    lastConnectedAt: Date | null;

    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
    })
    isActive: boolean;

    @Column({
        name: 'revoked_at',
        type: 'datetime',
        nullable: true,
        default: null,
    })
    revokedAt: Date | null;

    @Column({
        name: 'revoked_reason',
        type: 'varchar',
        length: 255,
        nullable: true,
        default: null,
    })
    revokedReason: string | null;
}
