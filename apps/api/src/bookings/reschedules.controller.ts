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
import {
  ReschedulesService,
  type RescheduleDecisionCommand,
  type RescheduleRequestCommand,
} from './reschedules.service';

@Controller('reschedules')
@UseGuards(AuthGuard)
export class ReschedulesController {
  constructor(private readonly reschedules: ReschedulesService) {}

  @Get()
  list(
    @Req() request: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.reschedules.list(request.principal, { branchId, status, cursor });
  }

  @Post()
  async request(
    @Req() request: AuthenticatedRequest,
    @Headers('idempotency-key') key: string,
    @Body() body: RescheduleRequestCommand,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.reschedules.request(
      request.principal,
      body,
      key,
      request.correlationId ?? 'unknown',
    );
    response.status(result.status);
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return { ...(result.body as object), idempotentReplay: result.replay };
  }

  @Post(':id/:decision')
  async decide(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('decision') decision: 'approve' | 'reject',
    @Headers('idempotency-key') key: string,
    @Body() body: RescheduleDecisionCommand,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.reschedules.decide(
      request.principal,
      id,
      decision,
      body,
      key,
      request.correlationId ?? 'unknown',
    );
    response.status(result.status);
    response.setHeader('Idempotency-Replayed', String(result.replay));
    return { ...(result.body as object), idempotentReplay: result.replay };
  }
}
