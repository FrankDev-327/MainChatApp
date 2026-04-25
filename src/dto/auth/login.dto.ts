import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'artadmin' })
  @IsNotEmpty({ message: 'UserName cannot be empty' })
  @IsString({ message: 'UserName must be a string' })
  userName: string;

  @ApiProperty({ example: 'juricaperica' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'String is too short' })
  @MaxLength(12, { message: 'String is too long' })
  password?: string;

  @ApiProperty({ example: '' })
  checkTypeAuth?: string;
}
