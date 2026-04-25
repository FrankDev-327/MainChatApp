import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Helper } from '../utils/helper';

export enum YesNo {
  Y = 'Y',
  N = 'N',
}

export enum YesNoAdmin {
  Y = 'Y',
  N = 'N',
  A = 'A',
}

@Entity('chat_users')
export class ChatUser {
  @PrimaryGeneratedColumn({ name: 'UserID', type: 'int' })
  UserID: number;

  @Column({ name: 'UserDisabled', type: 'boolean', default: false })
  UserDisabled: boolean;

  @Column({ name: 'UserName', type: 'varchar', length: 255, nullable: true })
  UserName: string;

  @Column({ name: 'UserPassword', type: 'varchar', length: 127, nullable: true })
  UserPassword: string;

  @BeforeInsert()
  async hashPassword() {
    if (this.UserPassword) {
      this.UserPassword = await Helper.hashPassword(this.UserPassword);
    }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    if (this.UserPassword) {
      this.UserPassword = await Helper.hashPassword(this.UserPassword);
    }
  }

  @Column({ name: 'UserGroupID', type: 'int', default: 0 })
  UserGroupID: number;

  @Column({ name: 'UserDriverID', type: 'int', default: 0 })
  UserDriverID: number;

  @Column({
    name: 'UserActive',
    type: 'enum',
    enum: YesNo,
    default: YesNo.Y,
  })
  UserActive: YesNo;

  @Column({
    name: 'IsAdmin',
    type: 'enum',
    enum: YesNoAdmin,
    default: YesNoAdmin.N,
  })
  IsAdmin: YesNoAdmin;

  @Column({ name: 'UserViewDays', type: 'int', default: 0 })
  UserViewDays: number;

  @Column({
    name: 'UserCanCall',
    type: 'enum',
    enum: YesNo,
    default: YesNo.N,
  })
  UserCanCall: YesNo;

  @Column({
    name: 'UserWatchAlarm',
    type: 'enum',
    enum: YesNo,
    default: YesNo.N,
  })
  UserWatchAlarm: YesNo;

  @Column({
    name: 'UserSendSMS',
    type: 'enum',
    enum: YesNo,
    default: YesNo.N,
  })
  UserSendSMS: YesNo;

  @Column({
    name: 'UserCanChat',
    type: 'enum',
    enum: YesNo,
    default: YesNo.N,
  })
  UserCanChat: YesNo;

  @Column({ name: 'MTEventPriv', type: 'int', default: 0 })
  MTEventPriv: number;

  @Column({ name: 'UserLastLogin', type: 'timestamp', nullable: true })
  UserLastLogin: Date;

  @Column({ name: 'CargoPriv', type: 'int', default: 0 })
  CargoPriv: number;

  @Column({ name: 'CommandPriv', type: 'int', default: 0 })
  CommandPriv: number;

  @Column({ name: 'AlarmSetupPriv', type: 'int', default: 0 })
  AlarmSetupPriv: number;

  @Column({ name: 'UserRoleId', type: 'int', default: 0 })
  UserRoleId: number;
}