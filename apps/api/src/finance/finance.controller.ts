import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { FinanceService } from './finance.service';

@Controller('finance/reconciliation')
@UseGuards(AuthGuard)
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get('overview')
  overview(
    @Req() request: AuthenticatedRequest,
    @Query() query: { branchId?: string; from?: string; until?: string },
  ) {
    return this.finance.overview(request.principal, query);
  }

  @Get('anomalies')
  anomalies(
    @Req() request: AuthenticatedRequest,
    @Query()
    query: { branchId?: string; from?: string; until?: string; cursor?: string; limit?: string },
  ) {
    return this.finance.anomalies(request.principal, query);
  }
}
