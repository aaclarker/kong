import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

describe('ServicesController', () => {
  const svc = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const controller = new ServicesController(svc as unknown as ServicesService);

  beforeEach(() => jest.clearAllMocks());

  it('findAll delegates with the query', () => {
    controller.findAll({ page: 1 } as any);
    expect(svc.findAll).toHaveBeenCalledWith({ page: 1 });
  });

  it('findOne delegates with the id', () => {
    controller.findOne('id');
    expect(svc.findOne).toHaveBeenCalledWith('id');
  });

  it('create delegates with the body', () => {
    const dto = { name: 'n' } as any;
    controller.create(dto);
    expect(svc.create).toHaveBeenCalledWith(dto);
  });

  it('update delegates with id + body', () => {
    controller.update('id', { name: 'x' } as any);
    expect(svc.update).toHaveBeenCalledWith('id', { name: 'x' });
  });

  it('remove delegates with the id', () => {
    controller.remove('id');
    expect(svc.remove).toHaveBeenCalledWith('id');
  });
});
