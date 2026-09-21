import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { FoundationModule } from '../foundation/foundation.module';
import { AttendanceController } from './attendance.controller';
import { PublicAttendanceController } from './public-attendance.controller';
import { AttendanceService } from './kehadiran.service';

@Module({
  imports: [IdentityModule, FoundationModule],
  controllers: [AttendanceController, PublicAttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
