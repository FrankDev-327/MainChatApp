import { Repository } from 'typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { EmiterSubscribersService } from '../emiter-subscribers/emiter-subscribers.service';
import { ChatMessageEntity } from '../entities/chatt.private.messages.entity';
import { MessageType } from '../dto/chat.private.message/create.private.message.dto';
import { CreateMessageTaskDto } from '../dto/chat.private.message/create.private.message.dto';
import {
  databaseResponseTimeHistogram,
  totalRequestConter,
} from '../prometheus-chatapp/prometheus-chatapp.exporters';

@Injectable()
export class ChatPrivateMessagesService {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private chatPrivateMessagesRepository: Repository<ChatMessageEntity>,
    private loggerPrint: LoggerPrint,
    private emiterSubscribersService: EmiterSubscribersService,
  ) {}

  async createNewPrivateMessage(dto: CreateMessageTaskDto): Promise<void> {
    const senderId = dto?.group_id ? 0 : dto.sender_id;
    const typeSendCoordinates = dto?.group_id ? 'GROUP' : 'PRIVATE';
    const chatUserIds = {
      senderId: dto.sender_id,
      receiverId: dto.receiver_id,
    };
    const messageContent =
      dto.message_type === MessageType.COORDINATES ||
      dto.message_type === MessageType.IMAGE ||
      dto.message_type === MessageType.DOCUMENT
        ? ''
        : dto.message;

    const timerDatabase = databaseResponseTimeHistogram.startTimer();
    const newMessage = this.chatPrivateMessagesRepository.create({
      senderId: dto?.group_id ? 0 : dto.sender_id,
      receiverId: dto?.group_id ? 0 : dto.receiver_id,
      groupId: dto.group_id ?? 0,
      taskId: dto?.group_id ? 0 : dto.taskId,
      content: messageContent,
      messageType: dto.message_type,
      isUrgent: dto.is_urgent,
      isNotification: dto.is_notification,
      position: dto.position ? dto.position : '{}',
      storedAt: new Date().toISOString(),
      fileUrl: dto?.file || '',
    });

    try {
      const messageSaved =
        await this.chatPrivateMessagesRepository.save(newMessage);
      timerDatabase({
        method: 'chat.message.created',
        route: messageContent,
        status: 200,
      });
      
      const dataToBeEmitted = {
        ...messageSaved,
        typeSendCoordinates,
        senderId,
        chatUserIds,
      };

      await this.emiterSubscribersService.emittingEventToBeSubscribed(
        'chat.message.created',
        dataToBeEmitted,
      );
    } catch (error) {
      totalRequestConter.inc({
        method: 'chat.message.created',
        route: messageContent,
        status: 500,
      });
      this.loggerPrint.error(`Error saving message: ${error.message}`);
    }
  }

  async deleteAllMessagesFromTest(): Promise<void> {
    try {
      await this.chatPrivateMessagesRepository.deleteAll();
    } catch (error) {
      this.loggerPrint.error(`Error saving message: ${error.message}`);
    }
  }
}
