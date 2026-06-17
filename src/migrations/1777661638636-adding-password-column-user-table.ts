import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddingPasswordColumnUserTable1777661638636 implements MigrationInterface {
    private readonly tableName = 'users';
    private readonly columnName = 'password';
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const exists = await queryRunner.hasColumn(this.tableName, this.columnName);
            if (!exists) {
                await queryRunner.addColumn(this.tableName, new TableColumn({
                    name: this.columnName,
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                }));
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const exists = await queryRunner.hasColumn(this.tableName, this.columnName);
            if (exists) {
                await queryRunner.dropColumn(this.tableName, this.columnName);
            }
        } catch (error) {
            console.log(error);
        }
    }
}
