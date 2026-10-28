import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { TargetService } from './target.service';

@Controller()
@UseGuards(AuthGuard)
export class TargetController {
  constructor(private readonly target: TargetService) {}

  /**
   * Laju pencapaian target. Nilai targetnya dikirim pemanggil lewat `targetRp`; layanan ini tidak
   * menyimpan target di mana pun dan hanya membaca tabel pembelian yang sudah ada.
   */
  @Get('targets/pace')
  pace(
    @Req() req: AuthenticatedRequest,
    @Query('targetRp') targetRp: string,
    @Query('branchId') branchId?: string,
    @Query('period') period?: string,
  ) {
    return this.target.pace(req.principal, {
      branchId: branchId ?? null,
      period,
      targetRp: Number.parseInt(targetRp, 10),
    });
  }
}
