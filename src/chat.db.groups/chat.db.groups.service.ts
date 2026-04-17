import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatDbGroupEntity } from '../entities/chat.db.groups.entity';
import { DbGroupEntity } from '../entities/db.groups.entity';

@Injectable()
export class ChatDbGroupsService {
  constructor(
    @InjectRepository(ChatDbGroupEntity)
    private chatDbGroupRepository: Repository<ChatDbGroupEntity>,
    @InjectRepository(DbGroupEntity)
    private dbGroupRepository: Repository<DbGroupEntity>,
    private loggerPrint: LoggerPrint,
  ) {}
}
