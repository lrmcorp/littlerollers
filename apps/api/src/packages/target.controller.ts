import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { TargetService } from './target.service';

@Controller()
@UseGuards(AuthGuard)
export class TargetController {
  constructor(private readonly target: TargetService) {}

  /**
   * Laju pencapaian target. Targetnya dibaca dari `Cabang.monthlyTargetRp`; `targetRpOverride`
   * hanya untuk simulasi dan tidak mengubah yang tersimpan. Tanpa `branchId`, target dan omzet
   * dijumlahkan dari cabang yang boleh dilihat pemanggil.
   */
  @Get('targets/pace')
  pace(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('period') period?: string,
    @Query('targetRpOverride') targetRpOverride?: string,
  ) {
    const simulasi = targetRpOverride ? Number.parseInt(targetRpOverride, 10) : undefined;
    return this.target.pace(req.principal, {
      branchId: branchId ?? null,
      period,
      targetRpOverride: Number.isFinite(simulasi) ? simulasi : undefined,
    });
  }
}
