import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateChatDebGroupsTable1777068237686 implements MigrationInterface {
    private readonly tableName = 'chat_db_groups';

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasTable = await queryRunner.hasTable(this.tableName);
            if (!hasTable) {
                await queryRunner.createTable(new Table({
                    name: this.tableName,
                    columns: [
                        {
                            name: 'ChatDBGroupID',
                            type: 'int',
                            unsigned: true,
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        {
                            name: 'DBGroupID',
                            type: 'int',
                            unsigned: true,
                            default: 0,
                        },
                        {
                            name: 'DBGroupName',
                            type: 'varchar',
                            length: '255',
                            isNullable: true,
                        },
                        {
                            name: 'ParentID',
                            type: 'int',
                            unsigned: true,
                            default: 0,
                        },
                        {
                            name: 'DBType',
                            type: 'enum',
                            enumName: 'DBTypeEnum',
                            enum: ['C', 'D'],
                            default: "'C'",
                        },
                        {
                            name: 'DBGroupPath',
                            type: 'varchar',
                            length: '150',
                            isNullable: true,
                        },
                        {
                            name: 'DBGroupIn',
                            type: 'enum',
                            enumName: 'YesNoEnum',
                            enum: ['Y', 'N'],
                            default: "'N'",
                        },
                    ],
                    indices: [
                        {
                            name: 'ParentID',
                            columnNames: ['ParentID'],
                        },
                        {
                            name: 'More',
                            columnNames: ['DBGroupID', 'DBType'],
                        },
                    ],
                }), true);
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasTable = await queryRunner.hasTable(this.tableName);
            if (hasTable) {
                await Promise.all([
                    queryRunner.dropIndex(this.tableName, 'ParentID'),
                    queryRunner.dropIndex(this.tableName, 'More'),
                    queryRunner.dropTable(this.tableName),
                ]);
            }
        } catch (error) {
            console.log(error.message);
        }
    }

}
