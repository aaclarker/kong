import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';

describe('ServicesService', () => {
  let service: ServicesService;

  const qb = {
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getOne: jest.fn(),
  };
  const repo = {
    createQueryBuilder: jest.fn(() => qb),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: getRepositoryToken(Service), useValue: repo },
      ],
    }).compile();
    service = moduleRef.get(ServicesService);
  });

  describe('findAll', () => {
    it('returns data + pagination meta (happy path)', async () => {
      qb.getManyAndCount.mockResolvedValue([[{ id: 'a' }], 1]);
      const res = await service.findAll({});
      expect(res.data).toHaveLength(1);
      expect(res.meta).toEqual({ total: 1, page: 1, limit: 12, totalPages: 1 });
      // default limit is 12
      expect(qb.orderBy).toHaveBeenCalledWith('service.name', 'ASC');
    });

    it('applies q filter when provided', async () => {
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAll({ q: 'pay' });
      expect(qb.where).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        { q: '%pay%' },
      );
    });
  });

  describe('findOne', () => {
    it('returns the service when found', async () => {
      qb.getOne.mockResolvedValue({ id: 'a' });
      await expect(service.findOne('a')).resolves.toEqual({ id: 'a' });
    });

    it('throws 404 when missing', async () => {
      qb.getOne.mockResolvedValue(null);
      await expect(service.findOne('a')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('persists service with its initial version', async () => {
      repo.create.mockReturnValue({ name: 'n' });
      repo.save.mockResolvedValue({ id: 'new' });
      qb.getOne.mockResolvedValue({ id: 'new', versionCount: 1 });
      const res = await service.create({
        name: 'n',
        description: 'd',
        version: { version: '1.0.0', changelog: 'c' },
      });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          versions: [{ version: '1.0.0', changelog: 'c' }],
        }),
      );
      expect(res).toEqual({ id: 'new', versionCount: 1 });
    });
  });

  describe('update', () => {
    it('throws 404 when the service does not exist', async () => {
      repo.preload.mockResolvedValue(undefined);
      await expect(service.update('a', { name: 'x' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('throws 404 when nothing was deleted', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('a')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('resolves when a row was deleted', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove('a')).resolves.toBeUndefined();
    });
  });
});
