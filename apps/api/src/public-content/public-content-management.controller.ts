import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import {
  PublicContentManagementService,
  type ManagedContentStatus,
} from './public-content-management.service';

export type { ManagedContentStatus };

@Controller('public-content-management')
@UseGuards(AuthGuard)
export class PublicContentManagementController {
  constructor(private readonly content: PublicContentManagementService) {}
  @Get() list(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('kind') kind?: string,
    @Query('status') status?: ManagedContentStatus,
  ) {
    return this.content.list(req.principal, { branchId, kind, status });
  }
  @Post() create(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      contentKey?: string;
      branchId?: string | null;
      kind: string;
      locale?: string;
      payload: unknown;
    },
  ) {
    return this.content.create(req.principal, body, req.correlationId ?? 'unknown');
  }
  @Patch(':id') updateDraft(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { payload: unknown },
  ) {
    return this.content.updateDraft(req.principal, id, body, req.correlationId ?? 'unknown');
  }
  @Post(':id/duplicate') duplicate(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.content.duplicate(req.principal, id, req.correlationId ?? 'unknown');
  }
  @Post(':id/:status') transition(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('status') status: 'PUBLISHED' | 'ARCHIVED',
  ) {
    return this.content.transition(req.principal, id, status, req.correlationId ?? 'unknown');
  }
}
