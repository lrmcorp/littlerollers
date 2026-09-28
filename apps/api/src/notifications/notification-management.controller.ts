import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { NotificationManagementService } from './notification-management.service';

export type ManagedContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

@Controller('notification-management')
@UseGuards(AuthGuard)
export class NotificationManagementController {
  constructor(private readonly management: NotificationManagementService) {}
  @Get() overview(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: ManagedContentStatus,
  ) {
    return this.management.overview(req.principal, status);
  }
  @Post('templates/preview') preview(
    @Req() req: AuthenticatedRequest,
    @Body() body: { templateKey?: string; body?: unknown },
  ) {
    return this.management.preview(req.principal, body);
  }
  @Post('templates') create(
    @Req() req: AuthenticatedRequest,
    @Body() body: { templateKey?: string; body?: unknown },
  ) {
    return this.management.create(req.principal, body, req.correlationId ?? 'unknown');
  }
  @Patch('templates/:id') updateDraft(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { body?: unknown },
  ) {
    return this.management.updateDraft(req.principal, id, body, req.correlationId ?? 'unknown');
  }
  @Post('templates/:id/duplicate') duplicate(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.management.duplicate(req.principal, id, req.correlationId ?? 'unknown');
  }
  @Post('templates/:id/:status') transition(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('status') status: 'PUBLISHED' | 'ARCHIVED',
  ) {
    return this.management.transition(req.principal, id, status, req.correlationId ?? 'unknown');
  }
}
