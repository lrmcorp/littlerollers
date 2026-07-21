import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
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

  @Get('session-adjustments')
  listAdjustments(
    @Req() request: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('status') status?: 'PENDING' | 'POSTED' | 'REJECTED',
    @Query('cursor') cursor?: string,
  ) {
    return this.ledger.listAdjustments(request.principal, branchId, status, cursor);
  }

  @Post('session-adjustments')
  async requestAdjustment(
    @Req() request: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body() body: { customerPackageId: string; quantity: number; reasonCode: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.ledger.requestAdjustment(
      request.principal,
      body,
      key,
      request.correlationId ?? 'unknown',
    );
    response.status(result.status);
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return { ...(result.body as object), idempotentReplay: result.replay };
  }

  @Post('session-adjustments/:id/:decision')
  async decideAdjustment(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('decision') decision: 'approve' | 'reject',
    @Headers('idempotency-key') key: string,
    @Body() body: { reasonCode: string; expectedVersion: number },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.ledger.decideAdjustment(
      request.principal,
      id,
      decision,
      body,
      key,
      request.correlationId ?? 'unknown',
    );
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return { ...(result.body as object), idempotentReplay: result.replay };
  }
}
