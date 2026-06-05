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
  ) { }

  async getNominativeData(
    receiveLocationDto: ReceiveLocationDto,
  ): Promise<void> {
    try {
      const url = `${process.env.NOMINATIM_URL}/reverse?format=json&lat=${receiveLocationDto.lat}&lon=${receiveLocationDto.lon}`
      const location = await axios.get(url);
      const messageDto: CreateMessageTaskDto = {
        message: '',
        lat: receiveLocationDto.lat,
        lon: receiveLocationDto.lon,
        taskId: receiveLocationDto.taskId,
        group_id: receiveLocationDto.group_id,
        sender_id: receiveLocationDto.sender_id,
        receiver_id: receiveLocationDto.receiver_id,
        message_type: receiveLocationDto.message_type,
        position: location?.data ? JSON.stringify(await location.data) : '',
      };

      await this.chatPrivateMessagesService.createNewPrivateMessage(messageDto);
    } catch (error) {
      this.loggerPrint.error(error, 'NominativeService', 'getNominativeData');
    }
  }
}
