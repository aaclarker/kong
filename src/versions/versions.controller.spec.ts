import { VersionsController } from './versions.controller';
import { VersionsService } from './versions.service';

describe('VersionsController', () => {
  const svc = {
    findByService: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const controller = new VersionsController(svc as unknown as VersionsService);

  beforeEach(() => jest.clearAllMocks());

  it('findByService delegates with serviceId + query', () => {
    controller.findByService('s', { page: 1 } as any);
    expect(svc.findByService).toHaveBeenCalledWith('s', { page: 1 });
  });

  it('create delegates with serviceId + body', () => {
    const dto = { version: '1.0.0', changelog: 'c' } as any;
    controller.create('s', dto);
    expect(svc.create).toHaveBeenCalledWith('s', dto);
  });

  it('update delegates with serviceId + versionId + body', () => {
    controller.update('s', 'v', { changelog: 'x' } as any);
    expect(svc.update).toHaveBeenCalledWith('s', 'v', { changelog: 'x' });
  });

  it('remove delegates with serviceId + versionId', () => {
    controller.remove('s', 'v');
    expect(svc.remove).toHaveBeenCalledWith('s', 'v');
  });
});
