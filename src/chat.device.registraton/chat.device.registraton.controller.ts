import { Controller, Post, Get, BadRequestException, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatDeviceRegistratonService } from './chat.device.registraton.service';
import { CheckRegisterDeviceDto } from 'src/dto/chat.device.registrations/check.device.driver.registration.dto';

//@ApiTags('chat.device.registraton')
@Controller('chat.device.registraton')
export class ChatDeviceRegistratonController {
    constructor(private readonly chatDeviceRegistratonService: ChatDeviceRegistratonService) { }

    @Post()
    async registerDevice(@Body() dto: any) {
        const existDevice = await this.chatDeviceRegistratonService.findByUserIdAndDeviceUuid(dto.userId, dto.deviceUuid);
        if (existDevice) {
            throw new BadRequestException('Device already registered');
        }

        return await this.chatDeviceRegistratonService.registerDevice(dto); // Cast to any for simplicity in this example
    }

    @Get()
    async getDeviceRegistration() {
        // Implementation for getting device registration details
    }

    @Get('auth/connect/:user_id/:device_uuid/:app_version')
    async validateDriverAccessDataRegistration(@Param() dto: CheckRegisterDeviceDto) {
        return await this.chatDeviceRegistratonService.validateDriverAccessDataRegistration(dto);
    }
}
