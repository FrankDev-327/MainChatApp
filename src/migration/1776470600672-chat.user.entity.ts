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
                            unsigned: true,
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        {
                            name: 'UserRefID',
                            type: 'int',
                            unsigned: true,
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
                            unsigned: true,
                            default: 0,
                        },
                        {
                            name: 'UserDriverID',
                            type: 'int',
                            unsigned: true,
                            default: 0,
                        },
                        {
                            name: 'UserActive',
                            type: 'enum',
                            enum: ['Y', 'N'],
                            default: "Y",
                        },
                        {
                            name: 'IsAdmin',
                            type: 'enum',
                            enum: ['Y', 'N', 'A'],
                            default: "N",
                        },
                        {
                            name: 'UserViewDays',
                            type: 'int',
                            default: -1,
                        },
                        {
                            name: 'UserCanCall',
                            type: 'enum',
                            enum: ['Y', 'N'],
                            default: "N",
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
                            default: "N",
                        },
                        {
                            name: 'UserCanChat',
                            type: 'enum',
                            enum: ['Y', 'N'],
                            default: "N",
                        },
                        {
                            name: 'MTEventPriv',
                            type: 'int',
                            unsigned: true,
                            default: 0,
                        },
                        {
                            name: 'UserLastLogin',
                            type: 'datetime',
                            isNullable: true,
                        },
                        {
                            name: 'CargoPriv',
                            type: 'int',
                        },
                        {
                            name: 'CommandPriv',
                            type: 'int',
                        },
                        {
                            name: 'AlarmSetupPriv',
                            type: 'int',
                        },
                        {
                            name: 'UserRoleId',
                            type: 'int',
                            unsigned: true,
                            default: 0,
                        },
                    ],
                }));
            }
        } catch (error) {

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
