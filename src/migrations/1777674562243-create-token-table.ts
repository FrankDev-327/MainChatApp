import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTokenTable1777674562243 implements MigrationInterface {
    private readonly tableName = "api_tokens";
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
                                name: "token",
                                type: "text",
                                isNullable: false,
                            },
                            {
                                name: "created_at",
                                type: "timestamp",
                                default: "CURRENT_TIMESTAMP",
                                isNullable: false,
                            },
                            {
                                name: "UserID",
                                type: "int",
                                isNullable: false,
                            },
                        ],
                    })
                );
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.dropTable(this.tableName);
        } catch (error) {
            console.log(error);

        }
    }

}
