import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { PublicContentManagementService } from './public-content-management.service';

@Controller('public-content-management')
@UseGuards(AuthGuard)
export class PublicContentManagementController {
  constructor(private readonly content: PublicContentManagementService) {}

  /** Isi yang sedang tampil di situs, satu per jenis konten. */
  @Get() list(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('kind') kind?: string,
  ) {
    return this.content.list(req.principal, { branchId, kind });
  }

  /** Simpan dan langsung tampilkan (HERO_CAROUSEL atau FAQ). */
  @Put(':kind') save(
    @Req() req: AuthenticatedRequest,
    @Param('kind') kind: string,
    @Body() body: { payload: unknown },
  ) {
    return this.content.save(req.principal, kind, body, req.correlationId ?? 'unknown');
  }

  /** Kembalikan situs ke tampilan bawaan. */
  @Post(':kind/reset') reset(
    @Req() req: AuthenticatedRequest,
    @Param('kind') kind: string,
    @Body() body?: { reason?: string },
  ) {
    return this.content.reset(req.principal, kind, req.correlationId ?? 'unknown', body?.reason);
  }
}
