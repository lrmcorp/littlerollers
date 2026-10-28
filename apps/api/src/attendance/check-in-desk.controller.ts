import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { CheckInDeskService } from './check-in-desk.service';

@Controller()
@UseGuards(AuthGuard)
export class CheckInDeskController {
  constructor(private readonly desk: CheckInDeskService) {}

  /** Kelas hari ini, kehadiran yang sudah tercatat, dan kelas yang perlu diputuskan atau ditutup. */
  @Get('attendance/desk')
  meja(@Req() req: AuthenticatedRequest, @Query('branchId') branchId?: string) {
    return this.desk.meja(req.principal, { branchId });
  }

  /** Kelas tetap berjalan walau di bawah kuota minimum; dicatat dan dilaporkan ke Super Owner. */
  @Post('attendance/desk/:classSlotId/continue-below-quota')
  tetapJalan(
    @Req() req: AuthenticatedRequest,
    @Param('classSlotId') classSlotId: string,
    @Body() body: { reason?: string },
  ) {
    return this.desk.tetapJalan(req.principal, classSlotId, body ?? {});
  }
}
