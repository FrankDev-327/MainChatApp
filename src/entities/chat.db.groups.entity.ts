import { DBTypeEnum, YesNoEnum } from '../dto/db.group/db.group.enum.dto';
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'chat_db_groups' })
@Index('ParentID', ['parentId'])
@Index('More', ['dbGroupId', 'dbType'])
export class ChatDbGroupEntity {
  @PrimaryGeneratedColumn({
    name: 'ChatDBGroupID',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'DBGroupID',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  dbGroupId: number;

  @Column({
    name: 'DBGroupName',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'ParentID',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  parentId: number;

  @Column({
    name: 'DBType',
    type: 'enum',
    enum: DBTypeEnum,
    default: DBTypeEnum.C,
  })
  dbType: DBTypeEnum;

  @Column({
    name: 'DBGroupPath',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  path: string | null;

  @Column({
    name: 'DBGroupIn',
    type: 'enum',
    enum: YesNoEnum,
    default: YesNoEnum.N,
  })
  in: YesNoEnum;

  @Column({
    name: 'DBGroupOut',
    type: 'enum',
    enum: YesNoEnum,
    default: YesNoEnum.N,
  })
  out: YesNoEnum;

  @Column({
    name: 'DBGroupColor',
    type: 'int',
    unsigned: true,
    default: 16777215,
  })
  color: number;
}
