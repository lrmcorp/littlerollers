import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { FoundationModule } from '../foundation/foundation.module';
import { AttendanceController } from './attendance.controller';
import { PublicAttendanceController } from './public-attendance.controller';
import { AttendanceService } from './kehadiran.service';
import { KioskAccessService } from './kiosk-access.service';
import { KioskAdminController } from './kiosk-admin.controller';

@Module({
  imports: [IdentityModule, FoundationModule],
  controllers: [AttendanceController, PublicAttendanceController, KioskAdminController],
  providers: [AttendanceService, KioskAccessService],
})
export class AttendanceModule {}
