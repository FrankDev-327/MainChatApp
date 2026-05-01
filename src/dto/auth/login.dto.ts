import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'artadmin@test.com' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsString({ message: 'Email must be a string' })
  email: string;

  @ApiProperty({ example: 'juricaperica' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'String is too short' })
  @MaxLength(12, { message: 'String is too long' })
  password?: string;

  @ApiProperty({ example: '' })
  checkTypeAuth?: string;
}
