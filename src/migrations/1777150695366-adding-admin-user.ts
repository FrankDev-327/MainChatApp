import 'dotenv/config';
import { MigrationInterface, QueryRunner } from "typeorm";
import { CreateChatUserDto } from "../dto/users/create.user.dto";
import { ChatUsersService } from "../chat_users/chat_users.service";
import { YesNo, YesNoAdmin } from '../entities/chat.users.entity';


export class AddingAdminUser1777150695366 implements MigrationInterface {
    constructor(private chatUsersService: ChatUsersService) { }

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const userDto: CreateChatUserDto = {
                UserName: process.env.TEST_ADMIN_USERNAME,
                UserPassword: process.env.TEST_ADMIN_PASSWORD,
                IsAdmin: YesNoAdmin.Y,
                UserActive: YesNo.Y,
                UserDisabled: false,
                UserGroupID: 1,
            };

            const existUser = await queryRunner.manager.findOne('chat_users', { where: { UserName: process.env.TEST_ADMIN_USERNAME } });
            if (existUser) {
                console.log('Admin user already exists, skipping creation.');
                return;
            }

            await queryRunner.manager.save(queryRunner.manager.create('chat_users', userDto));
            console.log('Admin user created successfully.');

        } catch (error) {
            console.log(error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const existUser = await queryRunner.manager.findOne('chat_users', { where: { UserName: process.env.TEST_ADMIN_USERNAME } });
            if (existUser) {
                await queryRunner.manager.delete('chat_users', { UserName: process.env.TEST_ADMIN_USERNAME });
                console.log('Deleted admin user');
                return;
            }
        } catch (error) {
            console.log(error);
        }
    }
}
