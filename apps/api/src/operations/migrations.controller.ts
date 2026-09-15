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
  controlTotals(@Param('id') id: string) {
    return this.migrations.controlTotals(id);
  }

  @Get('batches/:id/rejects')
  rejects(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.migrations.rejects(id, cursor);
  }

  @Get('batches/:id/resolutions')
  resolutions(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.migrations.resolutions(id, cursor);
  }

  @Post('resolutions/:id/decision')
  decideResolution(
    @Param('id') id: string,
    @Body() body: { approve: boolean; reason: string; decision: Record<string, unknown> },
  ) {
    return this.migrations.decideResolution(id, body);
  }
}
