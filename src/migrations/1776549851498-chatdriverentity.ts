import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Chatdriverentity1776549851498 implements MigrationInterface {
    private readonly tableName = 'drivers';

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasTable = await queryRunner.hasTable(this.tableName);
            if (!hasTable) {
                await queryRunner.createTable(
                    new Table({
                        name: this.tableName,
                        columns: [
                            {
                                name: 'DriverID',
                                type: 'int',
                                isPrimary: true,
                                isGenerated: true,
                                isNullable: false,
                                generationStrategy: 'increment',
                            },
                            {
                                name: 'DriverName',
                                type: 'varchar',
                                length: '150',
                                isNullable: true,
                            },
                            {
                                name: 'DriverDesc',
                                type: 'varchar',
                                length: '250',
                                isNullable: true,
                            },
                            {
                                name: 'DriverImage',
                                type: 'varchar',
                                length: '255',
                                isNullable: true,
                            },
                            {
                                name: 'Button',
                                type: 'int',
                                default: 0,
                            },
                            {
                                name: 'AUXCode',
                                type: 'varchar',
                                length: '50',
                                isNullable: true,
                            },
                            {
                                name: 'DriverGroupID',
                                type: 'int',
                                default: 0,
                            },
                            {
                                name: 'DriverCompanyID',
                                type: 'int',
                                default: 0,
                            },
                            {
                                name: 'SMSNumber',
                                type: 'varchar',
                                length: '25',
                                default: null,
                                isNullable: true,
                            },
                            {
                                name: 'DriverEmail',
                                type: 'varchar',
                                length: '150',
                                default: null,
                                isNullable: true,
                            },
                            {
                                name: 'DriverChanged',
                                type: 'enum',
                                enum: ['Y', 'N'],
                                default: "'Y'",
                            },
                            {
                                name: 'DriverPIN',
                                type: 'varchar',
                                length: '25',
                                default: null,
                                isNullable: true,
                            },
                        ],
                    }),
                    true
                );
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasTable = await queryRunner.hasTable(this.tableName);
            if (hasTable) {
                await queryRunner.dropTable(this.tableName);
            }
        } catch (error) {
            console.log(error);
        }
    }

}
