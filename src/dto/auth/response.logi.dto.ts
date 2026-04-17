import { ApiProperty } from '@nestjs/swagger';

export class ResponseAuthLogin {
  @ApiProperty({
    example: 'hjydgscvhjbdvsvhjbdshvfgdshjbvhdfjbv',
  })
  readonly token: string;
}
