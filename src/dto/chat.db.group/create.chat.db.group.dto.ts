import { IsInt, IsOptional, IsString, IsEnum, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DBTypeEnum, YesNoEnum } from '../../dto/db.group/db.group.enum.dto';

export class ChatDbGroupDto {
  @IsInt()
  @Type(() => Number)
  id: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  dbGroupId: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name: string | null;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  parentId?: number;

  @IsEnum(DBTypeEnum)
  dbType: DBTypeEnum;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  path?: string | null;

  @IsEnum(YesNoEnum)
  in: YesNoEnum;

  @IsEnum(YesNoEnum)
  out: YesNoEnum;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  color: number;
}