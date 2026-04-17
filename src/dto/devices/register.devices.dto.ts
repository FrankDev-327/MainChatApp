import { IsString, IsNumber, IsOptional } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  token: string;

  @IsNumber()
  userId: number;

  @IsString()
  @IsOptional()
  platform: string;
}
