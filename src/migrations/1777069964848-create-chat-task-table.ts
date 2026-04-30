import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateChatTaskTable1777069964848 implements MigrationInterface {
    private readonly tableName = 'chatTasks';

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasTable = await queryRunner.hasTable(this.tableName);
            if (!hasTable) {
                await queryRunner.createTable(
                    new Table({
                        name: this.tableName,
                        columns: [
                            {
                                name: 'taskId',
                                type: 'int',
                                isPrimary: true,
                                isGenerated: true,
                                generationStrategy: 'increment',
                            },

                            {
                                name: 'title',
                                type: 'varchar',
                                length: '255',
                                isNullable: true,
                            },

                            {
                                name: 'parentTaskId',
                                type: 'int',
                                isNullable: true,
                            },

                            {
                                name: 'creatorId',
                                type: 'int',
                                isNullable: true,
                            },

                            {
                                name: 'receiverId',
                                type: 'int',
                                isNullable: false,
                            },

                            {
                                name: 'carId',
                                type: 'int',
                                isNullable: true,
                            },

                            // booleans stored as int (as in your entity)
                            {
                                name: 'require_photo',
                                type: 'int',
                                default: 0,
                            },

                            {
                                name: 'require_location',
                                type: 'int',
                                default: 0,
                            },

                            {
                                name: 'is_root',
                                type: 'int',
                                default: 0,
                            },

                            {
                                name: 'location_lat',
                                type: 'varchar',
                                length: '255',
                                isNullable: true,
                            },

                            {
                                name: 'location_lng',
                                type: 'varchar',
                                length: '255',
                                isNullable: true,
                            },

                            {
                                name: 'description',
                                type: 'varchar',
                                length: '100',
                                isNullable: false,
                            },

                            // =========================
                            // ENUMS
                            // =========================
                            {
                                name: 'taskType',
                                type: 'enum',
                                enum: ['simple', 'multitask'],
                                enumName: 'chat_tasks_task_type_enum',
                                default: `'simple'`,
                            },

                            {
                                name: 'status',
                                type: 'enum',
                                enum: ['assigned', 'in_progress', 'completed', 'rejected', 'failed'],
                                enumName: 'chat_tasks_status_enum',
                                default: `'assigned'`,
                            },

                            {
                                name: 'deadlineType',
                                type: 'enum',
                                enum: ['ASAP', 'BY_DATETIME', 'BETWEEN', 'ANYTIME'],
                                enumName: 'chat_tasks_deadline_type_enum',
                                isNullable: true,
                            },

                            {
                                name: 'deadlineStart',
                                type: 'timestamp',
                                isNullable: true,
                            },

                            {
                                name: 'deadlineEnd',
                                type: 'timestamp',
                                isNullable: true,
                            },

                            {
                                name: 'location',
                                type: 'json',
                                isNullable: true,
                            },

                            {
                                name: 'requiredConfirmations',
                                type: 'text',
                                isNullable: true,
                            },

                            {
                                name: 'createdAt',
                                type: 'timestamp',
                                default: 'CURRENT_TIMESTAMP',
                            },

                            {
                                name: 'rejectedAt',
                                type: 'timestamp',
                                isNullable: true,
                            },

                            {
                                name: 'rejectedReason',
                                type: 'varchar',
                                length: '255',
                                isNullable: true,
                            },

                            {
                                name: 'archivedAt',
                                type: 'timestamp',
                                isNullable: true,
                            },
                        ],
                    }),
                    true,
                );

                // =========================
                // INDEXES
                // =========================
                await queryRunner.createIndex(
                    this.tableName,
                    new TableIndex({
                        name: 'IDX_chatTasks_receiverId',
                        columnNames: ['receiverId'],
                    }),
                );

                await queryRunner.createIndex(
                    this.tableName,
                    new TableIndex({
                        name: 'IDX_chatTasks_creatorId',
                        columnNames: ['creatorId'],
                    }),
                );

                await queryRunner.createIndex(
                    this.tableName,
                    new TableIndex({
                        name: 'IDX_chatTasks_carId',
                        columnNames: ['carId'],
                    }),
                );

                await queryRunner.createIndex(
                    this.tableName,
                    new TableIndex({
                        name: 'IDX_chatTasks_status',
                        columnNames: ['status'],
                    }),
                );

                await queryRunner.createIndex(
                    this.tableName,
                    new TableIndex({
                        name: 'IDX_chatTasks_createdAt',
                        columnNames: ['createdAt'],
                    }),
                );

                // =========================
                // FOREIGN KEY (UserEntity)
                // =========================
                await queryRunner.createForeignKey(
                    this.tableName,
                    new TableForeignKey({
                        columnNames: ['creatorId'],
                        referencedTableName: 'users',
                        referencedColumnNames: ['id'],
                        onDelete: 'SET NULL',
                    }),
                );
            }
        } catch (error) {
            console.error(error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.tableName);

        // drop FK first
        const fk = table?.foreignKeys.find(fk => fk.columnNames.includes('creatorId'));
        if (fk) {
            await queryRunner.dropForeignKey(this.tableName, fk);
        }

        await queryRunner.dropTable(this.tableName);

        // drop enums (Postgres requires manual cleanup)
        await queryRunner.query(`DROP TYPE IF EXISTS "chat_tasks_task_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "chat_tasks_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "chat_tasks_deadline_type_enum"`);
    }

}
