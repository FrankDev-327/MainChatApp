import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CheckRegisterDeviceDto } from '../dto/chat.device.registrations/check.device.driver.registration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatDriversService } from '../chat-drivers/chat-drivers.service';
import { ChaskDeviceRegistrationEntity } from '../entities/chat.device.registration.entity';
import { ChatRegisterDriverDeviceDto } from '../dto/chat.device.registrations/create.driver.device.registration.dto';
import { LoggerPrint } from '../logger/logger.print';


@Injectable()
export class ChatDeviceRegistratonService {
    constructor(
        @InjectRepository(ChaskDeviceRegistrationEntity)
        private deviceRegistrationRepository: Repository<ChaskDeviceRegistrationEntity>,
        private readonly chatDriversService: ChatDriversService,
        private readonly jwtService: JwtService,
        private readonly loggerPrint: LoggerPrint,
    ) { }

    async registerDevice(dto: ChatRegisterDriverDeviceDto): Promise<ChaskDeviceRegistrationEntity> {
        try {
            const deviceData = {
                userId: dto.driver_id,
                deviceUuid: dto.device_uuid,
                deviceType: dto.device_type,
                deviceName: dto.device_name,
                appVersion: dto.app_version,
                osVersion: dto.os_version,
                activatedAt: new Date(),
                isActive: true,
                lastConnectedAt: new Date(),
                revokedAt: null,
                revokedReason: null,

            };

            const newDeviceRegistration = this.deviceRegistrationRepository.create(deviceData);
            return this.deviceRegistrationRepository.save(newDeviceRegistration);
        } catch (error) {
            this.loggerPrint.error(error);
            throw new NotFoundException(error);
        }
    }

    async findByUserIdAndDeviceUuid(userId: number, deviceUuid: string): Promise<ChaskDeviceRegistrationEntity | null> {
        try {
            return this.deviceRegistrationRepository.findOne({
                where: {
                    userId,
                    deviceUuid,
                },
            });
        } catch (error) {
            this.loggerPrint.error(error);
            throw new NotFoundException(error);
        }
    }

    async validateDriverAccessDataRegistration(dto: CheckRegisterDeviceDto): Promise<ChaskDeviceRegistrationEntity | any> {
        try {
            const driver = await this.chatDriversService.findDriverDetailsByDriverId(dto.user_id);
            if (!driver) {
                throw new NotFoundException('Driver not found');
            }

            const driverRegistered = await this.deviceRegistrationRepository.findOne({
                where: {
                    userId: dto.user_id,
                    deviceUuid: dto.device_uuid,
                    appVersion: dto.app_version,
                },
            });

            if (!driverRegistered) {
                throw new NotFoundException('Ovaj uređaj nije registriran. Skenirajte QR kod za aktivaciju');
            }

            const driverToken = await this.jwtService.sign({
                userId: driver.driverId,
                userName: driver.driverName,
                userGroupId: driver.driverGroupId,
                pin: driver.pin,
            });

            const splitDriverName = driver.driverName.split(' ');
            const data = {
                userId: driver.driverId,
                firstName: splitDriverName[0],
                lastName: splitDriverName[1],
                userGroupId: driver.driverGroupId,
                pin: driver.pin,
                role: "DRIVER", //TODO: has to be defined a role table but it has to be discussed first
                session_token: driverToken
            };

            return data
        } catch (error) {
            this.loggerPrint.error(error);
            throw new NotFoundException(error);
        }
    }
}   
