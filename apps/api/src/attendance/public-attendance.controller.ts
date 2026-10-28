import { Public } from '../identity/route-access';
import { Body, Controller, Get, Headers, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AttendanceService } from './kehadiran.service';
import { KioskAccessService } from './kiosk-access.service';
import { StudioCheckInService } from './studio-check-in.service';

@Public()
@Controller('check-ins')
export class PublicAttendanceController {
  constructor(
    private readonly attendance: AttendanceService,
    private readonly kioskAccess: KioskAccessService,
    private readonly studioCheckIn: StudioCheckInService,
  ) {}

  @Get('customer-link-info')
  getCustomerLinkInfo(@Query('token') token: string) {
    return this.attendance.getCustomerLinkInfo(token);
  }

  @Post('customers/confirm-link')
  confirmCustomerLink(@Body() body: { token: string }) {
    return this.attendance.confirmCustomerLink(body.token);
  }

  /** Daftar studio untuk memilih cabang di tablet: hanya nama, kode, dan alamat. */
  @Get('kiosk/branches')
  getKioskBranches() {
    return this.attendance.getKioskBranches();
  }

  /** Buka kunci tablet dengan PIN cabang; menjawab token untuk header `x-kiosk-token`. */
  @Post('kiosk/:branchCode/unlock')
  unlockKiosk(
    @Param('branchCode') branchCode: string,
    @Body() body: { pin?: unknown },
    @Req() req: Request,
  ) {
    return this.kioskAccess.unlock(branchCode, body?.pin, req.ip ?? 'unknown');
  }

  @Get('kiosk/:branchCode')
  async getKioskDisplay(
    @Param('branchCode') branchCode: string,
    @Headers('x-kiosk-token') token?: string,
  ) {
    await this.kioskAccess.requireAccess(branchCode, token);
    return this.attendance.getKioskDisplay(branchCode);
  }

  /**
   * Tablet studio memindai QR tetap milik member atau instruktur. Hanya perangkat yang sudah
   * dibuka dengan PIN cabang yang bisa memanggilnya, jadi lokasi pemindaian ikut terbukti.
   */
  @Post('kiosk/:branchCode/scan')
  scanAtStudio(
    @Param('branchCode') branchCode: string,
    @Body() body: { pass?: unknown },
    @Headers('x-kiosk-token') token?: string,
  ) {
    return this.studioCheckIn.pindai(branchCode, token, body?.pass);
  }

  /** Siapa saja yang sudah tercatat hari ini, untuk daftar singkat di layar studio. */
  @Get('kiosk/:branchCode/today')
  kioskToday(@Param('branchCode') branchCode: string, @Headers('x-kiosk-token') token?: string) {
    return this.studioCheckIn.hariIni(branchCode, token);
  }
}
