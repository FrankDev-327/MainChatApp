import { Repository } from 'typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { CreateTokenDto } from '../dto/token/create.token.dto';
import { ApiTokenEntity } from '../entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(ApiTokenEntity)
        private readonly tokenRepository: Repository<ApiTokenEntity>,
        private readonly loggerPrint: LoggerPrint
    ) {
        this.loggerPrint = new LoggerPrint(TokenService.name);
    }

    async createToken(dto: CreateTokenDto): Promise<void> {
        try {
            await this.tokenRepository.save({
                userId: dto.userId,
                token: dto.token,
            });
        } catch (error) {
            this.loggerPrint.error(error.message);
            throw new BadRequestException(error.message);
        }
    }

    async getTokenByUserId(token: string): Promise<ApiTokenEntity | null> {
        try {
            return await this.tokenRepository.findOne({ where: { token } });
        } catch (error) {
            this.loggerPrint.error(error.message);
            throw new BadRequestException(error.message);
        }
    }

    async deleteAllTokensFromTest(): Promise<void> {
        try {
            await this.tokenRepository.deleteAll();
        } catch (error) {
            this.loggerPrint.error(error.message);
            throw new BadRequestException(error.message);
        }
    }
}
