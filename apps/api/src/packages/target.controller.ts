import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { TargetService, type SetTargetInput } from './target.service';

@Controller()
@UseGuards(AuthGuard)
export class TargetController {
  constructor(private readonly target: TargetService) {}

  /** Memasang atau mengubah target satu cabang pada satu periode. Hanya Super Owner. */
  @Post('targets')
  set(@Req() req: AuthenticatedRequest, @Body() body: SetTargetInput) {
    return this.target.setTarget(req.principal, body);
  }

  /**
   * Target satu cabang beserta lajunya. Tanpa `branchId` berarti target gabungan semua cabang.
   * Tanpa `period` memakai bulan berjalan.
   */
  @Get('targets/pace')
  pace(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('period') period?: string,
  ) {
    return this.target.paceUntuk(req.principal, {
      branchId: branchId ?? null,
      period: period ?? new Date().toISOString().slice(0, 7),
    });
  }

  /** Semua target pada satu periode, disaring menurut cabang yang boleh dilihat pemanggil. */
  @Get('targets')
  semua(@Req() req: AuthenticatedRequest, @Query('period') period?: string) {
    return this.target.semuaPace(req.principal, period ?? new Date().toISOString().slice(0, 7));
  }
}
