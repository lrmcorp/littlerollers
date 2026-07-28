import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('overview')
  overview(
    @Req() request: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
  ) {
    return this.dashboard.overview(request.principal, { branchId, from, until });
  }
}

@Controller('me')
@UseGuards(AuthGuard)
export class CustomerDashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('dashboard')
  overview(@Req() request: AuthenticatedRequest) {
    return this.dashboard.customerOverview(request.principal);
  }
}
