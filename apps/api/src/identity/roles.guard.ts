import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ApplicationRole } from './role-capabilities';
import { ROLES_KEY } from './roles.decorator';
import type { AuthenticatedRequest } from './auth.guard';
import { ApiProblem } from './security';

const ROLE_ALIASES: Record<string, string[]> = {
  SUPER_OWNER: ['SUPER_OWNER', 'SUPERADMIN'],
  SUPERADMIN: ['SUPER_OWNER', 'SUPERADMIN'],
  INSTRUCTOR: ['INSTRUCTOR', 'COACH'],
  COACH: ['INSTRUCTOR', 'COACH'],
  CUSTOMER: ['CUSTOMER', 'MEMBER'],
  MEMBER: ['CUSTOMER', 'MEMBER'],
  OWNER: ['OWNER'],
  MANAGER: ['MANAGER'],
  FINANCE: ['FINANCE'],
  ADMIN: ['ADMIN'],
  OPS: ['OPS'],
};

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

    const hasRole = requiredRoles.some((required) => {
      const aliases = ROLE_ALIASES[required] ?? [required];
      return userRoles.some((userRole) => aliases.includes(userRole));
    });

    if (!hasRole) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
