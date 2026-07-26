import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ReschedulesController } from './reschedules.controller';
import { ReschedulesService } from './reschedules.service';

@Module({
  imports: [IdentityModule],
  controllers: [BookingsController, ReschedulesController],
  providers: [BookingsService, ReschedulesService],
})
export class BookingsModule {}
