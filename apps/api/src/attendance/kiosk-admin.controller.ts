import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../identity/auth.guard';
import { KioskAccessService } from './kiosk-access.service';

/** Staf mengatur PIN tablet kiosk per cabang. Otorisasi (branch:manage + cakupan cabang) dicek di service. */
@Controller('kiosk-access')
@UseGuards(AuthGuard)
export class KioskAdminController {
  constructor(private readonly kioskAccess: KioskAccessService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.kioskAccess.list(req.principal);
  }

  @Post(':branchId/pin')
  rotate(@Req() req: AuthenticatedRequest, @Param('branchId') branchId: string) {
    return this.kioskAccess.rotatePin(req.principal, branchId, req.correlationId ?? 'unknown');
  }
}
