import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { FindServicesQueryDto } from './dto/find-services-query.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@Query() query: FindServicesQueryDto) {
    return this.servicesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findOne(id);
  }
}
