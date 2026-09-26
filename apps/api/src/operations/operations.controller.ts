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
  listJobs(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.operations.listJobs(req.principal, status, cursor);
  }

  @Post('jobs/:id/retry')
  retryJob(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { reasonCommand?: { reason: string }; reason?: string },
  ) {
    const reason = body?.reasonCommand?.reason ?? body?.reason ?? 'Manual retry';
    return this.operations.retryJob(req.principal, id, reason);
  }

  @Post('jobs/:id/dead-letter')
  deadLetterJob(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { reasonCommand?: { reason: string }; reason?: string },
  ) {
    const reason = body?.reasonCommand?.reason ?? body?.reason ?? 'Manual dead-letter';
    return this.operations.deadLetterJob(req.principal, id, reason);
  }

  // Kontrak generated client: POST /operations/quota-evaluations/{id}/run.
  @Post('quota-evaluations/:id/run')
  runQuotaEvaluation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.operations.runQuotaEvaluation(req.principal, id);
  }
}
