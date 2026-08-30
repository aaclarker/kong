import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { VersionsService } from './versions.service';
import { Version } from './entities/version.entity';
import { Service } from '../services/entities/service.entity';

const uniqueViolation = () =>
  new QueryFailedError('', [], { code: '23505' } as any);

describe('VersionsService', () => {
  let service: VersionsService;

  // Manager used inside remove()'s transaction.
  const tx = { findOne: jest.fn(), count: jest.fn(), remove: jest.fn() };
  const versions = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    manager: { transaction: jest.fn((cb: any) => cb(tx)) },
  };
  const services = { count: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    versions.manager.transaction.mockImplementation((cb: any) => cb(tx));
    const moduleRef = await Test.createTestingModule({
      providers: [
        VersionsService,
        { provide: getRepositoryToken(Version), useValue: versions },
        { provide: getRepositoryToken(Service), useValue: services },
      ],
    }).compile();
    service = moduleRef.get(VersionsService);
  });

  describe('findByService', () => {
    it('returns data + meta when the service exists (happy path)', async () => {
      services.count.mockResolvedValue(1);
      versions.findAndCount.mockResolvedValue([[{ id: 'v' }], 1]);
      const res = await service.findByService('s', {});
      expect(res.data).toHaveLength(1);
      expect(res.meta.total).toBe(1);
    });

    it('throws 404 when the service is missing', async () => {
      services.count.mockResolvedValue(0);
      await expect(service.findByService('s', {})).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('throws 404 when the service is missing', async () => {
      services.count.mockResolvedValue(0);
      await expect(
        service.create('s', { version: '1.0.0', changelog: 'c' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws 409 on a duplicate version', async () => {
      services.count.mockResolvedValue(1);
      versions.create.mockReturnValue({});
      versions.save.mockRejectedValue(uniqueViolation());
      await expect(
        service.create('s', { version: '1.0.0', changelog: 'c' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    it('throws 400 on an empty body', async () => {
      await expect(service.update('s', 'v', {})).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('throws 404 when the version is missing', async () => {
      versions.findOne.mockResolvedValue(null);
      await expect(
        service.update('s', 'v', { changelog: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws 404 when the service is missing', async () => {
      tx.findOne.mockResolvedValueOnce(null); // service lookup
      await expect(service.remove('s', 'v')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws 404 when the version is missing', async () => {
      tx.findOne
        .mockResolvedValueOnce({ id: 's' }) // service
        .mockResolvedValueOnce(null); // version
      await expect(service.remove('s', 'v')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws 409 when removing the last version', async () => {
      tx.findOne
        .mockResolvedValueOnce({ id: 's' })
        .mockResolvedValueOnce({ id: 'v' });
      tx.count.mockResolvedValue(1);
      await expect(service.remove('s', 'v')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('removes when other versions remain', async () => {
      tx.findOne
        .mockResolvedValueOnce({ id: 's' })
        .mockResolvedValueOnce({ id: 'v' });
      tx.count.mockResolvedValue(2);
      tx.remove.mockResolvedValue(undefined);
      await service.remove('s', 'v');
      expect(tx.remove).toHaveBeenCalled();
    });
  });
});
