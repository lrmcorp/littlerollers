import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './pemesanan-kelas.service';
import { ReschedulesController } from './reschedules.controller';
import { ReschedulesService } from './ubah-jadwal.service';
import { SessionAdjustController } from './session-adjust.controller';
import { SessionAdjustService } from './session-adjust.service';

@Module({
  imports: [IdentityModule],
  controllers: [
    BookingsController,
    ReschedulesController,
    SessionAdjustController,
  ],
  providers: [BookingsService, ReschedulesService, SessionAdjustService],
})
export class BookingsModule {}

