import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDbgroupTable1777675275542 implements MigrationInterface {
    private readonly tableName = "dbgroups";

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const tableExists = await queryRunner.hasTable(this.tableName);
            if (!tableExists) {
                await queryRunner.createTable(
                    new Table({
                        name: this.tableName,
                        columns: [
                            {
                                name: "id",
                                type: "int",
                                isPrimary: true,
                                isGenerated: true,
                                generationStrategy: "increment",
                            },
                            {
                                name: "group_name",
                                type: "varchar",
                                length: "20",
                                isNullable: true,
                            },
                            {
                                name: "parent_id",
                                type: "int",
                                default: 0,
                            },
                            {
                                name: "group_allow",
                                type: "boolean",
                                default: true,
                            },
                            {
                                name: "userId",
                                type: "int",
                                isNullable: true,
                                isUnique: true,
                            },
                        ],
                    }),
                    true,
                );
            }
        } catch (error) {
            console.error(error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const table = await queryRunner.getTable(this.tableName);
            const foreignKey = table?.foreignKeys.find(
                fk => fk.columnNames.includes("userId")
            );
            if (foreignKey) {
                await queryRunner.dropForeignKey(this.tableName, foreignKey);
            }
            await queryRunner.dropTable(this.tableName);
        } catch (error) {
            console.error(error);
        }
    }
}