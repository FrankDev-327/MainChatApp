import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTokenDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  group: string | null;

  @IsNumber()
  @IsNotEmpty()
  groupId: number | 0;

  @IsBoolean()
  @IsNotEmpty()
  dbType: boolean | false
}
