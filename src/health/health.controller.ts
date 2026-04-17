import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ description: 'The service is healthy' })
  healthCheck() {
    return { status: 'OK' };
  }
}
