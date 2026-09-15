import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { FinanceService } from './finance.service';

@Controller()
@UseGuards(AuthGuard)
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get('finance/reconciliation/overview')
  overview(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
  ) {
    return this.finance.overview(req.principal, { branchId, from, until });
  }

  @Get('finance/reconciliation/anomalies')
  anomalies(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.finance.anomalies(req.principal, {
      branchId,
      from,
      until,
      limit: limit ? Number(limit) : undefined,
      cursor,
    });
  }

  @Get('finance/reconciliation/legacy-cashflow')
  legacyCashflow(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.finance.legacyCashflow(req.principal, {
      branchId,
      from,
      until,
      limit: limit ? Number(limit) : undefined,
      cursor,
    });
  }

  @Get('correction-journals')
  correctionJournals(
    @Req() req: AuthenticatedRequest,
    @Query('period') period?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.finance.correctionJournals(req.principal, {
      period,
      branchId,
      status,
      q,
      cursor,
    });
  }

  @Get('reports/:reportType')
  reports(
    @Req() req: AuthenticatedRequest,
    @Param('reportType') reportType: string,
    @Query('period') period?: string,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.finance.reports(req.principal, reportType, { period, branchId, cursor });
  }

  @Get('periods')
  periods(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.finance.periods(req.principal, { branchId, cursor });
  }

  @Post('monthly-closes')
  closeMonth(
    @Req() req: AuthenticatedRequest,
    @Body() body: { branchId: string; period: string; controlHash: string; reason: string },
  ) {
    return this.finance.closeMonth(req.principal, body);
  }

  @Get('other-costs')
  otherCosts(
    @Req() req: AuthenticatedRequest,
    @Query('period') period?: string,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.finance.otherCosts(req.principal, { period, branchId, cursor });
  }
}
