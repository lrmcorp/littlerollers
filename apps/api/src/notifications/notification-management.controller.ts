import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { ManagedContentStatus, NotificationChannel } from '@prisma/client';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { NotificationManagementService } from './notification-management.service';

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
  @Post('templates') create(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      templateKey: string;
      channel: NotificationChannel;
      eventType: string;
      audience: unknown;
      subject?: string;
      title: string;
      body: string;
    },
  ) {
    return this.management.create(req.principal, body, req.correlationId ?? 'unknown');
  }
  @Post('templates/:id/:status') transition(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('status') status: 'PUBLISHED' | 'ARCHIVED',
  ) {
    return this.management.transition(req.principal, id, status, req.correlationId ?? 'unknown');
  }
}
