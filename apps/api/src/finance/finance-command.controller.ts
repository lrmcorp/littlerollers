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
import { FinanceCommandService } from './finance-command.service';

@Controller()
@UseGuards(AuthGuard)
export class FinanceCommandController {
  constructor(private readonly finance: FinanceCommandService) {}

  @Get('reports/:reportType')
  report(
    @Req() req: AuthenticatedRequest,
    @Param('reportType') reportType: string,
    @Query('branchId') branchId: string,
    @Query('period') period: string,
  ) {
    return this.finance.report(req.principal, reportType, branchId, period);
  }

  @Get('other-costs')
  listCosts(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId: string,
    @Query('period') period: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.finance.listOtherCosts(req.principal, { branchId, period, cursor });
  }

  @Post('other-costs')
  createCost(
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body()
    body: {
      branchId: string;
      period: string;
      description: string;
      amountRp: number;
      evidenceUploadId?: string;
    },
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.respond(
      response,
      this.finance.createOtherCost(req.principal, body, key, req.correlationId ?? 'unknown'),
    );
  }

  @Get('periods')
  periods(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.finance.listPeriods(req.principal, branchId, cursor);
  }

  @Post('monthly-closes')
  close(
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body()
    body: {
      branchId: string;
      period: string;
      controlHash: string;
      reason: string;
      expectedVersion: number;
    },
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.respond(
      response,
      this.finance.closeMonth(req.principal, body, key, req.correlationId ?? 'unknown'),
    );
  }

  @Post('correction-journals')
  requestCorrection(
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body()
    body: {
      branchId: string;
      currentPeriod: string;
      referencePeriod: string;
      amountRp: number;
      reason: string;
    },
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.respond(
      response,
      this.finance.requestCorrection(req.principal, body, key, req.correlationId ?? 'unknown'),
    );
  }

  @Post('correction-journals/:id/:decision')
  decideCorrection(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('decision') decision: string,
    @Headers('idempotency-key') key: string,
    @Body() body: { reason: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.respond(
      response,
      this.finance.decideCorrection(
        req.principal,
        id,
        decision,
        body,
        key,
        req.correlationId ?? 'unknown',
      ),
    );
  }

  private async respond(
    response: Response,
    promise: Promise<{ status: number; body: unknown; replay: boolean }>,
  ) {
    const result = await promise;
    response.status(result.status);
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return { ...(result.body as object), idempotentReplay: result.replay };
  }
}
