import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
export type ManagedContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { PublicContentManagementService } from './public-content-management.service';
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
      contentKey: string;
      branchId?: string | null;
      kind: string;
      locale?: string;
      payload: unknown;
    },
  ) {
    return this.content.create(req.principal, body, req.correlationId ?? 'unknown');
  }
  @Post(':id/:status') transition(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('status') status: 'PUBLISHED' | 'ARCHIVED',
  ) {
    return this.content.transition(req.principal, id, status, req.correlationId ?? 'unknown');
  }
}
