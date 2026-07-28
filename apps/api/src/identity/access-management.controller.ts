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

  @Post('access/roles')
  @HttpCode(HttpStatus.OK)
  createRole(
    @Req() request: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body()
    body: {
      code: string;
      displayName: string;
      description: string;
      scope: 'GLOBAL' | 'BRANCH';
      capabilityKeys: string[];
      reasonCode: string;
      note?: string;
    },
  ) {
    return this.access.createRole(request.principal, body, key, request.correlationId ?? 'unknown');
  }

  @Get('access/roles/:id')
  getRole(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.access.getRole(request.principal, id);
  }

  @Patch('access/roles/:id')
  updateRole(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') key: string,
    @Body()
    body: {
      displayName: string;
      description: string;
      expectedVersion: number;
      reasonCode: string;
      note?: string;
    },
  ) {
    return this.access.updateRole(
      request.principal,
      id,
      body,
      key,
      request.correlationId ?? 'unknown',
    );
  }

  @Put('access/roles/:id/capabilities')
  replaceRoleCapabilities(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') key: string,
    @Body()
    body: {
      capabilityKeys: string[];
      expectedVersion: number;
      reasonCode: string;
      note?: string;
    },
  ) {
    return this.access.replaceRoleCapabilities(
      request.principal,
      id,
      body,
      key,
      request.correlationId ?? 'unknown',
    );
  }

  @Post('access/roles/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivateRole(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') key: string,
    @Body() body: { expectedVersion: number; reasonCode: string; note?: string },
  ) {
    return this.access.deactivateRole(
      request.principal,
      id,
      body,
      key,
      request.correlationId ?? 'unknown',
    );
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

  @Post('users/:id/permission-overrides')
  @HttpCode(HttpStatus.OK)
  createOverride(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') key: string,
    @Body()
    body: {
      capabilityKey: string;
      branchId?: string | null;
      effect: 'GRANT' | 'DENY';
      reasonCode: string;
      note?: string;
    },
  ) {
    return this.access.createOverride(
      request.principal,
      id,
      body,
      key,
      request.correlationId ?? 'unknown',
    );
  }

  @Post('users/:id/permission-overrides/:overrideId/revoke')
  @HttpCode(HttpStatus.OK)
  revokeOverride(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('overrideId') overrideId: string,
    @Headers('idempotency-key') key: string,
    @Body() body: { expectedVersion: number; reasonCode: string; note?: string },
  ) {
    return this.access.revokeOverride(
      request.principal,
      id,
      overrideId,
      body,
      key,
      request.correlationId ?? 'unknown',
    );
  }
}
