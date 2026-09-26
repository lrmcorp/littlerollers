import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { IdentityService } from './identity.service';
import { PUBLIC_ROUTE_KEY } from './route-access';

/**
 * Guard global (default-deny): tanpa penanda `@Public()`, setiap rute mensyaratkan sesi valid,
 * sehingga rute baru yang lupa memasang `@UseGuards(AuthGuard)` tidak pernah terbuka anonim.
 */
@Injectable()
export class AccessGuard implements CanActivate {
  private readonly auth: AuthGuard;

  constructor(
    private readonly reflector: Reflector,
    identities: IdentityService,
  ) {
    this.auth = new AuthGuard(identities);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return this.auth.canActivate(context);
  }
}
