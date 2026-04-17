import { IsInt, IsString, IsUUID, IsOptional } from 'class-validator';

export class CheckRegisterDeviceDto {
    @IsInt()
    user_id: number;

    @IsUUID()
    device_uuid: string;

    @IsOptional()
    @IsString()
    app_version?: string;
}
