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
import { LedgerService } from './ledger.service';

@Controller()
@UseGuards(AuthGuard)
export class LedgerController {
  constructor(private readonly ledger: LedgerService) {}

  @Get('customer-packages')
  listCustomerPackages(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customerUserId') customerUserId?: string,
  ) {
    return this.ledger.listCustomerPackages(req.principal, {
      branchId,
      cursor,
      search,
      status,
      customerUserId,
    });
  }

  @Get('customer-packages/:id/ledger')
  getPackageLedger(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.ledger.getPackageLedger(req.principal, id);
  }

  @Get('session-adjustments')
  listAdjustments(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
    @Query('q') q?: string,
  ) {
    return this.ledger.listAdjustments(req.principal, {
      branchId,
      status,
      cursor,
      q,
    });
  }

  @Get('session-adjustments/:id')
  getAdjustment(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.ledger.getAdjustment(id);
  }

  @Post('session-adjustments')
  requestAdjustment(
    @Req() req: AuthenticatedRequest,
    @Body() body: { customerPackageId: string; quantity: number; reasonCode: string },
  ) {
    return this.ledger.requestAdjustment(req.principal, body);
  }

  @Post('session-adjustments/:id/decide')
  decideAdjustment(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('decision') decision: 'approve' | 'reject',
    @Body() body: { reasonCode: string; note?: string; expectedVersion: number },
  ) {
    return this.ledger.decideAdjustment(req.principal, id, decision, body);
  }
}
