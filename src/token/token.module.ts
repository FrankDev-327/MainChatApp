import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { ApiTokenEntity } from '../entities/token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenController } from './token.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ApiTokenEntity])],
    providers: [TokenService],
    exports: [TokenService],
    controllers: [TokenController]
})
export class TokenModule { }
