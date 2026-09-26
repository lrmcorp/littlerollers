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
import { MigrationsService } from './migrations.service';

@Controller('internal/migrations')
@UseGuards(AuthGuard)
export class MigrationsController {
  constructor(private readonly migrations: MigrationsService) {}

  @Get('cdc')
  cdc(@Req() req: AuthenticatedRequest) {
    return this.migrations.cdc(req.principal);
  }

  @Get('batches')
  listBatches(
    @Req() req: AuthenticatedRequest,
    @Query('cursor') cursor?: string,
  ) {
    return this.migrations.listBatches(req.principal, cursor);
  }

  @Get('batches/:id/control-totals')
  controlTotals(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.migrations.controlTotals(req.principal, id);
  }

  @Get('batches/:id/rejects')
  rejects(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.migrations.rejects(req.principal, id, cursor);
  }

  @Get('batches/:id/resolutions')
  resolutions(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.migrations.resolutions(req.principal, id, cursor);
  }

  @Post('resolutions/:id/decision')
  decideResolution(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { approve: boolean; reason: string; decision: Record<string, unknown> },
  ) {
    return this.migrations.decideResolution(req.principal, id, body);
  }
}
