import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { VersionsService } from './versions.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { FindVersionsQueryDto } from './dto/find-versions-query.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

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

  @Post()
  @Roles(Role.Admin)
  create(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Body() dto: CreateVersionDto,
  ) {
    return this.versionsService.create(serviceId, dto);
  }

  @Patch(':versionId')
  @Roles(Role.Admin)
  update(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @Body() dto: UpdateVersionDto,
  ) {
    return this.versionsService.update(serviceId, versionId, dto);
  }

  @Delete(':versionId')
  @Roles(Role.Admin)
  @HttpCode(204)
  remove(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
  ) {
    return this.versionsService.remove(serviceId, versionId);
  }
}
