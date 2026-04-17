import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { LoggerPrint } from '../logger/logger.print';
import { ReceiveLocationDto } from '../dto/nominative/receive.location.dto';
import { ChatPrivateMessagesService } from '../chat-private-messages/chat-private-messages.service';
import { CreateMessageTaskDto } from '../dto/chat.private.message/create.private.message.dto';

@Injectable()
export class NominativeService {
  constructor(
    private loggerPrint: LoggerPrint,
    private readonly chatPrivateMessagesService: ChatPrivateMessagesService,
  ) {}

  async getNominativeData(
    receiveLocationDto: ReceiveLocationDto,
  ): Promise<void> {
    try {
      const location = await axios.get(
        `${process.env.NOMINATIM_URL}/reverse?format=json&lat=${receiveLocationDto.lat}&lon=${receiveLocationDto.lon}`,
      );
      const messageDto: CreateMessageTaskDto = {
        sender_id: receiveLocationDto.sender_id,
        receiver_id: receiveLocationDto.receiver_id,
        group_id: receiveLocationDto.group_id,
        taskId: receiveLocationDto.taskId,
        message_type: receiveLocationDto.message_type,
        message: '',
        is_urgent: 0,
        is_notification: 0,
        lat: receiveLocationDto.lat,
        lon: receiveLocationDto.lon,
        lonCoodinate: '',
        latCoodinate: '',
        file: '',
        position: location?.data ? JSON.stringify(await location.data) : '',
      };

      await this.chatPrivateMessagesService.createNewPrivateMessage(messageDto);
    } catch (error) {
      this.loggerPrint.error(error.message);
    }
  }
}
