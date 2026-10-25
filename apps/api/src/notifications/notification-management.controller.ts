import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { NotificationManagementService } from './notification-management.service';

@Controller('notification-management')
@UseGuards(AuthGuard)
export class NotificationManagementController {
  constructor(private readonly management: NotificationManagementService) {}

  @Get() overview(@Req() req: AuthenticatedRequest) {
    return this.management.overview(req.principal);
  }

  @Post('templates/preview') preview(
    @Req() req: AuthenticatedRequest,
    @Body() body: { templateKey?: string; body?: unknown },
  ) {
    return this.management.preview(req.principal, body);
  }

  /** Simpan dan langsung pakai teks template. */
  @Put('templates/:templateKey') save(
    @Req() req: AuthenticatedRequest,
    @Param('templateKey') templateKey: string,
    @Body() body: { body?: unknown },
  ) {
    return this.management.save(req.principal, templateKey, body, req.correlationId ?? 'unknown');
  }

  /** Kembalikan template ke teks bawaan. */
  @Post('templates/:templateKey/reset') reset(
    @Req() req: AuthenticatedRequest,
    @Param('templateKey') templateKey: string,
    @Body() reasonBody?: { reason?: string },
  ) {
    return this.management.reset(req.principal, templateKey, req.correlationId ?? 'unknown', reasonBody?.reason);
  }
}
