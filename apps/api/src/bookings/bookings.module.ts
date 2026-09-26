import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './pemesanan-kelas.service';
import { ReschedulesController } from './reschedules.controller';
import { ReschedulesService } from './ubah-jadwal.service';

@Module({
  imports: [IdentityModule],
  controllers: [BookingsController, ReschedulesController],
  providers: [BookingsService, ReschedulesService],
})
export class BookingsModule {}

