import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt } from 'class-validator';
import { PermissionType } from '../../entities/chat.user.rights.entity';

export class CreateUserGroupRightDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  groupId: number;

  @ApiProperty({ example: PermissionType.ASSIGN_TASK, enum: PermissionType })
  @IsEnum(PermissionType)
  permissionType: PermissionType;

  @ApiProperty()
  @IsBoolean()
  isGranted: boolean;
}
