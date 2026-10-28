import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { NoShowService } from './no-show.service';

@Controller()
@UseGuards(AuthGuard)
export class NoShowController {
  constructor(private readonly noShow: NoShowService) {}

  /** Peserta yang tidak hadir dan sesinya hangus pada satu rentang tanggal. */
  @Get('attendance/no-shows')
  report(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('until') until?: string,
    @Query('period') period?: string,
  ) {
    return this.noShow.report(req.principal, { branchId, from, until, period });
  }
}
