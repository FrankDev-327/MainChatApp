import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateQrCodeTable1777069844652 implements MigrationInterface {
    private readonly tableName = 'chask_qr_codes';

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
                                name: 'role',
                                type: 'enum',
                                enum: ['DRIVER', 'SUPERVISOR', 'MANAGER'],
                                isNullable: false,
                            },
                            {
                                name: 'pin',
                                type: 'varchar',
                                length: '10',
                                isNullable: false,
                            },
                            {
                                name: 'created_at',
                                type: 'timestamp',
                            },
                            {
                                name: 'expires_at',
                                type: 'timestamp',
                            },
                            {
                                name: 'used_at',
                                type: 'timestamp',
                                isNullable: true,
                            },
                            {
                                name: 'used_device_uuid',
                                type: 'varchar',
                                length: '64',
                                isNullable: true,
                            },
                            {
                                name: 'is_valid',
                                type: 'boolean',
                                default: true,
                            },
                            {
                                name: 'failed_attempts',
                                type: 'int',
                                default: 0,
                            },
                        ],
                    }),
                );
            }
        } catch (error) {
            console.log(error.message);

        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasTable = await queryRunner.hasTable(this.tableName);
            if (hasTable) {
                await queryRunner.dropTable(this.tableName);
            }
        } catch (error) {
            console.log(error.message);

        }

    }

}
