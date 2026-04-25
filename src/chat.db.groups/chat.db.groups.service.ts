import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatDbGroupEntity } from '../entities/chat.db.groups.entity';
import { DbGroupEntity } from '../entities/db.groups.entity';
import { ChatDbGroupDto } from '../dto/chat.db.group/create.chat.db.group.dto';

@Injectable()
export class ChatDbGroupsService {
  constructor(
    @InjectRepository(ChatDbGroupEntity)
    private chatDbGroupRepository: Repository<ChatDbGroupEntity>,
    @InjectRepository(DbGroupEntity)
    private dbGroupRepository: Repository<DbGroupEntity>,
    private loggerPrint: LoggerPrint,
  ) { }

  async create(chatDbGroup: ChatDbGroupDto): Promise<ChatDbGroupEntity> {
    try {
      const newGroup = this.chatDbGroupRepository.create(chatDbGroup);
      return await this.chatDbGroupRepository.save(newGroup);
    } catch (error) {
      this.loggerPrint.error(`Error creating chat DB group: ${error}`);
      throw error;
    }
  }

  async findAll(): Promise<ChatDbGroupEntity[]> {
    try {
      return await this.chatDbGroupRepository.find();
    } catch (error) {
      this.loggerPrint.error(`Error fetching chat DB groups: ${error}`);
      throw error;
    }
  }

  async findById(id: number): Promise<ChatDbGroupEntity> {
    try {
      return await this.chatDbGroupRepository.findOneBy({ id });
    } catch (error) {
      this.loggerPrint.error(`Error fetching chat DB group by ID: ${error}`);
      throw error;
    }
  }
}
