import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateChatMessageTable1777575929382 implements MigrationInterface {
    private readonly tableName = 'chat_messages';

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const tableExists = await queryRunner.hasTable(this.tableName);
            if (!tableExists) {
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
                                name: 'sender_id',
                                type: 'int',
                                isNullable: false,
                            },
                            {
                                name: 'receiver_id',
                                type: 'int',
                                isNullable: true,
                            },
                            {
                                name: 'group_id',
                                type: 'int',
                                isNullable: true,
                            },
                            {
                                name: 'task_id',
                                type: 'int',
                                isNullable: true,
                            },
                            {
                                name: 'parentTaskId',
                                type: 'int',
                                isNullable: true,
                            },
                            {
                                name: 'content',
                                type: 'text',
                                isNullable: true,
                            },
                            {
                                name: 'file_url',
                                type: 'text',
                                isNullable: true,
                            },
                            {
                                name: 'message_type',
                                type: 'enum',
                                enum: ['TEXT', 'IMAGE', 'COORDINATES', 'TEMPLATE', 'DOCUMENT'],
                                enumName: 'chat_messages_message_type_enum',
                                isNullable: false,
                            },
                            {
                                name: 'created_at',
                                type: 'timestamp',
                                default: 'CURRENT_TIMESTAMP',
                            },
                            {
                                name: 'position',
                                type: 'jsonb',
                                isNullable: true,
                            },
                        ],
                    }),
                    true,
                );

                await queryRunner.createIndex(
                    this.tableName,
                    new TableIndex({
                        name: 'IDX_chat_messages_sender_id',
                        columnNames: ['sender_id'],
                    }),
                );

                await queryRunner.createIndex(
                    this.tableName,
                    new TableIndex({
                        name: 'IDX_chat_messages_receiver_id',
                        columnNames: ['receiver_id'],
                    }),
                );

                await queryRunner.createIndex(
                    this.tableName,
                    new TableIndex({
                        name: 'IDX_chat_messages_group_id',
                        columnNames: ['group_id'],
                    }),
                );

                await queryRunner.createIndex(
                    this.tableName,
                    new TableIndex({
                        name: 'IDX_chat_messages_created_at',
                        columnNames: ['created_at'],
                    }),
                );
            }
        } catch (error) {
            console.error(error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.dropIndex(this.tableName, 'IDX_chat_messages_sender_id');
            await queryRunner.dropIndex(this.tableName, 'IDX_chat_messages_receiver_id');
            await queryRunner.dropIndex(this.tableName, 'IDX_chat_messages_group_id');
            await queryRunner.dropIndex(this.tableName, 'IDX_chat_messages_created_at');
            await queryRunner.dropTable(this.tableName);
            await queryRunner.query(`DROP TYPE IF EXISTS "chat_messages_message_type_enum"`);
        } catch (error) {
            console.error(error);
        }
    }
}