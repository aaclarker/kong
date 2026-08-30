import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { VersionsService } from './versions.service';
import { FindVersionsQueryDto } from './dto/find-versions-query.dto';

@Controller('services/:serviceId/versions')
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get()
  findByService(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Query() query: FindVersionsQueryDto,
  ) {
    return this.versionsService.findByService(serviceId, query);
  }
}
