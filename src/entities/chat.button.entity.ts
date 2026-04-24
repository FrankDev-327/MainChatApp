import { Entity, Column, Index, PrimaryColumn } from 'typeorm';

export enum YesNoEnum {
  Y = 'Y',
  N = 'N',
}

@Entity({ name: 'chat_button' })
@Index('More', ['carId', 'buttonTime'])
@Index('Button', ['button'])
@Index('ButtonLogin', ['buttonLogin'])
export class ChatButtonEntity {
  @PrimaryColumn({
    name: 'CarID',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  carId: number;

  @PrimaryColumn({
    name: 'ButtonTime',
    type: 'timestamp',
  })
  buttonTime: Date;

  @Column({
    name: 'Button',
    type: 'bigint',
    unsigned: true,
    default: 0,
  })
  button: string;

  @Column({
    name: 'ButtonLogin',
    type: 'enum',
    enum: YesNoEnum,
    default: YesNoEnum.N,
  })
  buttonLogin: YesNoEnum;

  @Column({
    name: 'RDSerial',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  rdSerial: string | null;

  @Column({
    name: 'UserID',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  userId: number;

  @Column({
    name: 'SystemTime',
    type: 'timestamp',
    nullable: true,
  })
  systemTime: Date | null;
}
