import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
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

  @Get('finance/owner-branch-performance')
  ownerBranchPerformance(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('period') period?: string,
  ) {
    return this.finance.ownerBranchPerformance(req.principal, { branchId, period });
  }

  // ============================================================================
  // 5 LAPORAN INTI KEUANGAN
  // ============================================================================

  @Get('finance/reports/omset')
  omsetReport(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('period') period?: string,
  ) {
    return this.finance.omsetReport(req.principal, { branchId, period });
  }

  @Get('finance/reports/instructor-cost-realtime')
  instructorCostRealtime(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('period') period?: string,
  ) {
    return this.finance.realtimeInstructorCostReport(req.principal, { branchId, period });
  }

  @Get('finance/reports/other-costs')
  otherCostReport(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('period') period?: string,
  ) {
    return this.finance.otherCostReport(req.principal, { branchId, period });
  }

  @Get('finance/reports/profit-summary')
  profitSummary(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('period') period?: string,
  ) {
    return this.finance.monthlyProfitReport(req.principal, { branchId, period });
  }

  // ============================================================================
  // OTHER COST (DENGAN LOCK GUARD)
  // ============================================================================

  @Post(['other-costs', 'finance/other-costs'])
  createOtherCost(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      branchId: string;
      period: string;
      category: string;
      description: string;
      amountRp: number;
    },
  ) {
    return this.finance.createOtherCost(req.principal, body);
  }

  @Patch(['other-costs/:id', 'finance/other-costs/:id'])
  updateOtherCost(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body()
    body: { category?: string; categoryCode?: string; description?: string; amountRp?: number },
  ) {
    return this.finance.updateOtherCost(req.principal, id, body);
  }

  @Delete(['other-costs/:id', 'finance/other-costs/:id'])
  deleteOtherCost(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ) {
    return this.finance.deleteOtherCost(req.principal, id, body?.reason);
  }

  @Get(['other-costs', 'finance/other-costs'])
  otherCosts(
    @Req() req: AuthenticatedRequest,
    @Query('period') period?: string,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.finance.otherCosts(req.principal, { period, branchId, cursor });
  }

  // ============================================================================
  // TUTUP BUKU BULANAN (MONTHLY CLOSE)
  // ============================================================================

  @Post(['monthly-closes', 'monthly-closes/execute', 'finance/monthly-closes/execute'])
  executeMonthlyClose(
    @Req() req: AuthenticatedRequest,
    @Body() body: { branchId: string; period: string; controlHash?: string; reason?: string },
  ) {
    return this.finance.executeMonthlyClose(req.principal, body);
  }

  @Get('periods')
  periods(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.finance.periods(req.principal, { branchId, cursor });
  }

  @Post('finance-exports')
  exportReport(
    @Req() req: AuthenticatedRequest,
    @Body() body: { branchId?: string; from?: string; until?: string },
  ) {
    return this.finance.exportReport(req.principal, body);
  }

  // ============================================================================
  // JURNAL KOREKSI PASCA-LOCK (RULE #8)
  // ============================================================================

  @Post(['correction-journals', 'finance/correction-journals'])
  createCorrection(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      branchId: string;
      currentPeriod?: string;
      referencePeriod?: string;
      period?: string;
      targetPeriod?: string;
      amountRp: number;
      reason: string;
    },
  ) {
    return this.finance.createCorrection(req.principal, body);
  }

  // Kontrak generated client (`decideCorrection`): POST /correction-journals/{id}/{approve|reject} + { reason }.
  @Post(['correction-journals/:id/:decision', 'finance/correction-journals/:id/:decision'])
  decideCorrection(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('decision') decision: string,
    @Body() body: { reason?: string },
  ) {
    return this.finance.decideCorrection(req.principal, id, decision, body);
  }

  @Get(['correction-journals', 'finance/correction-journals'])
  correctionJournals(
    @Req() req: AuthenticatedRequest,
    @Query('period') period?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
  ) {
    return this.finance.correctionJournals(req.principal, {
      period,
      branchId,
      status,
    });
  }

  // ============================================================================
  // LEGACY / RECONCILIATION ENDPOINTS
  // ============================================================================

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

  @Get(['finance/reconciliation/legacy-cashflow', 'finance/legacy-cashflow'])
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
}
