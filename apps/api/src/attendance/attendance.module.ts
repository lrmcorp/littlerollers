import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { FoundationModule } from '../foundation/foundation.module';
import { AttendanceController } from './attendance.controller';
import { PublicAttendanceController } from './public-attendance.controller';
import { AttendanceService } from './kehadiran.service';
import { KioskAccessService } from './kiosk-access.service';
import { KioskAdminController } from './kiosk-admin.controller';
import { NoShowController } from './no-show.controller';
import { CheckInDeskController } from './check-in-desk.controller';
import { CheckInDeskService } from './check-in-desk.service';
import { StudioCheckInService } from './studio-check-in.service';
import { NoShowService } from './no-show.service';
import { StudioScanService } from './studio-scan.service';

@Module({
  imports: [IdentityModule, FoundationModule],
  controllers: [
    AttendanceController,
    PublicAttendanceController,
    KioskAdminController,
    NoShowController,
    CheckInDeskController,
  ],
  providers: [
    AttendanceService,
    KioskAccessService,
    NoShowService,
    StudioScanService,
    CheckInDeskService,
    StudioCheckInService,
  ],
})
export class AttendanceModule {}
