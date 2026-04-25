import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateChatDevicesRegistrationTable1777068645321 implements MigrationInterface {
    private readonly tableName = 'chask_device_registrations';

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
                                name: 'device_uuid',
                                type: 'varchar',
                                length: '64',
                                isNullable: false,
                            },
                            {
                                name: 'device_type',
                                type: 'enum',
                                enum: ['android', 'ios', 'web'],
                                isNullable: false,
                            },
                            {
                                name: 'device_name',
                                type: 'varchar',
                                length: '255',
                                isNullable: true,
                            },
                            {
                                name: 'app_version',
                                type: 'varchar',
                                length: '20',
                                isNullable: true,
                            },
                            {
                                name: 'os_version',
                                type: 'varchar',
                                length: '50',
                                isNullable: true,
                            },
                            {
                                name: 'activated_at',
                                type: 'timestamp',
                            },
                        ],
                    }),
                    true,
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
