import axios from 'axios';
import { ChatDeviceTokenEntity } from '../entities/chat.device.token.entity';
import { Controller, Post, Body } from '@nestjs/common';
import { RegisterDeviceDto } from '../dto/devices/register.devices.dto';

@Controller('chat-device')
export class ChatDeviceController {
  constructor() {}

  @Post('/register')
  async registerDevice(
    @Body() body: RegisterDeviceDto,
  ): Promise<ChatDeviceTokenEntity> {
    const ms_device_info = await axios.post(
      `${process.env.MS_NOTIFICATION_SERVICE_URL}/chat-devices/register`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return ms_device_info.data;
  }
}
