import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

const ctxWith = (headers: Record<string, string>) => {
  const req: any = { headers };
  return {
    ctx: {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext,
    req,
  };
};

describe('JwtAuthGuard', () => {
  const jwt = { verify: jest.fn() } as unknown as JwtService;
  const config = { get: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
  const guard = new JwtAuthGuard(jwt, config, reflector);

  beforeEach(() => jest.clearAllMocks());

  it('rejects a request with no Authorization header', () => {
    const { ctx } = ctxWith({});
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects a non-Bearer header', () => {
    const { ctx } = ctxWith({ authorization: 'Basic abc' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects an invalid token', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('bad');
    });
    const { ctx } = ctxWith({ authorization: 'Bearer bad' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('accepts a valid token and attaches the payload', () => {
    (jwt.verify as jest.Mock).mockReturnValue({ sub: 'u', role: 'admin' });
    const { ctx, req } = ctxWith({ authorization: 'Bearer good' });
    expect(guard.canActivate(ctx)).toBe(true);
    expect(req.user).toEqual({ sub: 'u', role: 'admin' });
  });

  it('allows a @Public route with no token', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValueOnce(true);
    const { ctx } = ctxWith({});
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
