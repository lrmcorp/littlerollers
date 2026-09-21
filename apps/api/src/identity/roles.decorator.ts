import { SetMetadata } from '@nestjs/common';
import type { ApplicationRole } from './role-capabilities';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ApplicationRole[]) => SetMetadata(ROLES_KEY, roles);
