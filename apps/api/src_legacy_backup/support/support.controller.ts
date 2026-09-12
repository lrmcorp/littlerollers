import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { SupportCasePriority, SupportCaseStatus } from '@prisma/client';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { SupportService } from './support.service';
@Controller('support-cases')
@UseGuards(AuthGuard)
export class SupportController {
  constructor(private readonly support: SupportService) {}
  @Get() daftarKasus(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('status') status?: SupportCaseStatus,
    @Query('priority') priority?: SupportCasePriority,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.support.daftarKasus(req.principal, { branchId, status, priority, q, cursor });
  }
  @Get(':id') detailKasus(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.support.detailKasus(req.principal, id);
  }
  @Post() buatKasus(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      customerUserId: string;
      branchId?: string | null;
      subject: string;
      priority?: SupportCasePriority;
      tags?: string[];
    },
  ) {
    return this.support.buatKasus(req.principal, body, req.correlationId ?? 'unknown');
  }
  @Patch(':id') ubahKasus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body()
    body: {
      status: SupportCaseStatus;
      priority: SupportCasePriority;
      assignedUserId?: string | null;
      tags?: string[];
      expectedVersion: number;
    },
  ) {
    return this.support.ubahKasus(req.principal, id, body, req.correlationId ?? 'unknown');
  }
  @Post(':id/internal-notes') tambahCatatanInternal(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { body: string },
  ) {
    return this.support.tambahCatatanInternal(
      req.principal,
      id,
      body.body,
      req.correlationId ?? 'unknown',
    );
  }
}
