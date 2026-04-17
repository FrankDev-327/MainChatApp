import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateTokenDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  token: string;
}
