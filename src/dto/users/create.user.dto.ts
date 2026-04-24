import {
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    IsEnum,
    IsDate,
    IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { YesNo, YesNoAdmin } from '../../entities/chat.users.entity';

export class CreateChatUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    UserName?: string;

    @IsOptional()
    @IsBoolean()
    UserDisabled?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(127)
    UserPassword?: string;

    @IsOptional()
    @IsInt()
    UserGroupID?: number;

    @IsOptional()
    @IsInt()
    UserDriverID?: number;

    @IsOptional()
    @IsEnum(YesNo)
    UserActive?: YesNo;

    @IsOptional()
    @IsEnum(YesNoAdmin)
    IsAdmin?: YesNoAdmin;

    @IsOptional()
    @IsInt()
    UserViewDays?: number;

    @IsOptional()
    @IsEnum(YesNo)
    UserCanCall?: YesNo;

    @IsOptional()
    @IsEnum(YesNo)
    UserWatchAlarm?: YesNo;

    @IsOptional()
    @IsEnum(YesNo)
    UserSendSMS?: YesNo;

    @IsOptional()
    @IsEnum(YesNo)
    UserCanChat?: YesNo;

    @IsOptional()
    @IsInt()
    MTEventPriv?: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    UserLastLogin?: Date;

    @IsOptional()
    @IsInt()
    CargoPriv?: number;

    @IsOptional()
    @IsInt()
    CommandPriv?: number;

    @IsOptional()
    @IsInt()
    AlarmSetupPriv?: number;

    @IsOptional()
    @IsInt()
    UserRoleId?: number;
}