import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCarsTable1777065193275 implements MigrationInterface {
    private readonly tableName = 'cars';

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const hasTable = await queryRunner.hasTable(this.tableName);
            if (!hasTable) {
                await queryRunner.createTable(
                    new Table({
                        name: this.tableName,
                        columns: [
                            {
                                name: 'CarID',
                                type: 'int',
                                isPrimary: true,
                                isGenerated: true,
                                isNullable: false,
                                generationStrategy: 'increment',
                            },
                            {
                                name: 'CarGroupID',
                                type: 'int',
                                default: 0,
                            },
                            {
                                name: 'CarTypeID',
                                type: 'int',
                                default: 0,
                            },
                            {
                                name: 'CarName',
                                type: 'varchar',
                                length: '255',
                                isNullable: true,
                            },
                            {
                                name: 'CarIconID',
                                type: 'int',
                                default: 0,
                            },
                            {
                                name: 'CarColor',
                                type: 'int',
                                default: 0,
                            },
                            {
                                name: 'CarDescription',
                                type: 'varchar',
                                length: '255',
                                isNullable: true,
                            },
                            {
                                name: 'CarStatus',
                                type: 'int',
                                default: 0,
                            },
                            {
                                name: 'CarLastTime',
                                type: 'timestamp',
                                isNullable: true,
                            },
                            {
                                name: 'CarDataPhone',
                                type: 'varchar',
                                length: '25',
                                isNullable: true,
                            },
                            {
                                name: 'CarVoicePhone',
                                type: 'varchar',
                                length: '25',
                                isNullable: true,
                            },
                            {
                                name: 'CarScheduled',
                                type: 'enum',
                                enum: ['Y', 'N'],
                                default: "'N'",
                            },
                        ],
                    }),
                );
            }
        } catch (error) {
            
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
