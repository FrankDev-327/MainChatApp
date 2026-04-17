import { Controller, Get, Query } from '@nestjs/common';
import { NominativeService } from './nominative.service';
import { ReceiveLocationDto } from '../dto/nominative/receive.location.dto';

@Controller('nominative')
export class NominativeController {
  constructor(private nominativeService: NominativeService) {}

  @Get('/geolocaltion')
  async getNominativeData(
    @Query() queryString: ReceiveLocationDto,
  ): Promise<void> {
    await this.nominativeService.getNominativeData(queryString);
  }
}
