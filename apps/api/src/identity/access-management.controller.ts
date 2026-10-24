import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessManagementService } from './access-management.service';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard';

@UseGuards(AuthGuard)
@Controller()
export class AccessManagementController {
  constructor(private readonly access: AccessManagementService) {}

  @Get('access/capabilities')
  listCapabilities(
    @Req() request: AuthenticatedRequest,
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('sensitive') sensitive?: string,
    @Query('active') active?: string,
  ) {
    return this.access.listCapabilities(request.principal, {
      q,
      category,
      sensitive: sensitive === undefined ? undefined : sensitive === 'true',
      active: active === undefined ? undefined : active === 'true',
    });
  }

  @Get('access/roles')
  listRoles(
    @Req() request: AuthenticatedRequest,
    @Query('q') q?: string,
    @Query('scope') scope?: 'GLOBAL' | 'BRANCH',
    @Query('active') active?: string,
  ) {
    return this.access.listRoles(request.principal, {
      q,
      scope,
      active: active === undefined ? undefined : active === 'true',
    });
  }

  @Get('access/roles/:id')
  getRole(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.access.getRole(request.principal, id);
  }

  @Get('users/:id/access')
  getUserAccess(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.access.getUserAccess(request.principal, id);
  }

  @Put('users/:id/access/roles')
  replaceUserRoles(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') key: string,
    @Body()
    body: {
      roles: Array<{ roleId: string; branchId?: string | null }>;
      expectedVersion: number;
      reasonCode: string;
      note?: string;
    },
  ) {
    return this.access.replaceUserRoles(
      request.principal,
      id,
      body,
      key,
      request.correlationId ?? 'unknown',
    );
  }
}
