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

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

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

  @OneToMany(() => ChatTaskEntity, (chatTask) => chatTask.user)
  tasks: ChatTaskEntity[];

  @OneToOne(() => DbGroupEntity, (dbGroup) => dbGroup.user)
  dbGroup: DbGroupEntity;
}