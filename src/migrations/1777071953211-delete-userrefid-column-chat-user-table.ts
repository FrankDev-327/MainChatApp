import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class DeleteUserrefidColumnChatUserTable1777071953211 implements MigrationInterface {
    private readonly columnName = 'UserRefID';
    private readonly tableName = 'chat_users';

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasColumn = await queryRunner.hasColumn(this.tableName, this.columnName);
            if (hasColumn) {
                await queryRunner.dropColumn(this.tableName, this.columnName);
            }
        } catch (error) {
            console.log(error.message);

        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasColumn = await queryRunner.hasColumn(this.tableName, this.columnName);
            if (!hasColumn) {
                await queryRunner.addColumn(this.tableName,
                    new TableColumn({
                        name: this.columnName,
                        type: 'int',
                        default: 0,
                    }));
            }
        } catch (error) {
            console.log(error.message);

        }
    }

}
