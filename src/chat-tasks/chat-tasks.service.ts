import { Repository } from 'typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { CreateChatTaskDto } from '../dto/chat.tasks/create.task.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatTaskEntity } from '../entities/chatt.tasks.entity';

@Injectable()
export class ChatTasksService {
    constructor(
        @InjectRepository(ChatTaskEntity)
        private chatTasksRepository: Repository<ChatTaskEntity>,
        private readonly loggerPrint: LoggerPrint,
    ) {
        this.loggerPrint = new LoggerPrint(ChatTasksService.name)
    }

    async createNewTask(dtobody: CreateChatTaskDto): Promise<void> {
        try {
            const newTask = this.chatTasksRepository.create(dtobody);
            await this.chatTasksRepository.save(newTask);
        } catch (error) {
            this.loggerPrint.error((error as Error).message);
            throw new BadRequestException((error as Error).message);
        }
    }

    async findByUserId(userId: number): Promise<ChatTaskEntity[]> {
        try {
            return await this.chatTasksRepository.find({ where: { user: { id: Number(userId) } } });
        } catch (error) {
            this.loggerPrint.error((error as Error).message);
            throw new BadRequestException((error as Error).message);
        }
    }
}
