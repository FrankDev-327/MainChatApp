import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { ChatButtonEntity } from '../entities/chat.button.entity';
import { ButtonEntity } from '../entities/button.entity';

@Injectable()
export class ChatButtonService {
  constructor(
    @InjectRepository(ChatButtonEntity)
    private chatButtonRepository: Repository<ChatButtonEntity>,
    @InjectRepository(ButtonEntity)
    private buttonRepository: Repository<ButtonEntity>,
    private readonly loggerPrint: LoggerPrint,
  ) {}
}
