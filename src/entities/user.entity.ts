import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  OneToOne
} from 'typeorm';
import { ChatTaskEntity } from './chatt.tasks.entity';
import { Helper } from '../utils/helper';
import { DbGroupEntity } from './db.groups.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()   // Decorator to mark this class as a GraphQL Object Type
@Entity({ name: 'users' })
export class UserEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Field(() => String)
  @Column({ length: 255 })
  username: string;

  @Field(() => String)
  @Column({ name: 'first_name' })
  firstName: string;

  @Field(() => String)
  @Column({ name: 'last_name' })
  lastName: string;

  @Field(() => String)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: "password", nullable: true, length: 255, type: 'varchar' })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await Helper.hashPassword(this.password);
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    if (this.password) {
      this.password = await await Helper.hashPassword(this.password);
    }
  }

  @Field(() => [ChatTaskEntity], { nullable: true })
  @OneToMany(() => ChatTaskEntity, (chatTask) => chatTask.user)
  tasks: ChatTaskEntity[];

  @OneToOne(() => DbGroupEntity, (dbGroup) => dbGroup.user)
  dbGroup: DbGroupEntity;
}