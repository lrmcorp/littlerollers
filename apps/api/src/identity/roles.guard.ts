import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ApplicationRole } from './role-capabilities';
import { ROLES_KEY } from './roles.decorator';
import type { AuthenticatedRequest } from './auth.guard';
import { ApiProblem } from './security';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ApplicationRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const principal = request.principal;

    if (!principal || !principal.roles || principal.roles.length === 0) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const userRoles = principal.roles.map((r) => r.role);

    const hasRole = requiredRoles.some((required) => userRoles.includes(required));

    if (!hasRole) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
