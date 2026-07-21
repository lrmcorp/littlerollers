import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { LedgerService } from './ledger.service';

@Controller()
@UseGuards(AuthGuard)
export class LedgerController {
  constructor(private readonly ledger: LedgerService) {}

  @Get('customer-packages')
  list(
    @Req() request: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.ledger.list(request.principal, branchId, cursor);
  }

  @Get('customer-packages/:id/ledger')
  detail(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.ledger.detail(request.principal, id, cursor);
  }
}
