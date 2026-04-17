import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('api_tokens')
export class ApiTokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    token: string;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @Column({ name: 'UserID', type: 'int' })
    userId: number;
}
