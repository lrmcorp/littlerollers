import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { RetentionService } from './retention.service';

@Controller()
@UseGuards(AuthGuard)
export class RetentionController {
  constructor(private readonly retention: RetentionService) {}

  /** Kohort paket yang habis pada satu rentang tanggal, lengkap dengan status renewal per member. */
  @Get('retention/expiry-cohort')
  expiryCohort(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
    @Query('period') period?: string,
  ) {
    return this.retention.expiryCohort(req.principal, { branchId, from, until, period });
  }

  /** Tren renewal beberapa bulan terakhir (bawaan tiga bulan termasuk bulan berjalan). */
  @Get('retention/trend')
  trend(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('months') months?: string,
  ) {
    const parsed = months ? Number.parseInt(months, 10) : undefined;
    return this.retention.retentionTrend(req.principal, {
      branchId,
      months: Number.isFinite(parsed) ? parsed : undefined,
    });
  }
}
