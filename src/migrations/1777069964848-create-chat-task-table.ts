import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateChatTaskTable1777069964848 implements MigrationInterface {
    private readonly tableName = 'chask_chat_tasks';

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasTable = await queryRunner.hasTable(this.tableName);
            if (!hasTable) {
                await queryRunner.createTable(
                    new Table({
                        name: this.tableName,
                        columns: [
                            {
                                name: 'id',
                                type: 'int',
                                isPrimary: true,
                                isGenerated: true,
                                generationStrategy: 'increment',
                            },
                            {
                                name: 'user_id',
                                type: 'int',
                                isNullable: false,
                            },
                            {
                                name: 'task_type',
                                type: 'varchar',
                                length: '50',
                                isNullable: false,
                            },
                            {
                                name: 'payload',
                                type: 'json',
                                isNullable: false,
                            },
                            {
                                name: 'status',
                                type: 'enum',
                                enum: ['pending', 'in_progress', 'completed', 'failed'],
                                default: "'pending'",
                            },
                            {
                                name: 'created_at',
                                type: 'timestamp',
                            },
                            {
                                name: 'updated_at',
                                type: 'timestamp',
                            },
                        ],
                    }),
                );
            }
        } catch (error) {
            console.error(error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasTable = await queryRunner.hasTable(this.tableName);
            if (hasTable) {
                await queryRunner.dropTable(this.tableName);
            }
        } catch (error) {
            console.error(error);
        }
    }

}
