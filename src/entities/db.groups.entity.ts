import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'dbgroups' })
export class DbGroupEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
  })
  id: number;

  @Column({
    name: 'group_name',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  name: string | null;

  @Column({
    name: 'parent_id',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  parentId: number;

  @Column({
    name: 'group_allow',
    type: 'boolean',
    default: true,
  })
  dbType: boolean;

  @OneToOne(() => UserEntity, (user) => user.dbGroup)
  @JoinColumn({ name: 'userId' }) 
  user: UserEntity;
}
