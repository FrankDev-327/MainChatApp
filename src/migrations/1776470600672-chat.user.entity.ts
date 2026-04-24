import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ChatUserEntity1776470600672 implements MigrationInterface {
    private readonly tableName = 'chat_users';
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const exists = await queryRunner.hasTable(this.tableName);
            if (!exists) {
                await queryRunner.createTable(new Table({
                    name: this.tableName,
                    columns: [
                        {
                            name: 'UserID',
                            type: 'int',

                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        {
                            name: 'UserRefID',
                            type: 'int',

                            default: 0,
                        },
                        {
                            name: 'UserName',
                            type: 'varchar',
                            length: '255',
                            isNullable: true,
                        },
                        {
                            name: 'UserPassword',
                            type: 'varchar',
                            length: '127',
                            isNullable: true,
                        },
                        {
                            name: 'UserGroupID',
                            type: 'int',

                            default: 0,
                        },
                        {
                            name: 'UserDriverID',
                            type: 'int',

                            default: 0,
                        },
                        {
                            name: 'UserActive',
                            type: 'enum',
                            enum: ['Y', 'N'],
                            default: "'Y'",
                        },
                        {
                            name: 'IsAdmin',
                            type: 'enum',
                            enum: ['Y', 'N', 'A'],
                            default: "'N'",
                        },
                        {
                            name: 'UserViewDays',
                            type: 'int',
                            default: 0,
                        },
                        {
                            name: 'UserCanCall',
                            type: 'enum',
                            enum: ['Y', 'N'],
                            default: "'N'",
                        },
                        {
                            name: 'UserWatchAlarm',
                            type: 'enum',
                            enum: ['Y', 'N'],
                            default: "'N'",
                        },
                        {
                            name: 'UserSendSMS',
                            type: 'enum',
                            enum: ['Y', 'N'],
                            default: "'N'",
                        },
                        {
                            name: 'UserCanChat',
                            type: 'enum',
                            enum: ['Y', 'N'],
                            default: "'N'",
                        },
                        {
                            name: 'MTEventPriv',
                            type: 'int',

                            default: 0,
                        },
                        {
                            name: 'UserLastLogin',
                            type: 'timestamp',
                            isNullable: true,
                        },
                        {
                            name: 'CargoPriv',
                            type: 'int',
                            default: 0,
                        },
                        {
                            name: 'CommandPriv',
                            type: 'int',
                            default: 0,
                        },
                        {
                            name: 'AlarmSetupPriv',
                            type: 'int',
                            default: 0,
                        },
                        {
                            name: 'UserRoleId',
                            type: 'int',

                            default: 0,
                        },
                    ],
                }));
            }
        } catch (error) {
            console.log(error);

        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const tableExists = await queryRunner.hasTable(this.tableName);
            if (tableExists) {
                await queryRunner.dropTable(this.tableName);
            }
        } catch (error) {

        }

    }

}