import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';

export interface FindServicesParams {
  q?: string;
  sort?: 'name' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  // Pagination
  page?: number;
  limit?: number;
}

// Whitelist and map allowed sort keys to entity properties
const SORTABLE: Record<NonNullable<FindServicesParams['sort']>, string> = {
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly repo: Repository<Service>,
  ) {}

  async findAll(params: FindServicesParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 12;
    const sortColumn = SORTABLE[params.sort ?? 'name'];
    const order = (params.order ?? 'asc').toUpperCase() as 'ASC' | 'DESC';

    const qb = this.repo
      .createQueryBuilder('service')
      .loadRelationCountAndMap('service.versionCount', 'service.versions');

    if (params.q) {
      // Is OR performant?
      // Substring ILIKE cannot use a B-tree index, so this
      // is a sequential scan; the OR adds a second comparison not scan.
      // Fine at our scale. If it grows, add pg_trgm GIN indexes on
      // name/description to make %q% index-usable (bitmap-OR of two GIN scans).
      qb.where(
        'service.name ILIKE :q OR service.description ILIKE :q',
        { q: `%${params.q}%` },
      );
    }

    qb.orderBy(`service.${sortColumn}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

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

  async findOne(id: string) {
    const service = await this.repo
      .createQueryBuilder('service')
      .loadRelationCountAndMap('service.versionCount', 'service.versions')
      .where('service.id = :id', { id })
      .getOne();

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    return service;
  }
}
