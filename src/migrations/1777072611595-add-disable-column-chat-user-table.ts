import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDisableColumnChatUserTable1777072611595 implements MigrationInterface {
    private readonly columnName = 'UserDisabled';
    private readonly tableName = 'chat_users';

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasColumn = await queryRunner.hasColumn(this.tableName, this.columnName);
            if (!hasColumn) {
                await queryRunner.addColumn(this.tableName, new TableColumn({
                    name: this.columnName,
                    type: 'boolean',
                    default: false
                }));
            }
        } catch (error) {
            console.error(`Error adding column to chat_users table: ${error}`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasColumn = await queryRunner.hasColumn(this.tableName, this.columnName);
            if (hasColumn) {
                await queryRunner.dropColumn(this.tableName, this.columnName);
            }
        } catch (error) {
            console.error(`Error dropping column from chat_users table: ${error}`);
        }
    }

}
