import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from './role.enum';

const ctxWith = (user: unknown): ExecutionContext =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const guard = new RolesGuard(reflector);

  beforeEach(() => jest.clearAllMocks());

  it('allows any authenticated caller when no roles are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(ctxWith({ role: 'user' }))).toBe(true);
  });

  it('allows a caller whose role matches', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.Admin]);
    expect(guard.canActivate(ctxWith({ role: 'admin' }))).toBe(true);
  });

  it('forbids a caller whose role does not match', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.Admin]);
    expect(() => guard.canActivate(ctxWith({ role: 'user' }))).toThrow(
      ForbiddenException,
    );
  });
});
