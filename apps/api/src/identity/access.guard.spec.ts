import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessGuard } from './access.guard';
import { AuthGuard } from './auth.guard';
import { Public } from './route-access';

class Sample {
  open() {}
  closed() {}
}
Public()(Sample.prototype, 'open', Object.getOwnPropertyDescriptor(Sample.prototype, 'open')!);

@Public()
class WholeClassPublic {
  anything() {}
}

const context = (
  target: object,
  handler: () => void,
  headers: Record<string, string> = {},
  principal?: unknown,
) => {
  const request = {
    path: '/x',
    principal,
    header: (name: string) => headers[name.toLowerCase()],
  };
  return {
    request,
    ctx: {
      getHandler: () => handler,
      getClass: () => target,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext,
  };
};

describe('AccessGuard (default-deny)', () => {
  const principal = { userId: 'u1', roles: [], capabilities: [], branchIds: [] };
  const authenticateBearer = jest.fn().mockResolvedValue(principal);
  const guard = new AccessGuard(new Reflector(), { authenticateBearer } as never);

  beforeEach(() => authenticateBearer.mockClear());

  it('lets @Public() handlers and classes through without touching the session', async () => {
    await expect(
      guard.canActivate(context(Sample, Sample.prototype.open).ctx),
    ).resolves.toBe(true);
    await expect(
      guard.canActivate(context(WholeClassPublic, WholeClassPublic.prototype.anything).ctx),
    ).resolves.toBe(true);
    expect(authenticateBearer).not.toHaveBeenCalled();
  });

  it('rejects an undeclared route with no session as 401', async () => {
    await expect(
      guard.canActivate(context(Sample, Sample.prototype.closed).ctx),
    ).rejects.toMatchObject({ code: 'AUTHENTICATION_REQUIRED' });
    expect(authenticateBearer).not.toHaveBeenCalled();
  });

  it('authenticates an undeclared route from the bearer token or session cookie', async () => {
    const bearer = context(Sample, Sample.prototype.closed, { authorization: 'Bearer abc123' });
    await expect(guard.canActivate(bearer.ctx)).resolves.toBe(true);
    expect(authenticateBearer).toHaveBeenCalledWith('abc123');
    expect((bearer.request as { principal?: unknown }).principal).toBe(principal);

    const cookie = context(Sample, Sample.prototype.closed, { cookie: 'a=b; dd_session=tok_9' });
    await expect(guard.canActivate(cookie.ctx)).resolves.toBe(true);
    expect(authenticateBearer).toHaveBeenLastCalledWith('tok_9');
  });

  it('does not authenticate twice when the controller also uses AuthGuard', async () => {
    const first = context(Sample, Sample.prototype.closed, { authorization: 'Bearer abc123' });
    await guard.canActivate(first.ctx);
    const controllerGuard = new AuthGuard({ authenticateBearer } as never);
    await expect(controllerGuard.canActivate(first.ctx)).resolves.toBe(true);
    expect(authenticateBearer).toHaveBeenCalledTimes(1);
  });
});
