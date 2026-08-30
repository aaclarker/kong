import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Version } from './entities/version.entity';
import { Service } from '../services/entities/service.entity';

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
    // 404 when the parent service does not exist (distinct from a service
    // that simply has no versions — which cannot happen given the invariant).
    const serviceExists = await this.services.count({
      where: { id: serviceId },
    });
    if (!serviceExists) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

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
}
