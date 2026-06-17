import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt } from 'class-validator';

export class CreateUserGroupRightDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  groupId: number;

  @ApiProperty()
  @IsBoolean()
  isGranted: boolean;
}
