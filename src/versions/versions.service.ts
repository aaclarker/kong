import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Version } from './entities/version.entity';
import { Service } from '../services/entities/service.entity';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';

// Postgres unique_violation
const PG_UNIQUE_VIOLATION = '23505';

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof QueryFailedError &&
    (err.driverError as { code?: string })?.code === PG_UNIQUE_VIOLATION
  );
}

export interface FindVersionsParams {
  page?: number;
  limit?: number;
}

@Injectable()
export class VersionsService {
  constructor(
    @InjectRepository(Version)
    private readonly versions: Repository<Version>,
    @InjectRepository(Service)
    private readonly services: Repository<Service>,
  ) {}

  async findByService(serviceId: string, params: FindVersionsParams) {
    await this.assertServiceExists(serviceId);

    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const [data, total] = await this.versions.findAndCount({
      where: { serviceId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(serviceId: string, dto: CreateVersionDto) {
    await this.assertServiceExists(serviceId);
    const version = this.versions.create({ ...dto, serviceId });
    try {
      return await this.versions.save(version);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException(
          `Version "${dto.version}" already exists for this service`,
        );
      }
      throw err;
    }
  }

  async update(serviceId: string, versionId: string, dto: UpdateVersionDto) {
    const version = await this.versions.findOne({
      where: { id: versionId, serviceId },
    });
    if (!version) {
      throw new NotFoundException(`Version ${versionId} not found`);
    }
    Object.assign(version, dto);
    try {
      return await this.versions.save(version);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException(
          `Version "${dto.version}" already exists for this service`,
        );
      }
      throw err;
    }
  }

  async remove(serviceId: string, versionId: string) {
    const version = await this.versions.findOne({
      where: { id: versionId, serviceId },
    });
    if (!version) {
      throw new NotFoundException(`Version ${versionId} not found`);
    }
    // Keep at least one version per service.
    const count = await this.versions.count({ where: { serviceId } });
    if (count <= 1) {
      throw new ConflictException(
        'Cannot delete the last version of a service',
      );
    }
    await this.versions.remove(version);
  }

  private async assertServiceExists(serviceId: string) {
    const exists = await this.services.count({ where: { id: serviceId } });
    if (!exists) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }
  }
}
