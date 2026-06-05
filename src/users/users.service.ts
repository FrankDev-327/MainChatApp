import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from '../dto/users/create.user.dto';
import { LoggerPrint } from '../logger/logger.print';
import { ElascitServiceService } from '../elascit-service/elascit-service.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private elascitService: ElascitServiceService,
    private logger: LoggerPrint
  ) { }

  async createUser(userDto: UserDto): Promise<UserEntity> {
    try {
      const userCreated = this.userRepository.create(userDto);
      const userSaved = await this.userRepository.save(userCreated);
      await this.elascitService.indexUser('users', userSaved);
      return userSaved;
    } catch (error) {
      this.logger.error(`Error creating user: ${(error as Error).message}`);
      throw error;
    }
  }

  async syncUsersToElastic(): Promise<void> {
    try {
      const users = await this.findAll();
      this.logger.log(`Syncing ${users.length} users to Elasticsearch...`);
      await this.elascitService.ensureIndex('users');

      for (const user of users) {
        await this.elascitService.indexUser('users', user);
      }

      this.logger.log('Sync complete.');
    } catch (error) {
      this.logger.error(`Error syncing users: ${(error as Error).message}`);
      throw error;
    }
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      return this.userRepository.find();
    } catch (error) {
      this.logger.error(`Error finding all users: ${(error as Error).message}`);
      throw error;
    }
  }
}
