import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { ElascitServiceModule } from '../elascit-service/elascit-service.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), ElascitServiceModule],
  exports: [UsersService],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
