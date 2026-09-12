import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { MigrationService } from './migration.service';

@Controller('internal/migrations')
@UseGuards(AuthGuard)
export class MigrationController {
  constructor(private readonly migrations: MigrationService) {}

  @Get('batches')
  listBatches(@Req() request: AuthenticatedRequest, @Query('cursor') cursor?: string) {
    return this.migrations.listBatches(request.principal, cursor);
  }

  @Get('batches/:id')
  getBatch(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.migrations.getBatch(request.principal, id);
  }

  @Get('batches/:id/control-totals')
  listControlTotals(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.migrations.listControlTotals(request.principal, id);
  }

  @Get('cdc')
  cdcOverview(@Req() request: AuthenticatedRequest) {
    return this.migrations.cdcOverview(request.principal);
  }

  @Get('batches/:id/rejects')
  listRejects(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.migrations.listRejects(request.principal, id, status, cursor);
  }

  @Get('batches/:id/resolutions')
  listResolutions(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.migrations.listResolutions(request.principal, id, status, cursor);
  }

  @Post('resolutions/:id/decision')
  decideResolution(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('idempotency-key') idempotencyKey: string,
    @Headers('x-migration-step-up') stepUpToken: string,
    @Body() body: { approve: boolean; reason: string; decision?: Record<string, unknown> },
  ) {
    return this.migrations.decideResolution(
      request.principal,
      id,
      body,
      idempotencyKey,
      stepUpToken,
      request.correlationId ?? 'unknown',
    );
  }
}
