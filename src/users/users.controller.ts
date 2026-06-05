import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserDto } from '../dto/users/create.user.dto';
import { UsersService } from './users.service';
import { UserEntity } from '../entities/user.entity';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    async createUser(@Body() userDto: UserDto): Promise<UserEntity> {
        return await this.usersService.createUser(userDto);
    }

    @Post('sync')
    async syncUsers() {
        await this.usersService.syncUsersToElastic();
        return { message: 'Sync triggered' };
    }

    @Get()
    async findAll(): Promise<UserEntity[]> {
        return await this.usersService.findAll();
    }
}
