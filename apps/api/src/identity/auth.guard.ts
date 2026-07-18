import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { IdentityService, type SessionPrincipal } from './identity.service';
import { ApiProblem } from './security';
import { HttpStatus } from '@nestjs/common';

export type AuthenticatedRequest = Request & {
  principal: SessionPrincipal;
  correlationId?: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly identities: IdentityService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.header('authorization') ?? '';
    const match = /^Bearer ([A-Za-z0-9_-]+)$/.exec(authorization);
    if (!match) throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
    request.principal = await this.identities.authenticateBearer(match[1]!);
    return true;
  }
}
