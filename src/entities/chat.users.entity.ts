import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type YesNo = 'Y' | 'N';
export type YesNoAdmin = 'Y' | 'N' | 'A';

@Entity('chat_users')
export class ChatUser {
  @PrimaryGeneratedColumn({ name: 'UserID', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'UserRefID', type: 'int', unsigned: true, default: 0 })
  userRefId: number;

  @Column({ name: 'UserName', type: 'varchar', length: 255, nullable: true })
  userName: string;

  @Column({
    name: 'UserPassword',
    type: 'varchar',
    length: 127,
    nullable: true,
    select: false,
  })
  userPassword: string;

  @Column({ name: 'UserGroupID', type: 'int', unsigned: true, default: 0 })
  userGroupId: number;

  @Column({ name: 'UserDriverID', type: 'int', unsigned: true, default: 0 })
  userDriverId: number;

  @Column({ name: 'UserActive', type: 'enum', enum: ['Y', 'N'], default: 'Y' })
  userActive: string;

  @Column({
    name: 'IsAdmin',
    type: 'enum',
    enum: ['Y', 'N', 'A'],
    default: 'N',
  })
  isAdmin: string;

  @Column({ name: 'UserViewDays', type: 'int', default: -1 })
  userViewDays: number;

  @Column({ name: 'UserCanCall', type: 'enum', enum: ['Y', 'N'], default: 'N' })
  userCanCall: string;

  @Column({
    name: 'UserWatchAlarm',
    type: 'enum',
    enum: ['Y', 'N'],
    default: 'N',
  })
  userWatchAlarm: string;

  @Column({ name: 'UserSendSMS', type: 'enum', enum: ['Y', 'N'], default: 'N' })
  userSendSMS: string;

  @Column({ name: 'UserCanChat', type: 'enum', enum: ['Y', 'N'], default: 'N' })
  userCanChat: string;

  @Column({ name: 'MTEventPriv', type: 'int', unsigned: true, default: 0 })
  mtEventPriv: number;

  @Column({ name: 'UserLastLogin', type: 'timestamp', nullable: true })
  userLastLogin: Date | null;

  @Column({ name: 'CargoPriv', type: 'int', unsigned: true, default: 0 })
  cargoPriv: number;

  @Column({ name: 'CommandPriv', type: 'int', unsigned: true, default: 0 })
  commandPriv: number;

  @Column({ name: 'AlarmSetupPriv', type: 'int', unsigned: true, default: 0 })
  alarmSetupPriv: number;

  @Column({ name: 'UserRoleId', type: 'int', unsigned: true, default: 0 })
  userRoleId: number;
}
