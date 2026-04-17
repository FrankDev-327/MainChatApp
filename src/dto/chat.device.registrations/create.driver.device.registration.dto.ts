import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsUUID,
    Length,
    IsNumber,
} from 'class-validator';

export enum DeviceType {
    ANDROID = 'android',
    IOS = 'ios',
    WEB = 'web',
}

export class ChatRegisterDriverDeviceDto {
    @IsNotEmpty()
    @IsNumber()
    driver_id: number;

    @IsNotEmpty()
    @IsString()
    @Length(4, 10)
    pin: string;

    @IsNotEmpty()
    @IsUUID()
    device_uuid: string;

    @IsNotEmpty()
    @IsEnum(DeviceType)
    device_type: DeviceType;

    @IsOptional()
    @IsString()
    device_name?: string;

    @IsOptional()
    @IsString()
    app_version?: string;

    @IsOptional()
    @IsString()
    os_version?: string;
}
