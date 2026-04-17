import { Response } from 'express';
import * as client from 'prom-client';
import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusChatappService } from './prometheus-chatapp.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('PrometheusChatapp')
@Controller('metrics')
export class PrometheusChatappController {
    constructor(private prometheusChatappService: PrometheusChatappService) { }

    @ApiOperation({ summary: '**NOTE** Do not use this endpoint it has different purpose to be used' })
    @Get('/')
    async getMetrics(@Res() res: Response) {
        const metrics = await this.prometheusChatappService.getMetrics();
        res.setHeader('Content-Type', client.register.contentType);
        res.send(metrics);
    }
}
