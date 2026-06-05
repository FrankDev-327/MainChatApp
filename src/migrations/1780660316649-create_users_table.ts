import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1780660316649 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const exists = await queryRunner.hasTable('users');
            if (exists) return;

            await queryRunner.createTable(
                new Table({
                    name: 'users',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        {
                            name: 'username',
                            type: 'varchar',
                            isUnique: true,
                            isNullable: false,
                        },
                        {
                            name: 'password',
                            type: 'varchar',
                            isNullable: false,
                        },
                        {
                            name: 'email',
                            type: 'varchar',
                            isUnique: true,
                            isNullable: false,
                        },
                        {
                            name: 'first_name',
                            type: 'varchar',
                            isNullable: false,
                        },
                        {
                            name: 'last_name',
                            type: 'varchar',
                            isNullable: false,
                        },
                        {
                            name: 'created_at',
                            type: 'timestamp',
                            default: 'CURRENT_TIMESTAMP',
                        },
                        {
                            name: 'updated_at',
                            type: 'timestamp',
                            default: 'CURRENT_TIMESTAMP',
                        },
                    ],
                }),
                true,
            );
        } catch (error) {
            console.error('error creating users table', error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const exists = await queryRunner.hasTable('users');
            if (!exists) return;
            await queryRunner.dropTable('users');
        } catch (error) {
            console.error('error dropping users table', error);
        }
    }
}