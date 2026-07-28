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
import { OperationsService } from './operations.service';

@Controller('operations')
@UseGuards(AuthGuard)
export class OperationsController {
  constructor(private readonly operations: OperationsService) {}

  @Get('email-deliveries')
  listEmailDeliveries(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.operations.listEmailDeliveries(req.principal, status, cursor);
  }

  @Post('email-deliveries/:id/retry')
  retryEmailDelivery(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.operations.retryEmailDelivery(
      req.principal,
      id,
      body.reason,
      req.correlationId ?? 'unknown',
    );
  }

  @Get('jobs')
  list(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.operations.list(req.principal, status, cursor);
  }

  @Post('quota-evaluations/:id/run')
  async run(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') key: string,
    @Body() body: { expectedDueAt: string; expectedVersion: number },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.operations.run(
      req.principal,
      id,
      body,
      key,
      req.correlationId ?? 'unknown',
    );
    response.status(result.status);
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return { ...(result.body as object), idempotentReplay: result.replay };
  }
}
