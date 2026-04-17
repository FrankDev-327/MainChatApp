import { TokenService } from './token.service'
import { K6testingGuard } from '../k6testing/k6testing.guard';
import { Controller, Delete, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';


@ApiTags('Token')
@Controller('token')
export class TokenController {
    constructor(private readonly tokenService: TokenService) { }

    @ApiOperation({ summary: '**NOTE** Do not use this endpoint it has different purpose to be used' })
    @UseGuards(K6testingGuard)
    @Delete()
    async deleteAllTokensFromTest(): Promise<void> {
        await this.tokenService.deleteAllTokensFromTest();
    }
}
